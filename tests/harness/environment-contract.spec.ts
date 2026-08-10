import { expect, test } from "@playwright/test";
import { readAcceptanceEnvironment } from "../../support/environment.js";

test.describe("@harness environment contract", () => {
  test("defaults to the synthetic loopback fixture", () => {
    expect(readAcceptanceEnvironment({})).toEqual({
      baseUrl: "http://127.0.0.1:4173/",
      targetEnvironment: "fixture",
    });
  });

  test("accepts an HTTPS preview target without credentials", () => {
    expect(
      readAcceptanceEnvironment({
        FREVOS_BASE_URL: "https://preview.example.test/",
        FREVOS_TARGET_ENV: "preview",
      }),
    ).toEqual({
      baseUrl: "https://preview.example.test/",
      targetEnvironment: "preview",
    });
  });

  test("rejects Production, embedded credentials, and insecure remote targets", () => {
    expect(() => readAcceptanceEnvironment({ FREVOS_TARGET_ENV: "production" })).toThrow(
      "FREVOS_TARGET_ENV must be fixture, preview, or uat",
    );
    expect(() =>
      readAcceptanceEnvironment({
        FREVOS_BASE_URL: "https://user:password@preview.example.test/",
        FREVOS_TARGET_ENV: "preview",
      }),
    ).toThrow("FREVOS_BASE_URL must not contain credentials");
    expect(() =>
      readAcceptanceEnvironment({
        FREVOS_BASE_URL: "http://uat.example.test/",
        FREVOS_TARGET_ENV: "uat",
      }),
    ).toThrow("Preview and uat targets require HTTPS");
    expect(() =>
      readAcceptanceEnvironment({
        FREVOS_BASE_URL: "http://127.0.0.1/fixture/",
        FREVOS_TARGET_ENV: "fixture",
      }),
    ).toThrow("The fixture target must use the root path and an explicit unprivileged port");
  });
});
