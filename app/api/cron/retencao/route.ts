import { timingSafeEqual } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";
import { cronSecret } from "@/lib/env.server";
import { runRetention } from "@/lib/retention/run";

// Chamada pela Vercel Cron (vercel.json), todo dia às 3h de Brasília.
// A Vercel manda "Authorization: Bearer <CRON_SECRET>"; sem o segredo certo, nada roda.
export const maxDuration = 60;

function authorized(request: NextRequest) {
  const secret = cronSecret();
  if (!secret) return false;
  const given = Buffer.from(request.headers.get("authorization") ?? "");
  const expected = Buffer.from(`Bearer ${secret}`);
  return given.length === expected.length && timingSafeEqual(given, expected);
}

export async function GET(request: NextRequest) {
  const headers = { "Cache-Control": "no-store" };
  if (!authorized(request)) return NextResponse.json({ ok: false }, { status: 401, headers });

  try {
    const result = await runRetention();
    // Só contagens: nenhum dado pessoal no log.
    console.info("retencao", JSON.stringify(result));
    return NextResponse.json({ ok: true, ...result }, { headers });
  } catch (e) {
    console.error("retencao", e instanceof Error ? e.message : "erro");
    return NextResponse.json({ ok: false }, { status: 500, headers });
  }
}
