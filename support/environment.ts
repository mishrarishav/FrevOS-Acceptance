const targetEnvironments = ["fixture", "preview", "uat"] as const;

export type TargetEnvironment = (typeof targetEnvironments)[number];

export interface AcceptanceEnvironment {
  readonly baseUrl: string;
  readonly targetEnvironment: TargetEnvironment;
}

const defaultFixtureUrl = "http://127.0.0.1:4173/";
const loopbackHosts = new Set(["127.0.0.1", "[::1]", "localhost"]);

function parseTargetEnvironment(value: string | undefined): TargetEnvironment {
  const candidate = value ?? "fixture";
  if (!targetEnvironments.includes(candidate as TargetEnvironment)) {
    throw new Error("FREVOS_TARGET_ENV must be fixture, preview, or uat");
  }
  return candidate as TargetEnvironment;
}

function parseBaseUrl(value: string): URL {
  try {
    return new URL(value);
  } catch {
    throw new Error("FREVOS_BASE_URL must be an absolute URL");
  }
}

export function readAcceptanceEnvironment(
  environment: Readonly<NodeJS.ProcessEnv>,
): AcceptanceEnvironment {
  const { FREVOS_BASE_URL: configuredBaseUrl, FREVOS_TARGET_ENV: configuredTargetEnvironment } =
    environment;
  const targetEnvironment = parseTargetEnvironment(configuredTargetEnvironment);

  if (!configuredBaseUrl && targetEnvironment !== "fixture") {
    throw new Error("FREVOS_BASE_URL is required for preview and uat targets");
  }

  const baseUrl = parseBaseUrl(configuredBaseUrl ?? defaultFixtureUrl);
  if (!new Set(["http:", "https:"]).has(baseUrl.protocol)) {
    throw new Error("FREVOS_BASE_URL must use HTTP or HTTPS");
  }
  if (baseUrl.username || baseUrl.password) {
    throw new Error("FREVOS_BASE_URL must not contain credentials");
  }
  if (baseUrl.search || baseUrl.hash) {
    throw new Error("FREVOS_BASE_URL must not contain a query or fragment");
  }

  if (targetEnvironment === "fixture") {
    if (baseUrl.protocol !== "http:" || !loopbackHosts.has(baseUrl.hostname)) {
      throw new Error("The fixture target must use an HTTP loopback URL");
    }
    const fixturePort = Number(baseUrl.port);
    if (baseUrl.pathname !== "/" || !Number.isInteger(fixturePort) || fixturePort < 1024) {
      throw new Error(
        "The fixture target must use the root path and an explicit unprivileged port",
      );
    }
  } else if (baseUrl.protocol !== "https:") {
    throw new Error("Preview and uat targets require HTTPS");
  }

  return Object.freeze({
    baseUrl: baseUrl.toString(),
    targetEnvironment,
  });
}
