import Fastify from "fastify";
import cors from "@fastify/cors";
import helmet from "@fastify/helmet";

const app = Fastify({ logger: true });

// Plugins (pas besoin de "await" ici)
app.register(cors, { origin: true });
// Si la CSP gêne en dev, on peut désactiver (sinon laisse vide)
app.register(helmet /*, { contentSecurityPolicy: false } */);

// Routes
app.get("/api/health", async () => ({ ok: true, ts: Date.now() }));

// Démarrage
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
