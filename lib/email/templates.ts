// Textos dos e-mails ao candidato. Os textos de cada fase são aprovados pelo RH.

const escapeHtml = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

function layout(title: string, paragraphs: string[]) {
  const html = `<!doctype html><html lang="pt-BR"><body style="font-family:Arial,sans-serif;color:#1d2140;line-height:1.5;max-width:560px;margin:0 auto;padding:24px">
<p style="font-size:20px;font-weight:bold;margin:0 0 16px">ELEVE<span style="color:#d64116">+</span></p>
<h1 style="font-size:18px">${escapeHtml(title)}</h1>
${paragraphs.map((p) => `<p>${escapeHtml(p)}</p>`).join("\n")}
<p style="color:#666;font-size:13px;margin-top:32px">Programa de Estágio Grupo Sallo · rh@sallo.com.br<br>Este é um e-mail automático; não é preciso responder.</p>
</body></html>`;
  const text = `ELEVE+\n\n${title}\n\n${paragraphs.join("\n\n")}\n\nPrograma de Estágio Grupo Sallo · rh@sallo.com.br`;
  return { html, text };
}

export function confirmationEmail(firstName: string) {
  const title = "Recebemos sua inscrição!";
  const { html, text } = layout(title, [
    `Olá, ${firstName}! Sua inscrição no ELEVE+, o Programa de Estágio do Grupo Sallo, foi recebida.`,
    "A próxima fase são os testes online. Você vai receber por e-mail as instruções e as datas assim que a triagem terminar.",
    "Fique de olho na sua caixa de entrada e também na pasta de spam.",
  ]);
  return { subject: "ELEVE+ | Inscrição recebida", html, text };
}

// E-mail a cada mudança de fase (decisão de 26/11/2026). Rascunho: o RH aprova os textos.
// "desistiu" não gera e-mail (foi o candidato quem avisou).
const PHASE_MESSAGES = {
  testes_online: {
    subject: "ELEVE+ | Você avançou para os testes online",
    title: "Você avançou para os testes online!",
    body: [
      "Sua inscrição passou pela triagem e você segue para a próxima fase: os testes online.",
      "Em breve você recebe as instruções de acesso e o prazo para fazer os testes.",
    ],
  },
  sallo_experience: {
    subject: "ELEVE+ | Você avançou para o Sallo Experience",
    title: "Você avançou para o Sallo Experience!",
    body: [
      "Parabéns pelo resultado nos testes online. Você foi convidado(a) para o Sallo Experience.",
      "Vamos enviar data, horário e local por e-mail. Se tiver alguma dúvida, fale com o RH.",
    ],
  },
  painel: {
    subject: "ELEVE+ | Você avançou para o painel",
    title: "Você avançou para o painel!",
    body: [
      "Você segue no processo e foi selecionado(a) para a fase de painel.",
      "Em breve enviamos os detalhes de data e formato.",
    ],
  },
  entrevista_final: {
    subject: "ELEVE+ | Você avançou para a entrevista final",
    title: "Você avançou para a entrevista final!",
    body: [
      "Você chegou à última fase do processo: a entrevista final.",
      "Vamos entrar em contato para combinar data e horário.",
    ],
  },
  aprovada: {
    subject: "ELEVE+ | Você foi aprovado(a)!",
    title: "Você foi aprovado(a) no ELEVE+!",
    body: [
      "Parabéns! Você foi aprovado(a) no Programa de Estágio do Grupo Sallo.",
      "O RH vai entrar em contato com os próximos passos da admissão.",
    ],
  },
  lista_de_espera: {
    subject: "ELEVE+ | Atualização da sua inscrição",
    title: "Você está na nossa lista de espera",
    body: [
      "Você fez um ótimo processo e está na lista de espera do ELEVE+.",
      "Se surgir uma vaga, entramos em contato por e-mail ou telefone.",
    ],
  },
  contratada: {
    subject: "ELEVE+ | Boas-vindas ao Grupo Sallo",
    title: "Boas-vindas ao Grupo Sallo!",
    body: ["Sua admissão foi concluída. Estamos felizes em ter você no ELEVE+."],
  },
  nao_selecionada: {
    subject: "ELEVE+ | Atualização da sua inscrição",
    title: "Obrigado por participar do ELEVE+",
    body: [
      "Agradecemos seu interesse e o tempo dedicado ao processo seletivo.",
      "Desta vez você não seguirá para a próxima fase. Esperamos ver você em uma próxima turma.",
    ],
  },
} as const;

export type PhaseWithEmail = keyof typeof PHASE_MESSAGES;

export function phaseEmail(status: string, firstName: string) {
  if (!(status in PHASE_MESSAGES)) return null;
  const m = PHASE_MESSAGES[status as PhaseWithEmail];
  const { html, text } = layout(m.title, [`Olá, ${firstName}!`, ...m.body]);
  return { subject: m.subject, html, text };
}
