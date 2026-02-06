import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
// 1. IMPORTANTE: Importamos todo lo que hay en schema como un objeto
import * as schema from './schema'; 

const connectionString = process.env.DATABASE_URL!;

// Disable prefetch as it is not supported for "Transaction" pool mode 
// (si usas el puerto 6543 de Supabase). Si usas 5432, prepare: false es opcional pero seguro.
const client = postgres(connectionString, { prepare: false });
// 2. IMPORTANTE: Le pasamos el schema a la función drizzle
export const db = drizzle(client, { schema });