import Fastify from "fastify";
import cors from "@fastify/cors";

const app = Fastify({ logger: true });

app.register(cors, { origin: true });

app.get("/api/health", async () => ({ ok: true, ts: Date.now() }));

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
