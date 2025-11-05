import { buildServer } from './server';
const PORT = Number(process.env.PORT || 4000);
buildServer().listen({ port: PORT, host: '0.0.0.0' });
