import Fastify from "fastify";
import cors from "@fastify/cors";

const app = Fastify({ logger: true });
app.register(cors, { origin: true });

// Ping santé
app.get("/api/health", async () => ({ ok: true, ts: Date.now() }));

// 🔗 Proxy RSS -> renvoie le XML tel quel
app.get("/api/rss", async (req, reply) => {
  try {
    const { url } = (req.query as { url?: string }) || {};
    if (!url) return reply.code(400).send({ error: "Missing 'url' query param" });

    // Validation simple de l'URL
    let target: URL;
    try { target = new URL(url); } catch { return reply.code(400).send({ error: "Invalid URL" }); }

    const resp = await fetch(target.toString(), {
      headers: {
        "user-agent": "agregateur-fr/1.0 (+https://agregateur-fr-web.onrender.com)",
        "accept": "application/rss+xml, application/xml, text/xml;q=0.9, */*;q=0.8"
      }
    });

    const body = await resp.text();
    reply.header("Content-Type", resp.headers.get("content-type") || "application/xml; charset=utf-8");
    return reply.send(body);
  } catch (e) {
    req.log.error(e);
    return reply.code(500).send({ error: "fetch_failed" });
  }
});

// Racine
app.get("/", async () => ({ name: "agregateur-fr API", ok: true }));

const PORT = Number(process.env.PORT || 4000);
const HOST = "0.0.0.0";
async function start() {
  try {
    await app.listen({ port: PORT, host: HOST });
    app.log.info(`API listening on http://${HOST}:${PORT}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}
start();
