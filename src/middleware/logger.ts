import { getCambodiaTimestamp } from "../utils/timestamp";

export interface LoggerRequest {
  method?: string;
  originalUrl?: string;
  url?: string;
  ip?: string;
  baseUrl?: string;
  path?: string;
  body?: unknown;
  route?: {
    path?: unknown;
    stack?: Array<{
      name?: string;
      handle?: unknown;
    }>;
  };
  headers?: Record<string, string | string[] | undefined>;
  get?: (name: string) => string | undefined;
  user?: unknown;
}

export interface LoggerResponse {
  statusCode?: number;
  on?: (event: "finish", listener: () => void) => unknown;
  json?: (body: unknown) => unknown;
}

export type LoggerNext = () => void;

export interface LoggerOptions {
  enabled?: boolean;
  projectName?: string;
  includeRequestFrom?: boolean;
  includeIp?: boolean;
  includeUserAgent?: boolean;
  includeRouteContext?: boolean;
  includeRequestData?: boolean;
  includeResponseData?: boolean;
  maxRequestDataLength?: number;
  maxResponseDataLength?: number;
  redactFields?: readonly string[];
  controllerFileSuffix?: string;
  sourceFile?: string;
  sourceMethod?: string;
  getSourceFile?: (req: LoggerRequest) => string | undefined;
  getSourceMethod?: (req: LoggerRequest) => string | undefined;
  getUser?: (req: LoggerRequest) => string | undefined;
  log?: (message: string) => void;
  logger?: (message: string) => void;
}

export type LoggerConfig = LoggerOptions;
export type RequestLoggerRequest = LoggerRequest;
export type RequestLoggerResponse = LoggerResponse;
export type RequestLoggerNext = LoggerNext;
export type RequestLoggerOptions = LoggerOptions;
export type RequestLoggerConfig = LoggerConfig;

type ProcessLike = {
  argv?: string[];
  env?: Record<string, string | undefined>;
};

const DEFAULT_REDACT_FIELDS = [
  "password",
  "passcode",
  "token",
  "accessToken",
  "refreshToken",
  "authorization",
  "secret",
  "apiKey",
] as const;

let globalLoggerConfig: LoggerConfig = {};

export function configureLogger(config: LoggerConfig): void {
  globalLoggerConfig = {
    ...globalLoggerConfig,
    ...config,
  };
}

export function resetLoggerConfig(): void {
  globalLoggerConfig = {};
}

function getLevel(statusCode?: number): "INFO" | "WARN" | "ERROR" {
  if (statusCode === undefined) {
    return "INFO";
  }

  if (statusCode >= 500) {
    return "ERROR";
  }

  if (statusCode >= 400) {
    return "WARN";
  }

  return "INFO";
}

function getHeader(req: LoggerRequest, name: string): string | undefined {
  const fromGetter = req.get?.(name);

  if (fromGetter) {
    return fromGetter;
  }

  const value = req.headers?.[name.toLowerCase()];

  return Array.isArray(value) ? value.join(", ") : value;
}

function getDefaultProjectName(): string {
  const processLike = (globalThis as { process?: ProcessLike }).process;
  const packageJsonPathParts =
    processLike?.env?.npm_package_json?.split(/[\\/]/);

  return (
    processLike?.env?.APP_NAME ??
    processLike?.env?.npm_package_name ??
    (packageJsonPathParts && packageJsonPathParts.length > 1
      ? packageJsonPathParts[packageJsonPathParts.length - 2]
      : undefined) ??
    "app"
  );
}

function getFileNameFromPath(path?: string): string | undefined {
  const fileName = path?.split(/[\\/]/).filter(Boolean).pop();

  return fileName && fileName.includes(".") ? fileName : undefined;
}

function getRuntimeSourceFile(): string | undefined {
  const processLike = (globalThis as { process?: ProcessLike }).process;
  const entryFile = processLike?.argv?.[1];

  if (
    !entryFile ||
    /[\\/]node_modules[\\/]/.test(entryFile) ||
    /[\\/]\.bin[\\/]/.test(entryFile) ||
    /(?:vitest|tsx|ts-node|nodemon)(?:\.[cm]?js)?$/i.test(entryFile)
  ) {
    return undefined;
  }

  return getFileNameFromPath(entryFile);
}

function formatUser(user: unknown): string | undefined {
  if (typeof user === "string" || typeof user === "number") {
    return String(user);
  }

  if (!user || typeof user !== "object") {
    return undefined;
  }

  const record = user as Record<string, unknown>;

  for (const key of ["name", "username", "email", "id"]) {
    const value = record[key];

    if (typeof value === "string" || typeof value === "number") {
      return String(value);
    }
  }

  return undefined;
}

