import type { Metadata } from "next";
import Link from "next/link";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { CONSENT_VERSION } from "@/lib/validation/application";

export const metadata: Metadata = {
  title: "Política de Privacidade | ELEVE+",
  description: "Como o Grupo Sallo trata os dados pessoais de quem se inscreve no ELEVE+.",
};

// Texto aprovado pelo jurídico em 27/11/2026 (Claude Doc "ELEVE+ — Política de Privacidade").
// Qualquer mudança aqui exige nova aprovação e nova CONSENT_VERSION (lib/validation/application.ts):
// a versão aceita fica gravada em cada inscrição.

const DPO_EMAIL = "dileusa.lima@sallo.com.br";

// Pendente de confirmação do jurídico: o rascunho deixou estes dois trechos em aberto.
const TRANSFER_TEXT =
  "Vercel, Resend e Cloudflare ficam fora do Brasil. Isso é uma transferência internacional de dados (LGPD, art. 33), " +
  "feita com as cláusulas-padrão contratuais aprovadas pela ANPD. Não compartilhamos seus dados com outras empresas, " +
  "a não ser por ordem legal ou judicial.";
const MINORS_TEXT = "A inscrição é aberta a partir de 16 anos.";

const versionLabel = CONSENT_VERSION.split("-").reverse().join("/");

function H2({ children }: { children: React.ReactNode }) {
  return <h2 className="mt-6 text-xl font-semibold">{children}</h2>;
}

function Mail({ to }: { to: string }) {
  return (
    <a href={`mailto:${to}`} className="text-primary underline">
      {to}
    </a>
  );
}

const DATA_ROWS = [
  ["Dados pessoais", "Nome completo, e-mail, telefone/WhatsApp com DDD, cidade e estado"],
  ["Formação", "Instituição de ensino, curso, semestre atual e previsão de conclusão (mês e ano)"],
  ["Interesses", "Área de interesse, turno disponível (manhã ou tarde) e perfil do LinkedIn (opcional)"],
  ["Arquivos", "Currículo em PDF e vídeo de até 1 minuto, enviado como arquivo ou como link do YouTube"],
  [
    "Registro do aceite",
    "Confirmação de que você tem 16 anos ou mais, data e hora do aceite desta política e a versão do texto aceito",
  ],
  [
    "Dados técnicos",
    "Endereço IP, guardado só de forma irreversível (hash) para limitar envios repetidos, e a verificação anti-robô da Cloudflare",
  ],
  ["Andamento do processo", "Fase em que você está e nota dos testes online, registradas pelo RH"],
] as const;

const PROCESSORS = [
  ["Supabase", "Banco de dados e armazenamento de currículos e vídeos", "São Paulo, Brasil"],
  ["Vercel", "Hospedagem do site", "Estados Unidos e outros países"],
  ["Resend", "Envio dos e-mails do processo", "Estados Unidos"],
  ["Cloudflare (Turnstile)", "Verificação anti-robô no envio", "Estados Unidos e outros países"],
  ["YouTube (Google)", "Só se você escolher enviar o vídeo por link", "Conforme a política do Google"],
] as const;

