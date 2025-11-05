import { FastifyInstance } from 'fastify';
export default async function scoreRoutes(app: FastifyInstance){ app.get('/score/:id', async(req)=>({ id:(req.params as any).id, score:3.5, explanation:{ total:3.5, rules:[] }})); }
