export interface RequestLoggerRequest {
  method?: string;
  originalUrl?: string;
  url?: string;
  ip?: string;
  baseUrl?: string;
  path?: string;
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

export interface RequestLoggerResponse {
  statusCode?: number;
  on?: (event: "finish", listener: () => void) => unknown;
}

export type RequestLoggerNext = () => void;

export interface RequestLoggerOptions {
  enabled?: boolean;
  projectName?: string;
  includeRequestFrom?: boolean;
  includeIp?: boolean;
  includeUserAgent?: boolean;
  includeRouteContext?: boolean;
  controllerFileSuffix?: string;
  sourceFile?: string;
  sourceMethod?: string;
  getSourceFile?: (req: RequestLoggerRequest) => string | undefined;
  getSourceMethod?: (req: RequestLoggerRequest) => string | undefined;
  getUser?: (req: RequestLoggerRequest) => string | undefined;
  log?: (message: string) => void;
  logger?: (message: string) => void;
}

export type RequestLoggerConfig = RequestLoggerOptions;

type ProcessLike = {
  env?: Record<string, string | undefined>;
};

let globalLoggerConfig: RequestLoggerConfig = {};

export function configureLogger(config: RequestLoggerConfig): void {
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

function getHeader(
  req: RequestLoggerRequest,
  name: string,
): string | undefined {
  const fromGetter = req.get?.(name);

  if (fromGetter) {
    return fromGetter;
  }

  const value = req.headers?.[name.toLowerCase()];

  return Array.isArray(value) ? value.join(", ") : value;
}

function getDefaultProjectName(): string {
  const processLike = (globalThis as { process?: ProcessLike }).process;
  const packageJsonPathParts = processLike?.env?.npm_package_json?.split(
    /[\\/]/,
  );

  return (
    processLike?.env?.APP_NAME ??
    processLike?.env?.npm_package_name ??
    (packageJsonPathParts && packageJsonPathParts.length > 1
      ? packageJsonPathParts[packageJsonPathParts.length - 2]
      : undefined) ??
    "app"
  );
}

function formatLocalTimestamp(date = new Date()): string {
  const offsetMinutes = -date.getTimezoneOffset();
  const offsetSign = offsetMinutes >= 0 ? "+" : "-";
  const absoluteOffsetMinutes = Math.abs(offsetMinutes);
  const offsetHours = String(Math.floor(absoluteOffsetMinutes / 60)).padStart(
    2,
    "0",
  );
  const offsetRemainingMinutes = String(absoluteOffsetMinutes % 60).padStart(
    2,
    "0",
  );
  const localDate = new Date(date.getTime() + offsetMinutes * 60_000);

  return `${localDate.toISOString().replace("Z", "")}${offsetSign}${offsetHours}:${offsetRemainingMinutes}`;
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
    normalized === "handler"
  ) {
    return undefined;
  }

  return normalized;
}

function getRouteHandlerName(req: RequestLoggerRequest): string | undefined {
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
    .filter((segment) => segment && !segment.startsWith(":"))[0];
}

function getLastPathSegment(path?: string): string | undefined {
  const segments = path
    ?.split(/[?#]/, 1)[0]
    ?.split("/")
    .filter((segment) => segment && !segment.startsWith(":"));

  return segments?.[segments.length - 1];
}

function getRoutePath(req: RequestLoggerRequest): string | undefined {
  if (typeof req.route?.path === "string") {
    return req.route.path;
  }

  return req.path ?? req.originalUrl ?? req.url;
}

function getRouteControllerFile(
  req: RequestLoggerRequest,
  suffix: string,
): string | undefined {
  const routeSegment = getFirstPathSegment(getRoutePath(req));
  const mountedRouterSegment = getLastPathSegment(req.baseUrl);
  const requestSegment = getFirstPathSegment(req.originalUrl ?? req.url);
  const segment = routeSegment ?? mountedRouterSegment ?? requestSegment;

  return segment ? `${segment}${suffix}` : undefined;
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
}): string {
  const requestFrom = input.requestFrom ?? input.ip;
  const parts = [
    `[${input.projectName ?? getDefaultProjectName()}]`,
    input.timestamp ?? formatLocalTimestamp(),
    getLevel(input.statusCode),
    input.method ?? "REQUEST",
    input.url ?? "/",
    String(input.statusCode ?? 0),
    `${input.durationMs}ms`,
    `file=${input.sourceFile ?? "unknown"}`,
    `method=${input.sourceMethod ?? input.method ?? "REQUEST"}`,
    `by=${input.user ?? "system"}`,
  ];

  if (requestFrom) {
    parts.push(`from=${requestFrom}`);
  }

  if (input.userAgent) {
    parts.push(`ua="${input.userAgent}"`);
  }

  return parts.join(" ");
}

export function logger(options: RequestLoggerOptions = {}) {
  const resolvedOptions = {
    ...globalLoggerConfig,
    ...options,
  };
  const log =
    resolvedOptions.log ?? resolvedOptions.logger ?? console.log;

  return (
    req: RequestLoggerRequest,
    res: RequestLoggerResponse,
    next: RequestLoggerNext,
  ): void => {
    if (resolvedOptions.enabled === false) {
      next();
      return;
    }

    const startedAt = Date.now();
    const shouldIncludeRequestFrom =
      resolvedOptions.includeRequestFrom ??
      resolvedOptions.includeIp ??
      false;

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
        routeSourceFile;
      const sourceMethod =
        resolvedOptions.getSourceMethod?.(req) ??
        resolvedOptions.sourceMethod ??
        routeSourceMethod;
      const user = resolvedOptions.getUser?.(req) ?? formatUser(req.user);
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
      });

      log(message);
    });

    next();
  };
}

export const requestLogger = logger;
