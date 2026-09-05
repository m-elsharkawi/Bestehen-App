import { afterEach, describe, expect, it, vi } from "vitest";

const f = vi.hoisted(() => ({
  cookies: vi.fn(),
  attemptDependencies: vi.fn(),
  servingManifestDependencies: vi.fn(),
  contentDependencies: vi.fn(),
  create: vi.fn(),
  checkpoint: vi.fn(),
  submit: vi.fn(),
  assistance: vi.fn(),
  exposure: vi.fn(),
  acquireServingManifest: vi.fn(),
  defectReport: vi.fn(),
  contentImpact: vi.fn(),
}));

vi.mock("next/headers", () => ({ cookies: f.cookies }));
vi.mock("./attempt-command-runtime", () => ({
  getAttemptCommandDependencies: f.attemptDependencies,
  getServingManifestCommandDependencies: f.servingManifestDependencies,
}));
vi.mock("./attempt-commands", () => ({
  handleCreateAttempt: f.create,
  handleCheckpointAttempt: f.checkpoint,
  handleSubmitAttempt: f.submit,
  handleAssistanceAttempt: f.assistance,
  handleExposureAttempt: f.exposure,
}));
vi.mock("./serving-manifest-commands", () => ({
  handleAcquireServingManifest: f.acquireServingManifest,
}));
vi.mock("./content-runtime", () => ({ getContentCommandDependencies: f.contentDependencies }));
vi.mock("./content-commands", () => ({
  handleDefectReportCommand: f.defectReport,
  handleContentImpactCommand: f.contentImpact,
}));

import { POST as createAttempt } from "../app/api/v1/attempts/route";
import { POST as assistance } from "../app/api/v1/attempts/[id]/assistance/route";
import { POST as checkpoint } from "../app/api/v1/attempts/[id]/checkpoint/route";
import { POST as exposure } from "../app/api/v1/attempts/[id]/exposure/route";
import { POST as submit } from "../app/api/v1/attempts/[id]/submit/route";
import { POST as contentImpact } from "../app/api/v1/content/impacts/route";
import { POST as defectReport } from "../app/api/v1/content/reports/route";
import { POST as acquireServingManifest } from "../app/api/v1/serving-manifests/route";
import { requireSameOriginJsonMutation } from "./json-mutation-boundary";

const attemptId = "11111111-1111-4111-8111-111111111111";
const publicOrigin = "https://public.example.test";
const internalUrl = "http://web.internal:3000";

type Route = {
  readonly path: string;
  readonly handle: (request: Request) => Promise<Response>;
  readonly command: ReturnType<typeof vi.fn>;
};

const routes = [
  { path: "/api/v1/attempts", handle: createAttempt, command: f.create },
  {
    path: "/api/v1/serving-manifests",
    handle: acquireServingManifest,
    command: f.acquireServingManifest,
  },
  {
    path: "/api/v1/attempts/[id]/checkpoint",
    handle: (request) => checkpoint(request, { params: Promise.resolve({ id: attemptId }) }),
    command: f.checkpoint,
  },
  {
    path: "/api/v1/attempts/[id]/submit",
    handle: (request) => submit(request, { params: Promise.resolve({ id: attemptId }) }),
    command: f.submit,
  },
  {
    path: "/api/v1/attempts/[id]/assistance",
    handle: (request) => assistance(request, { params: Promise.resolve({ id: attemptId }) }),
    command: f.assistance,
  },
  {
    path: "/api/v1/attempts/[id]/exposure",
    handle: (request) => exposure(request, { params: Promise.resolve({ id: attemptId }) }),
    command: f.exposure,
  },
  { path: "/api/v1/content/reports", handle: defectReport, command: f.defectReport },
  { path: "/api/v1/content/impacts", handle: contentImpact, command: f.contentImpact },
] satisfies readonly Route[];

function request(
  path: string,
  options: {
    readonly method?: string;
    readonly headers?: Record<string, string>;
  } = {},
) {
  const json = vi.fn(async () => ({ command: "must-not-be-read" }));
  return {
    json,
    request: {
      method: options.method ?? "POST",
      url: `${internalUrl}${path}`,
      headers: new Headers(options.headers),
      json,
    } as unknown as Request,
  };
}

function validHeaders(): Record<string, string> {
  return {
    "content-type": "application/json; charset=utf-8",
    origin: publicOrigin,
    "sec-fetch-site": "same-origin",
    "x-bestehen-csrf": "1",
  };
}

