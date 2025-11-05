import Fastify from "fastify";
import cors from "@fastify/cors";
import Parser from "rss-parser";

const app = Fastify({ logger: true });
app.register(cors, { origin: true });

const parser = new Parser();

// Santé
app.get("/api/health", async () => ({ ok: true, ts: Date.now() }));

// Nouveau : RSS simple
app.get("/api/rss", async (request, reply) => {
  const url = (request.query as any)?.url as string | undefined;
  if (!url) return reply.code(400).send({ ok: false, error: "Paramètre ?url manquant" });

  try {
    const feed = await parser.parseURL(url);
    const items = (feed.items || []).slice(0, 20).map((i) => ({
      title: i.title,
      link: i.link,
      pubDate: (i as any).isoDate || i.pubDate || null,
      summary: i.contentSnippet || i.content || null
    }));
    return { ok: true, feed: { title: feed.title || url }, items };
  } catch (e) {
    request.log.error(e);
    return reply.code(500).send({ ok: false, error: "Échec lecture RSS" });
  }
});

// Page racine
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
