import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { CANDIDATE_BUCKET } from "@/lib/applications/storage";

// Rotina diária de retenção (LGPD): apaga as inscrições 30 dias após o fim do processo,
// com currículo e vídeo, e limpa arquivos sem inscrição. Não depende de clique do RH.
// O banco apaga as linhas e registra na auditoria; aqui só removemos os arquivos.

const REMOVE_BATCH = 100;

export type RetentionResult = {
  applications: number;
  files: number;
  orphans: number;
  failedRemovals: number;
};

async function removeAll(paths: string[]) {
  const storage = createAdminClient().storage.from(CANDIDATE_BUCKET);
  let failed = 0;
  for (let i = 0; i < paths.length; i += REMOVE_BATCH) {
    const batch = paths.slice(i, i + REMOVE_BATCH);
    const { error } = await storage.remove(batch);
    if (error) {
      failed += batch.length;
      console.error("retencao.remocao", error.name);
    }
  }
  return failed;
}

export async function runRetention(): Promise<RetentionResult> {
  const admin = createAdminClient();

  // 1. Inscrições vencidas: a função apaga as linhas e devolve os caminhos.
  const { data: purged, error } = await admin.rpc("purge_expired_applications");
  if (error) throw new Error(`retencao.purge ${error.code}`);
  const rows = (purged ?? []) as { resume_path: string | null; video_path: string | null }[];
  const files = rows.flatMap((r) => [r.resume_path, r.video_path]).filter((p): p is string => !!p);
  let failedRemovals = await removeAll(files);

  // 2. Órfãos: uploads sem inscrição há mais de 1 dia (envio abandonado ou remoção que falhou).
  //    Inclui o que falhou no passo 1, que é tentado de novo no dia seguinte.
  const { data: orphans, error: orphanError } = await admin.rpc("list_orphan_candidate_files", { p_limit: 1000 });
  if (orphanError) throw new Error(`retencao.orfaos ${orphanError.code}`);
  const orphanPaths = (orphans ?? []) as string[];
  failedRemovals += await removeAll(orphanPaths);

  return { applications: rows.length, files: files.length, orphans: orphanPaths.length, failedRemovals };
}
