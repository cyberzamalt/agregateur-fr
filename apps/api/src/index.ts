import Fastify from "fastify";
import cors from "@fastify/cors";
import helmet from "@fastify/helmet";

const app = Fastify({ logger: true });

await app.register(cors, { origin: true });
await app.register(helmet);

app.get("/api/health", async () => ({ ok: true, ts: Date.now() }));

const port = Number(process.env.PORT || 4000);
app.listen({ port, host: "0.0.0.0" }).catch((err) => {
  app.log.error(err);
  process.exit(1);
});
