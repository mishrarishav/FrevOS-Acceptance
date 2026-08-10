import type { FullResult, Reporter, TestCase, TestResult } from "@playwright/test/reporter";

export default class NoSkippedTestsReporter implements Reporter {
  readonly #skippedTests = new Set<string>();

  onTestEnd(test: TestCase, result: TestResult): void {
    if (result.status === "skipped") {
      this.#skippedTests.add(test.titlePath().join(" > "));
    }
  }

  async onEnd(): Promise<{ status: FullResult["status"] } | undefined> {
    if (this.#skippedTests.size === 0) {
      return undefined;
    }

    for (const title of this.#skippedTests) {
      console.error(`ERROR: skipped acceptance test: ${title}`);
    }
    return { status: "failed" };
  }
}
