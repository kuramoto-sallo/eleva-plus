"use server";

import { refresh } from "next/cache";
import { z } from "zod";
import { authorize } from "@/lib/auth/staff";
import { audit } from "@/lib/audit";
import { createClient } from "@/lib/supabase/server";
import { fromLocalInput } from "@/lib/applications/process-dates";

// Datas do processo seletivo (só admin). ends_at é o fim do processo: a exclusão automática
// apaga as inscrições 30 dias depois dela.

export type ProcessState = { ok: boolean; message: string | null };

const schema = z
  .object({
    id: z.uuid(),
    opensAt: z.string().transform(fromLocalInput).pipe(z.string("Data de abertura inválida.")),
    closesAt: z.string().transform(fromLocalInput).pipe(z.string("Data de encerramento inválida.")),
    endsAt: z.string().transform((v) => (v === "" ? null : fromLocalInput(v))),
    endsAtRaw: z.string(),
  })
  .refine((v) => v.endsAtRaw === "" || v.endsAt !== null, { message: "Data de fim do processo inválida." })
  .refine((v) => v.closesAt > v.opensAt, { message: "O encerramento das inscrições deve ser depois da abertura." })
  .refine((v) => v.endsAt === null || v.endsAt >= v.closesAt, {
    message: "O fim do processo deve ser depois do encerramento das inscrições.",
  });

export async function updateProcess(_prev: ProcessState, formData: FormData): Promise<ProcessState> {
  const staff = await authorize(["admin"]);
  if (!staff) return { ok: false, message: "Só administradores editam o processo." };

  const endsAtRaw = String(formData.get("endsAt") ?? "");
  const parsed = schema.safeParse({
    id: formData.get("id"),
    opensAt: String(formData.get("opensAt") ?? ""),
    closesAt: String(formData.get("closesAt") ?? ""),
    endsAt: endsAtRaw,
    endsAtRaw,
  });
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0]?.message ?? "Revise as datas." };
  const { id, opensAt, closesAt, endsAt } = parsed.data;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("selection_processes")
    .update({ opens_at: opensAt, closes_at: closesAt, ends_at: endsAt })
    .eq("id", id)
    .select("id")
    .maybeSingle();
  if (error || !data) {
    if (error) console.error("processo.update", error.code);
    return { ok: false, message: "Não foi possível salvar. Tente de novo." };
  }

  await audit(staff.userId, "process.update", null, {
    process_id: id,
    opens_at: opensAt,
    closes_at: closesAt,
    ends_at: endsAt,
  });
  refresh();
  return { ok: true, message: "Datas salvas." };
}
