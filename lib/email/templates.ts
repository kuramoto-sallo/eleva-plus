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
