import { access, readFile, readdir } from "node:fs/promises";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const ignoredDirectories = new Set([
  ".git",
  "artifacts",
  "blob-report",
  "node_modules",
  "playwright-report",
  "test-results",
]);
const requiredFiles = [
  ".env.example",
  ".github/pull_request_template.md",
  ".github/rulesets/protect-main.json",
  ".github/workflows/ci.yml",
  "AGENTS.md",
  "CONTRIBUTING.md",
  "README.md",
  "SECURITY.md",
  "docs/ACCEPTANCE_COVERAGE.md",
  "docs/CURRENT_STATE.md",
  "docs/ENVIRONMENT_CONTRACT.md",
  "docs/EVIDENCE_POLICY.md",
  "docs/TEST_INTEGRITY.md",
  "docs/adr/0001-independent-black-box-harness.md",
  "docs/adr/README.md",
  "playwright.config.ts",
  "support/no-skipped-tests-reporter.ts",
];
const forbiddenTestPatterns = [
  [/(?<![A-Za-z])test\.(?:skip|fixme|only)\b/, "skipped, fixed, or focused test"],
  [/test\.describe\.(?:skip|fixme|only)\b/, "skipped, fixed, or focused suite"],
  [/\bwaitForTimeout\s*\(/, "arbitrary timeout"],
  [/\bforce\s*:\s*true\b/, "forced browser interaction"],
  [/\bexpect\.soft\s*\(/, "non-blocking assertion"],
  [/\.(?:toBeTruthy|toBeDefined)\s*\(/, "weak existence-only assertion"],
];
const exactVersion = /^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/;
const errors = [];

async function pathExists(path) {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

async function collectFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const entryPath = join(directory, entry.name);
    if (entry.isSymbolicLink()) {
      errors.push(`${relative(repositoryRoot, entryPath)} must not be a symbolic link`);
      continue;
    }
    if (entry.isDirectory() && ignoredDirectories.has(entry.name)) {
      continue;
    }
    if (entry.isDirectory()) {
      files.push(...(await collectFiles(entryPath)));
    } else if (entry.isFile()) {
      files.push(entryPath);
    }
  }

  return files;
}

function validateDocumentStructure(file, content) {
  const repositoryPath = relative(repositoryRoot, file);
  const lines = content.split("\n");

  for (const [index, line] of lines.entries()) {
    if (/[\t ]+$/.test(line)) {
      errors.push(`${repositoryPath}:${index + 1} has trailing whitespace`);
    }
  }

  if (!repositoryPath.startsWith(".github/")) {
    const topLevelHeadings = lines.filter((line) => line.startsWith("# ")).length;
    if (topLevelHeadings !== 1) {
      errors.push(`${repositoryPath} must contain exactly one top-level heading`);
    }
  }

  const codeFences = lines.filter((line) => line.startsWith("```")).length;
  if (codeFences % 2 !== 0) {
    errors.push(`${repositoryPath} has unbalanced fenced code blocks`);
  }
}

async function validateRelativeLinks(file, content) {
  const repositoryPath = relative(repositoryRoot, file);
  const markdownLink = /\[[^\]]+\]\(([^)]+)\)/g;

  for (const match of content.matchAll(markdownLink)) {
    let target = match[1];
    if (!target || /^(?:[a-z]+:|#)/i.test(target)) {
      continue;
    }

    target = target.replace(/^<|>$/g, "").split("#", 1)[0];
    if (!target) {
      continue;
    }

    let decodedTarget;
    try {
      decodedTarget = decodeURIComponent(target);
    } catch {
      errors.push(`${repositoryPath} contains an invalid encoded link: ${target}`);
      continue;
    }

    const targetPath = resolve(dirname(file), decodedTarget);
    if (!(await pathExists(targetPath))) {
      errors.push(`${repositoryPath} links to missing path ${target}`);
    }
  }
}

async function validatePackageManifest() {
  const manifest = JSON.parse(await readFile(join(repositoryRoot, "package.json"), "utf8"));
  if (manifest.private !== true) {
    errors.push("The acceptance package must remain private");
  }

  const dependencies = {
    ...(manifest.dependencies ?? {}),
    ...(manifest.devDependencies ?? {}),
  };
  for (const [name, version] of Object.entries(dependencies)) {
    if (name.startsWith("@frevos/")) {
      errors.push(`Production workspace dependency is prohibited: ${name}`);
    }
    if (typeof version !== "string" || !exactVersion.test(version)) {
      errors.push(`Direct dependency ${name} must use an exact registry version`);
    }
  }
}

async function validateWorkflow() {
  const workflow = await readFile(join(repositoryRoot, ".github/workflows/ci.yml"), "utf8");
  const actionReferences = [...workflow.matchAll(/uses:\s+([^\s]+)@([^\s#]+)/g)];
  if (actionReferences.length < 4) {
    errors.push("Acceptance CI must declare every required action explicitly");
  }
  for (const [, action, reference] of actionReferences) {
    if (!/^[a-f0-9]{40}$/.test(reference)) {
      errors.push(`GitHub Action ${action} must use a full commit SHA`);
    }
  }
  if (!/permissions:\s*\n\s+contents:\s+read/.test(workflow)) {
    errors.push("Acceptance CI must keep repository contents read-only");
  }
  if (/\$\{\{\s*secrets\./.test(workflow)) {
    errors.push("Phase 2 CI must not consume GitHub secrets");
  }
}

async function validateRuleset() {
  const ruleset = JSON.parse(
    await readFile(join(repositoryRoot, ".github/rulesets/protect-main.json"), "utf8"),
  );
  const ruleByType = new Map(ruleset.rules?.map((rule) => [rule.type, rule]));
  const pullRequest = ruleByType.get("pull_request")?.parameters;
  const statusChecks = ruleByType.get("required_status_checks")?.parameters;

  if (ruleset.name !== "Protect main" || ruleset.enforcement !== "active") {
    errors.push("Protect main desired ruleset must remain active");
  }
  if (!ruleByType.has("deletion") || !ruleByType.has("non_fast_forward")) {
    errors.push("Protect main must block deletion and force updates");
  }
  if (
    pullRequest?.required_approving_review_count !== 0 ||
    pullRequest?.required_review_thread_resolution !== true ||
    pullRequest?.allowed_merge_methods?.join(",") !== "squash"
  ) {
    errors.push("Protect main pull-request controls differ from the accepted baseline");
  }
  if (
    statusChecks?.strict_required_status_checks_policy !== true ||
    statusChecks?.required_status_checks?.length !== 1 ||
    statusChecks.required_status_checks[0]?.context !== "validate"
  ) {
    errors.push("Protect main must require the stable, up-to-date validate check");
  }
}

async function validateTestIntegrity(testFiles) {
  if (testFiles.length < 2) {
    errors.push("The harness must include environment and browser test specifications");
  }

  for (const file of testFiles) {
    const content = await readFile(file, "utf8");
    const repositoryPath = relative(repositoryRoot, file);
    for (const [pattern, description] of forbiddenTestPatterns) {
      if (pattern.test(content)) {
        errors.push(`${repositoryPath} contains a prohibited ${description}`);
      }
    }
    if (/@frevos\/|(?:from|require\s*\()[^\n]*(?:FrevOS\/|FrevOS\\\\)/i.test(content)) {
      errors.push(`${repositoryPath} couples acceptance tests to production source`);
    }
  }
}

for (const requiredFile of requiredFiles) {
  if (!(await pathExists(join(repositoryRoot, requiredFile)))) {
    errors.push(`Required file is missing: ${requiredFile}`);
  }
}

const files = await collectFiles(repositoryRoot);
const markdownFiles = files.filter((file) => file.endsWith(".md"));
for (const file of markdownFiles) {
  const content = await readFile(file, "utf8");
  validateDocumentStructure(file, content);
  await validateRelativeLinks(file, content);
}

const unexpectedEnvironmentFiles = files.filter((file) => {
  const name = relative(repositoryRoot, file);
  return name.startsWith(".env") && name !== ".env.example";
});
for (const file of unexpectedEnvironmentFiles) {
  errors.push(`Local environment file must not be tracked: ${relative(repositoryRoot, file)}`);
}

await validatePackageManifest();
await validateWorkflow();
await validateRuleset();
await validateTestIntegrity(files.filter((file) => /tests\/.*\.spec\.ts$/.test(file)));

if (errors.length > 0) {
  for (const error of errors) {
    console.error(`ERROR: ${error}`);
  }
  process.exitCode = 1;
} else {
  console.log(
    `Acceptance repository validation passed (${markdownFiles.length} Markdown files, ${files.length} governed files).`,
  );
}