function Table({ head, rows }: { head: readonly string[]; rows: readonly (readonly string[])[] }) {
  return (
    <div className="overflow-x-auto rounded-lg border">
      <table className="w-full text-left text-sm">
        <thead className="bg-muted/50">
          <tr>
            {head.map((h) => (
              <th key={h} scope="col" className="px-3 py-2 font-semibold">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r[0]} className="border-t align-top">
              {r.map((c, i) =>
                i === 0 ? (
                  <th key={i} scope="row" className="px-3 py-2 font-medium">
                    {c}
                  </th>
                ) : (
                  <td key={i} className="px-3 py-2">
                    {c}
                  </td>
                ),
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function PrivacyPage() {
  return (
    <>
      <SiteHeader />
      <main id="conteudo" className="flex flex-1 flex-col px-5 py-16 sm:px-8">
        <article className="mx-auto flex max-w-3xl flex-col gap-4 leading-relaxed">
          <h1 className="font-display text-2xl sm:text-3xl">Política de Privacidade</h1>
          <p className="text-muted-foreground text-sm">Versão de {versionLabel}</p>

          <H2>1. Quem somos</H2>
          <p>
            O <strong>Grupo Sallo</strong> é o controlador dos dados pessoais tratados no site do ELEVE+, o Programa de
            Estágio do Grupo Sallo. Isso quer dizer que decidimos como e para que seus dados são usados.
          </p>
          <ul className="list-disc space-y-1 pl-6">
            <li>
              <strong>Controlador:</strong> SALLO CONFECÇÃO E COMÉRCIO DE ROUPAS LTDA., CNPJ 01.968.595/0002-17, Av.
              Eixo Primário c/ 07, Qd. 31, Lt. 1 - 11 – Polo Empresarial de Goiás, Aparecida de Goiânia - GO, CEP
              74985-145.
            </li>
            <li>
              <strong>Encarregado (DPO):</strong> Dileusa Ferreira Lima, pelo e-mail <Mail to={DPO_EMAIL} />.
            </li>
            <li>
              <strong>Dúvidas sobre o programa:</strong> <Mail to="rh@sallo.com.br" /> ou WhatsApp (62) 98335-3435.
            </li>
          </ul>

          <H2>2. Quais dados coletamos</H2>
          <p>
            Coletamos só o que você informa no formulário de inscrição e alguns dados técnicos para proteger o site.
            Todos os campos são obrigatórios, exceto o LinkedIn.
          </p>
          <Table head={["Grupo", "Dados"]} rows={DATA_ROWS} />
          <p>
            O vídeo e o currículo podem revelar sua imagem e sua voz. Pedimos que você não inclua neles dados sensíveis,
            como saúde, religião ou opinião política, porque eles não são usados na seleção.
          </p>

          <H2>3. Para que usamos e com qual base legal</H2>
          <p>
            Usamos seus dados só para conduzir o processo seletivo do ELEVE+. A base legal é a execução de procedimentos
            preliminares a um contrato, a pedido do titular (LGPD, art. 7º, V): você se inscreve para concorrer a um
            contrato de estágio.
          </p>
          <ul className="list-disc space-y-1 pl-6">
            <li>Avaliar sua inscrição, currículo e vídeo nas fases do processo.</li>
            <li>
              Falar com você por e-mail ou telefone sobre cada fase (testes online, Sallo Experience, painel, entrevista
              final e resultado).
            </li>
            <li>
              Proteger o site contra robôs e envios em massa, por meio do captcha e do limite de envios (legítimo
              interesse, art. 7º, IX).
            </li>
          </ul>
          <p>
            Não usamos seus dados para marketing, não os vendemos e não tomamos decisões só por meios automatizados:
            quem avalia é a equipe do RH.
          </p>

          <H2>4. Com quem compartilhamos</H2>
          <p>
            Seus dados só são vistos pela equipe do RH do Grupo Sallo com acesso por convite. Cada acesso a uma
            inscrição, currículo ou vídeo fica registrado. Para o site funcionar, usamos estes fornecedores
            (operadores), que tratam os dados só conforme nossas instruções:
          </p>
          <Table head={["Fornecedor", "Para quê", "Onde os dados ficam"]} rows={PROCESSORS} />
          <p>{TRANSFER_TEXT}</p>

          <H2>5. Por quanto tempo guardamos</H2>
          <p>
            Apagamos todas as inscrições da turma, com currículos e vídeos,{" "}
            <strong>30 dias depois do fim do processo seletivo</strong> (anúncio dos aprovados). A exclusão é
            automática, feita por uma rotina diária.
          </p>
          <ul className="list-disc space-y-1 pl-6">
            <li>Os hashes de IP do limite de envios são apagados em 30 dias.</li>
            <li>Arquivos de um envio que não foi concluído são apagados em até 2 dias.</li>
            <li>
              Quem for contratado tem os dados transferidos para a admissão, fora deste site, e passa a seguir a
              política de privacidade de colaboradores.
            </li>
            <li>O registro de acessos guarda só identificadores internos, sem nome, e-mail ou outro dado seu.</li>
          </ul>

          <H2>6. Seus direitos</H2>
          <p>
            Você pode, a qualquer momento e sem custo, pedir pelo e-mail do encarregado (<Mail to={DPO_EMAIL} />
            ):
          </p>
          <ul className="list-disc space-y-1 pl-6">
            <li>confirmação de que tratamos seus dados e acesso a eles;</li>
            <li>correção de dados incompletos, errados ou desatualizados;</li>
            <li>exclusão da sua inscrição, o que encerra sua participação no processo;</li>
            <li>informação sobre com quem compartilhamos seus dados;</li>
            <li>portabilidade e revisão, nos termos do art. 18 da LGPD.</li>
          </ul>
          <p>
            Respondemos em até 15 dias. Para proteger você, podemos pedir que o pedido venha do mesmo e-mail usado na
            inscrição. Você também pode reclamar à Autoridade Nacional de Proteção de Dados (ANPD).
          </p>

          <H2>7. Segurança, menores, cookies e mudanças</H2>
          <p>
            <strong>Segurança.</strong> Os dados ficam em banco e armazenamento privados, com acesso restrito por papel
            (RH e administradores convidados). Currículos e vídeos só abrem por links temporários de 2 minutos. Toda a
            comunicação é criptografada (HTTPS).
          </p>
          <p>
            <strong>Menores de idade.</strong> {MINORS_TEXT}
          </p>
          <p>
            <strong>Cookies.</strong> O site público não usa cookies de publicidade nem de análise. A verificação
            anti-robô da Cloudflare pode usar dados técnicos do navegador só para esse fim. A área do RH usa cookies de
            sessão, necessários para o login.
          </p>
          <p>
            <strong>Mudanças.</strong> Se esta política mudar, publicamos a nova versão aqui com a data. A versão que
            você aceitou fica registrada na sua inscrição.
          </p>

          <Link href="/" className="text-primary mt-6 underline">
            Voltar para a página inicial
          </Link>
        </article>
      </main>
      <SiteFooter />
    </>
  );
}
