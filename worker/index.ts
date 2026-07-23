/** Cloudflare Worker entry point for the vinext-starter template. */
import { handleImageOptimization, DEFAULT_DEVICE_SIZES, DEFAULT_IMAGE_SIZES } from "vinext/server/image-optimization";
import handler from "vinext/server/app-router-entry";

interface Env {
  ASSETS: Fetcher;
  DB: D1Database;
  BOOKS: R2Bucket;
  IMAGES: {
    input(stream: ReadableStream): {
      transform(options: Record<string, unknown>): {
        output(options: { format: string; quality: number }): Promise<{ response(): Response }>;
      };
    };
  };
}

interface ExecutionContext {
  waitUntil(promise: Promise<unknown>): void;
  passThroughOnException(): void;
}

// Image security config. SVG sources with .svg extension auto-skip the
// optimization endpoint on the client side (served directly, no proxy).
// To route SVGs through the optimizer (with security headers), set
// dangerouslyAllowSVG: true in next.config.js and uncomment below:
// const imageConfig: ImageConfig = { dangerouslyAllowSVG: true };

const worker = {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    let response: Response | undefined;

    const mutating = ["POST", "PUT", "PATCH", "DELETE"].includes(request.method);
    const externalWebhook = url.pathname === "/api/paddle/webhook";
    const origin = request.headers.get("Origin");
    const guardedApi = mutating && [
      "/api/auth/google", "/api/auth/qa-login", "/api/reviews", "/api/account/refunds",
      "/api/kakaopay/ready", "/api/naverpay/ready", "/api/checkout/context",
    ].includes(url.pathname);
    if (guardedApi) {
      const ip = (request.headers.get("cf-connecting-ip") || request.headers.get("x-forwarded-for") || "unknown").split(",")[0].trim();
      const windowStartedAt = Math.floor(Date.now() / 60_000) * 60;
      const key = `${url.pathname}:${ip}:${windowStartedAt}`;
      try {
        await env.DB.prepare("INSERT INTO request_limits (`key`,`count`,`window_started_at`) VALUES (?1,1,?2) ON CONFLICT(`key`) DO UPDATE SET `count`=`count`+1").bind(key, windowStartedAt).run();
        const limited = await env.DB.prepare("SELECT `count` FROM request_limits WHERE `key`=?1").bind(key).first<{ count: number }>();
        if ((limited?.count ?? 0) > 20) {
          response = Response.json({ error: "요청이 너무 많습니다. 잠시 후 다시 시도해 주세요." }, { status: 429, headers: { "Retry-After": "60" } });
        }
      } catch (error) {
        console.error("rate_limit_check_failed", { path: url.pathname, message: error instanceof Error ? error.message : "unknown" });
      }
    }
    if (!response && mutating && !externalWebhook && origin && origin !== url.origin) {
      response = Response.json({ error: "허용되지 않은 요청 출처입니다." }, { status: 403 });
    } else if (!response && url.pathname === "/_vinext/image") {
      const allowedWidths = [...DEFAULT_DEVICE_SIZES, ...DEFAULT_IMAGE_SIZES];
      response = await handleImageOptimization(request, {
        fetchAsset: (path) => env.ASSETS.fetch(new Request(new URL(path, request.url))),
        transformImage: async (body, { width, format, quality }) => {
          const result = await env.IMAGES.input(body).transform(width > 0 ? { width } : {}).output({ format, quality });
          return result.response();
        },
      }, allowedWidths);
    } else if (!response) {
      response = await handler.fetch(request, env, ctx);
    }

    const secured = new Response(response.body, response);
    secured.headers.set("X-Content-Type-Options", "nosniff");
    secured.headers.set("X-Frame-Options", "DENY");
    secured.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
    secured.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=(), payment=(self)");
    secured.headers.set("Cross-Origin-Opener-Policy", "same-origin-allow-popups");
    if (import.meta.env.PROD) {
      secured.headers.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload");
      secured.headers.set("Content-Security-Policy", [
        "default-src 'self'",
        "base-uri 'self'",
        "object-src 'none'",
        "frame-ancestors 'none'",
        "form-action 'self'",
        "script-src 'self' 'unsafe-inline' https://accounts.google.com https://cdn.paddle.com https://nsp.pay.naver.com https://www.googletagmanager.com",
        "style-src 'self' 'unsafe-inline' https://accounts.google.com",
        "img-src 'self' data: https:",
        "font-src 'self' data:",
        "connect-src 'self' https://accounts.google.com https://*.googleapis.com https://*.paddle.com https://nsp.pay.naver.com https://pay.paygate.naver.com https://dev-pay.paygate.naver.com https://www.google-analytics.com https://*.google-analytics.com",
        "frame-src https://accounts.google.com https://*.paddle.com https://nsp.pay.naver.com",
        "upgrade-insecure-requests",
      ].join("; "));
    }
    return secured;
  },
};

export default worker;