function configurePublicOrigin() {
  vi.stubEnv("BESTEHEN_APP_ENV", "test");
  vi.stubEnv("BESTEHEN_RELEASE_COMMIT", "synthetic-commit");
  vi.stubEnv("DATABASE_URL", "postgresql://synthetic:synthetic@127.0.0.1:5432/synthetic");
  vi.stubEnv("BESTEHEN_APPLICATION_BASE_URL", publicOrigin);
}

function resetMocks() {
  vi.clearAllMocks();
  f.cookies.mockResolvedValue({ get: () => ({ value: "session" }) });
  f.attemptDependencies.mockReturnValue({ dependency: "attempt" });
  f.servingManifestDependencies.mockReturnValue({ dependency: "serving-manifest" });
  f.contentDependencies.mockReturnValue({ dependency: "content" });
  for (const command of [
    f.create,
    f.checkpoint,
    f.submit,
    f.assistance,
    f.exposure,
    f.acquireServingManifest,
    f.defectReport,
    f.contentImpact,
  ]) {
    command.mockResolvedValue(Response.json({ status: "completed" }));
  }
}

function expectNoRouteEffects(route: Route, json: ReturnType<typeof vi.fn>) {
  expect(json).not.toHaveBeenCalled();
  expect(f.cookies).not.toHaveBeenCalled();
  expect(route.command).not.toHaveBeenCalled();
  expect(f.attemptDependencies).not.toHaveBeenCalled();
  expect(f.servingManifestDependencies).not.toHaveBeenCalled();
  expect(f.contentDependencies).not.toHaveBeenCalled();
}

afterEach(() => {
  vi.unstubAllEnvs();
  resetMocks();
});

describe("Stage 05 JSON mutation transport boundary", () => {
  it("keeps an explicit inventory of every Stage 05 JSON mutation route", () => {
    expect(routes.map((route) => route.path)).toEqual([
      "/api/v1/attempts",
      "/api/v1/serving-manifests",
      "/api/v1/attempts/[id]/checkpoint",
      "/api/v1/attempts/[id]/submit",
      "/api/v1/attempts/[id]/assistance",
      "/api/v1/attempts/[id]/exposure",
      "/api/v1/content/reports",
      "/api/v1/content/impacts",
    ]);
  });

  it.each([
    ["wrong method", { method: "GET", headers: validHeaders() }],
    ["missing method", { method: "", headers: validHeaders() }],
    ["missing media type", { headers: { ...validHeaders(), "content-type": "" } }],
    [
      "JSON lookalike media type",
      { headers: { ...validHeaders(), "content-type": "application/jsonp" } },
    ],
    ["missing origin", { headers: { ...validHeaders(), origin: "" } }],
    ["wrong origin", { headers: { ...validHeaders(), origin: "https://attacker.example.test" } }],
    [
      "cross-site fetch metadata",
      { headers: { ...validHeaders(), "sec-fetch-site": "cross-site" } },
    ],
    ["missing CSRF proof", { headers: { ...validHeaders(), "x-bestehen-csrf": "" } }],
  ])("rejects %s before each route reads its body or reaches a command", async (_case, options) => {
    configurePublicOrigin();

    for (const route of routes) {
      resetMocks();
      const invalid = request(route.path.replace("[id]", attemptId), options);
      const response = await route.handle(invalid.request);

      expect(response.status).toBe(404);
      await expect(response.json()).resolves.toEqual({ status: "not_available" });
      expectNoRouteEffects(route, invalid.json);
    }
  });

  it("uses the proxy-canonical public origin before invoking the existing command boundary", async () => {
    configurePublicOrigin();
    resetMocks();
    const accepted = request("/api/v1/attempts", { headers: validHeaders() });

    const response = await createAttempt(accepted.request);

    expect(response.status).toBe(200);
    expect(accepted.json).toHaveBeenCalledOnce();
    expect(f.create).toHaveBeenCalledWith({ dependency: "attempt" }, "session", {
      command: "must-not-be-read",
    });
  });

  it("accepts only application/json with an optional UTF-8 charset", () => {
    configurePublicOrigin();
    for (const contentType of ["application/json", "application/json; charset=utf-8"]) {
      expect(
        requireSameOriginJsonMutation(
          request("/api/v1/attempts", {
            headers: { ...validHeaders(), "content-type": contentType },
          }).request,
        ),
      ).toBeUndefined();
    }
    for (const contentType of [
      "application/jsonp",
      "application/json; charset=latin1",
      "application/json; profile=unsafe",
    ]) {
      expect(
        requireSameOriginJsonMutation(
          request("/api/v1/attempts", {
            headers: { ...validHeaders(), "content-type": contentType },
          }).request,
        ),
      ).toMatchObject({ status: 404 });
    }
  });
});
