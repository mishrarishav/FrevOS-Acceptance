import { readFile } from "node:fs/promises";
import { createServer } from "node:http";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const repositoryRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const fixtureRoot = join(repositoryRoot, "fixtures", "site");
const configuredUrl = new URL(process.env.FREVOS_BASE_URL ?? "http://127.0.0.1:4173/");
const host = configuredUrl.hostname === "[::1]" ? "::1" : configuredUrl.hostname;
const port = Number(configuredUrl.port || 80);

if (!new Set(["127.0.0.1", "::1", "localhost"]).has(host) || configuredUrl.protocol !== "http:") {
  throw new Error("The synthetic fixture server binds only to an HTTP loopback URL");
}

const staticFiles = new Map([
  ["/", { file: "index.html", contentType: "text/html; charset=utf-8" }],
  ["/index.html", { file: "index.html", contentType: "text/html; charset=utf-8" }],
  ["/styles.css", { file: "styles.css", contentType: "text/css; charset=utf-8" }],
  ["/app.js", { file: "app.js", contentType: "text/javascript; charset=utf-8" }],
]);

const securityHeaders = {
  "Cache-Control": "no-store",
  "Content-Security-Policy":
    "default-src 'self'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'; object-src 'none'",
  "Cross-Origin-Opener-Policy": "same-origin",
  "Referrer-Policy": "no-referrer",
  "X-Content-Type-Options": "nosniff",
};

const server = createServer(async (request, response) => {
  const method = request.method ?? "GET";
  if (!new Set(["GET", "HEAD"]).has(method)) {
    response.writeHead(405, { Allow: "GET, HEAD", ...securityHeaders });
    response.end();
    return;
  }

  const requestUrl = new URL(request.url ?? "/", configuredUrl);
  if (requestUrl.pathname === "/health") {
    response.writeHead(204, securityHeaders);
    response.end();
    return;
  }

  if (requestUrl.pathname === "/api/status") {
    const body = JSON.stringify({ status: "available" });
    response.writeHead(200, {
      ...securityHeaders,
      "Content-Type": "application/json; charset=utf-8",
    });
    response.end(method === "HEAD" ? undefined : body);
    return;
  }

  const staticFile = staticFiles.get(requestUrl.pathname);
  if (!staticFile) {
    response.writeHead(404, securityHeaders);
    response.end();
    return;
  }

  try {
    const body = await readFile(join(fixtureRoot, staticFile.file));
    response.writeHead(200, {
      ...securityHeaders,
      "Content-Type": staticFile.contentType,
    });
    response.end(method === "HEAD" ? undefined : body);
  } catch {
    response.writeHead(500, securityHeaders);
    response.end();
  }
});

server.on("clientError", (_error, socket) => {
  socket.end("HTTP/1.1 400 Bad Request\r\n\r\n");
});

server.listen(port, host, () => {
  console.log(`Synthetic acceptance fixture ready on ${configuredUrl.origin}`);
});

function shutdown() {
  server.close((error) => {
    process.exitCode = error ? 1 : 0;
  });
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
