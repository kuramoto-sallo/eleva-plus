import "server-only";
import { z } from "zod";

// Variáveis secretas: só no servidor. O import "server-only" quebra o build
// se algum componente de cliente importar este arquivo.
const serverSchema = z.object({
  SUPABASE_SECRET_KEY: z.string().min(1),
});

export function serverEnv() {
  return serverSchema.parse({
    SUPABASE_SECRET_KEY: process.env.SUPABASE_SECRET_KEY,
  });
}
