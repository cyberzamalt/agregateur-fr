import { FastifyInstance } from 'fastify';
export default async function regionsRoutes(app: FastifyInstance){ app.get('/regions', async()=>[{ code:'IDF', name:'Île-de-France'}]); }