function getFunctionName(value: unknown): string | undefined {
  if (
    value &&
    (typeof value === "function" || typeof value === "object") &&
    "name" in value
  ) {
    const name = (value as { name?: unknown }).name;

    return typeof name === "string" ? name : undefined;
  }

  return undefined;
}

function normalizeHandlerName(name?: string): string | undefined {
  const normalized = name?.replace(/^bound\s+/, "").trim();

  if (
    !normalized ||
    normalized === "<anonymous>" ||
    normalized === "anonymous" ||
    normalized === "handler" ||
    normalized === "wrapped"
  ) {
    return undefined;
  }

  return normalized;
}

function getRouteHandlerName(req: LoggerRequest): string | undefined {
  const stack = req.route?.stack;

  if (!stack?.length) {
    return undefined;
  }

  for (const layer of [...stack].reverse()) {
    const name = normalizeHandlerName(
      getFunctionName(layer.handle) ?? layer.name,
    );

    if (name) {
      return name;
    }
  }

  return undefined;
}

function getFirstPathSegment(path?: string): string | undefined {
  return path
    ?.split(/[?#]/, 1)[0]
    ?.split("/")
    .filter(
      (segment) =>
        segment && !segment.startsWith(":") && segment.toLowerCase() !== "api",
    )[0];
}

function getLastPathSegment(path?: string): string | undefined {
  const segments = path
    ?.split(/[?#]/, 1)[0]
    ?.split("/")
    .filter((segment) => segment && !segment.startsWith(":"));

  return segments?.[segments.length - 1];
}

function getRoutePath(req: LoggerRequest): string | undefined {
  if (typeof req.route?.path === "string") {
    return req.route.path;
  }

  return req.path ?? req.originalUrl ?? req.url;
}

function getRouteControllerFile(
  req: LoggerRequest,
  suffix: string,
): string | undefined {
  const routeSegment = getFirstPathSegment(getRoutePath(req));
  const mountedRouterSegment = getLastPathSegment(req.baseUrl);
  const requestSegment = getFirstPathSegment(req.originalUrl ?? req.url);
  const segment = routeSegment ?? mountedRouterSegment ?? requestSegment;

  return segment ? `${segment}${suffix}` : undefined;
}

function hasEntries(value: unknown): value is Record<string, unknown> {
  return (
    !!value &&
    typeof value === "object" &&
    !Array.isArray(value) &&
    Object.keys(value).length > 0
  );
}

function sanitizeLogValue(
  value: unknown,
  redactFields: readonly string[],
): unknown {
  if (Array.isArray(value)) {
    return value.map((item) => sanitizeLogValue(item, redactFields));
  }

  if (!value || typeof value !== "object") {
    return value;
  }

  return Object.entries(value as Record<string, unknown>).reduce<
    Record<string, unknown>
  >((sanitized, [key, item]) => {
    const shouldRedact = redactFields.some(
      (field) => field.toLowerCase() === key.toLowerCase(),
    );

    sanitized[key] = shouldRedact
      ? "[REDACTED]"
      : sanitizeLogValue(item, redactFields);

    return sanitized;
  }, {});
}

function canLogRequestBody(method?: string): boolean {
  const normalizedMethod = method?.toUpperCase();

  return normalizedMethod !== "GET" && normalizedMethod !== "HEAD";
}

function formatRequestData(
  req: LoggerRequest,
  options: LoggerOptions,
): string | undefined {
  if (
    !canLogRequestBody(req.method) ||
    req.body === undefined ||
    !hasEntries(req.body)
  ) {
    return undefined;
  }

  const serialized = JSON.stringify(
    sanitizeLogValue(req.body, options.redactFields ?? DEFAULT_REDACT_FIELDS),
  );
  const maxLength = options.maxRequestDataLength ?? 500;

  return serialized.length > maxLength
    ? `${serialized.slice(0, maxLength)}...`
    : serialized;
}

function formatResponseData(
  responseBody: unknown,
  options: LoggerOptions,
): string | undefined {
  if (responseBody === undefined) {
    return undefined;
  }

  const serialized = JSON.stringify(
    sanitizeLogValue(
      responseBody,
      options.redactFields ?? DEFAULT_REDACT_FIELDS,
    ),
  );
  const maxLength = options.maxResponseDataLength ?? 2_000;

  return serialized.length > maxLength
    ? `${serialized.slice(0, maxLength)}...`
    : serialized;
}

export function formatRequestLog(input: {
  projectName?: string;
  method?: string;
  url?: string;
  statusCode?: number;
  durationMs: number;
  timestamp?: string;
  requestFrom?: string;
  ip?: string;
  userAgent?: string;
  sourceFile?: string;
  sourceMethod?: string;
  user?: string;
  requestData?: string;
  responseData?: string;
}): string {
  const requestFrom = input.requestFrom ?? input.ip;
  const requestSummary = [
    getLevel(input.statusCode),
    input.method ?? "REQUEST",
    input.url ?? "/",
    String(input.statusCode ?? 0),
    `${input.durationMs}ms`,
  ].join(" ");
  const baseParts = [
    `[${input.projectName ?? getDefaultProjectName()}]`,
    input.timestamp ?? getCambodiaTimestamp(),
    requestSummary,
    `file=${input.sourceFile ?? "unknown"}`,
    `method=${input.sourceMethod ?? input.method ?? "REQUEST"}`,
    `by=${input.user ?? "anonymous"}`,
  ];
  const extraParts: string[] = [];

  if (requestFrom) {
    extraParts.push(`from=${requestFrom}`);
  }

  if (input.userAgent) {
    extraParts.push(`ua="${input.userAgent}"`);
  }

  const baseMessage = [...baseParts, ...extraParts].join(" | ");

  const lines = [baseMessage];

  if (input.requestData) {
    lines.push(`request=${input.requestData}`);
  }

  if (input.responseData) {
    lines.push(`***response=${input.responseData}***`);
  }

  return lines.join("\n");
}

export function logger(options: LoggerOptions = {}) {
  const resolvedOptions = {
    ...globalLoggerConfig,
    ...options,
  };
  const log = resolvedOptions.log ?? resolvedOptions.logger ?? console.log;

  return (req: LoggerRequest, res: LoggerResponse, next: LoggerNext): void => {
    if (resolvedOptions.enabled === false) {
      next();
      return;
    }

    const startedAt = Date.now();
    let responseBody: unknown;
    const shouldIncludeRequestFrom =
      resolvedOptions.includeRequestFrom ?? resolvedOptions.includeIp ?? false;

    if (res.json) {
      const originalJson = res.json;

      res.json = function jsonWithLogging(
        this: LoggerResponse,
        body: unknown,
      ): unknown {
        responseBody = body;

        return originalJson.call(this, body);
      };
    }

    res.on?.("finish", () => {
      const durationMs = Date.now() - startedAt;
      const requestFrom = getHeader(req, "x-forwarded-for") ?? req.ip;
      const userAgent = getHeader(req, "user-agent");
      const shouldIncludeRouteContext =
        resolvedOptions.includeRouteContext ?? true;
      const routeSourceFile = shouldIncludeRouteContext
        ? getRouteControllerFile(
            req,
            resolvedOptions.controllerFileSuffix ?? ".controller.ts",
          )
        : undefined;
      const routeSourceMethod = shouldIncludeRouteContext
        ? getRouteHandlerName(req)
        : undefined;
      const sourceFile =
        resolvedOptions.getSourceFile?.(req) ??
        resolvedOptions.sourceFile ??
        getRuntimeSourceFile() ??
        routeSourceFile;
      const sourceMethod =
        resolvedOptions.getSourceMethod?.(req) ??
        resolvedOptions.sourceMethod ??
        routeSourceMethod;
      const user = resolvedOptions.getUser?.(req) ?? formatUser(req.user);
      const requestData =
        (resolvedOptions.includeRequestData ?? false)
          ? formatRequestData(req, resolvedOptions)
          : undefined;
      const responseData =
        (resolvedOptions.includeResponseData ?? true)
          ? formatResponseData(responseBody, resolvedOptions)
          : undefined;
      const message = formatRequestLog({
        ...(resolvedOptions.projectName
          ? { projectName: resolvedOptions.projectName }
          : {}),
        durationMs,
        ...(req.method ? { method: req.method } : {}),
        ...((req.originalUrl ?? req.url)
          ? { url: req.originalUrl ?? req.url }
          : {}),
        ...(res.statusCode !== undefined ? { statusCode: res.statusCode } : {}),
        ...(shouldIncludeRequestFrom && requestFrom ? { requestFrom } : {}),
        ...(resolvedOptions.includeUserAgent && userAgent ? { userAgent } : {}),
        ...(sourceFile ? { sourceFile } : {}),
        ...(sourceMethod ? { sourceMethod } : {}),
        ...(user ? { user } : {}),
        ...(requestData ? { requestData } : {}),
        ...(responseData ? { responseData } : {}),
      });

      log(message);
    });

    next();
  };
}

export const requestLogger = logger;
