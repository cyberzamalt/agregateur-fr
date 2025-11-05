import { Pool } from 'pg';
let pool: Pool | null = null;
function getPool(){ if(pool) return pool; const url = process.env.POSTGRES_URL; if(!url) throw new Error('POSTGRES_URL not set'); pool = new Pool({ connectionString: url }); return pool; }
export async function query(sql:string, params:any[]=[]){ return getPool().query(sql, params); }
