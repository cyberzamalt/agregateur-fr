import { FastifyInstance } from 'fastify';
export function registerErrorHandlers(app: FastifyInstance){ app.setErrorHandler((err,_req,reply)=>{ reply.code((err as any).statusCode||500).send({ ok:false, error: err.message||'Internal Error' }); }); }
