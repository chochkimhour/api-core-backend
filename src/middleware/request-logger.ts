export interface RequestLoggerRequest {
  method?: string;
  originalUrl?: string;
  url?: string;
  ip?: string;
  headers?: Record<string, string | string[] | undefined>;
  get?: (name: string) => string | undefined;
}

export interface RequestLoggerResponse {
  statusCode?: number;
  on?: (event: "finish", listener: () => void) => unknown;
}

export type RequestLoggerNext = () => void;

export interface RequestLoggerOptions {
  enabled?: boolean;
  includeIp?: boolean;
  includeUserAgent?: boolean;
  logger?: (message: string) => void;
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

export function formatRequestLog(input: {
  method?: string;
  url?: string;
  statusCode?: number;
  durationMs: number;
  ip?: string;
  userAgent?: string;
}): string {
  const parts = [
    "[api-core-backend]",
    getLevel(input.statusCode),
    input.method ?? "REQUEST",
    input.url ?? "/",
    String(input.statusCode ?? 0),
    `${input.durationMs}ms`,
  ];

  if (input.ip) {
    parts.push(`ip=${input.ip}`);
  }

  if (input.userAgent) {
    parts.push(`ua="${input.userAgent}"`);
  }

  return parts.join(" ");
}

export function requestLogger(options: RequestLoggerOptions = {}) {
  const logger = options.logger ?? console.log;

  return (
    req: RequestLoggerRequest,
    res: RequestLoggerResponse,
    next: RequestLoggerNext,
  ): void => {
    if (options.enabled === false) {
      next();
      return;
    }

    const startedAt = Date.now();

    res.on?.("finish", () => {
      const durationMs = Date.now() - startedAt;
      const userAgent = getHeader(req, "user-agent");
      const message = formatRequestLog({
        durationMs,
        ...(req.method ? { method: req.method } : {}),
        ...((req.originalUrl ?? req.url)
          ? { url: req.originalUrl ?? req.url }
          : {}),
        ...(res.statusCode !== undefined ? { statusCode: res.statusCode } : {}),
        ...(options.includeIp ? { ip: req.ip } : {}),
        ...(options.includeUserAgent && userAgent ? { userAgent } : {}),
      });

      logger(message);
    });

    next();
  };
}
