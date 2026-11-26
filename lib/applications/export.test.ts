import { describe, expect, it } from "vitest";
import { applicationsCsv, type ExportRow } from "./export";

const row: ExportRow = {
  id: "00000000-0000-0000-0000-000000000001",
  created_at: "2026-12-01T13:30:00Z",
  full_name: '=HIPERLINK("http://mal")',
  email: "ana@teste.local",
  phone: "62999998888",
  city: "Goiânia",
  state: "GO",
  institution: "UFG",
  course: "Economia",
  semester: 5,
  graduation_month: 12,
  graduation_year: 2028,
  interest_area: "gestao",
  availability: "tarde",
  linkedin_url: null,
  video_path: "p/a/video.mp4",
  video_url: null,
  status: "painel",
  test_score: 87.5,
};

describe("applicationsCsv", () => {
  const csv = applicationsCsv([row]);
  const [header, line] = csv.replace(/^﻿/, "").split("\r\n");

  it("tem cabeçalho em português e separador ;", () => {
    expect(header.startsWith('"ID";"Data da inscrição";"Nome"')).toBe(true);
  });

  it("neutraliza fórmulas no nome", () => {
    expect(line).toContain(`"'=HIPERLINK(""http://mal"")"`);
  });

  it("formata data, telefone, rótulos e nota para o Excel em pt-BR", () => {
    expect(line).toContain('"01/12/2026, 10:30"');
    expect(line).toContain('"(62) 99999-8888"');
    expect(line).toContain('"12/2028";"Gestão";"Tarde"');
    expect(line).toContain('"Arquivo enviado (ver no sistema)";"Painel";"87,5"');
  });

  it("não exporta o caminho do arquivo", () => {
    expect(csv).not.toContain("p/a/video.mp4");
  });
});
