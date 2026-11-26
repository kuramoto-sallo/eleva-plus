import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { authorize } from "@/lib/auth/staff";
import { audit } from "@/lib/audit";
import { createClient } from "@/lib/supabase/server";
import { CANDIDATE_BUCKET } from "@/lib/applications/storage";

// Abre currículo ou vídeo: confere o papel, registra quem viu e redireciona para uma URL
// assinada de 2 minutos (bucket privado, CLAUDE.md regra 8). O link da página nunca expira
// sozinho porque a URL assinada só é criada no clique.
const SIGNED_URL_SECONDS = 120;
const paramsSchema = z.object({ id: z.uuid(), tipo: z.enum(["curriculo", "video"]) });

const noStore = { "Cache-Control": "no-store", "Referrer-Policy": "no-referrer" };

export async function GET(_request: NextRequest, ctx: RouteContext<"/admin/inscricoes/[id]/arquivo/[tipo]">) {
  const staff = await authorize();
  if (!staff) return new NextResponse("Sem permissão.", { status: 403, headers: noStore });

  const parsed = paramsSchema.safeParse(await ctx.params);
  if (!parsed.success) return new NextResponse("Não encontrado.", { status: 404, headers: noStore });
  const { id, tipo } = parsed.data;

  const supabase = await createClient();
  const { data } = await supabase.from("applications").select("resume_path, video_path").eq("id", id).maybeSingle();
  const path = tipo === "curriculo" ? data?.resume_path : data?.video_path;
  if (typeof path !== "string" || !path) return new NextResponse("Não encontrado.", { status: 404, headers: noStore });

  const { data: signed, error } = await supabase.storage
    .from(CANDIDATE_BUCKET)
    .createSignedUrl(path, SIGNED_URL_SECONDS);
  if (error || !signed?.signedUrl) {
    console.error("rh.arquivo", error?.name);
    return new NextResponse("Arquivo indisponível.", { status: 404, headers: noStore });
  }

  await audit(staff.userId, "file.view", id, { kind: tipo });
  return NextResponse.redirect(signed.signedUrl, { status: 303, headers: noStore });
}
