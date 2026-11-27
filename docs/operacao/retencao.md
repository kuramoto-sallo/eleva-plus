# Exclusão automática (retenção de 30 dias)

Todo dia às 3h de Brasília, a Vercel chama `/api/cron/retencao` (configurado em `vercel.json`). A rotina:

1. apaga as inscrições de processos cujo **fim** (`ends_at`) foi há mais de 30 dias, com registro na auditoria;
2. remove currículo e vídeo dessas inscrições do Storage;
3. remove arquivos sem inscrição com mais de 1 dia (envio abandonado no meio ou remoção que falhou);
4. apaga os hashes de IP do limite de envios com mais de 30 dias.

Não depende de clique do RH. O único passo manual: ao anunciar os aprovados, um admin preenche o **Fim do
processo** em `/admin/processos`. Sem essa data, nada da turma é apagado.

## Configuração (uma vez)

- Na Vercel, em **Settings → Environment Variables**, crie `CRON_SECRET` como **Secret**, só em Production,
  com um valor aleatório de pelo menos 16 caracteres (por exemplo, gerado por um gerenciador de senhas).
  A Vercel envia esse valor no cabeçalho `Authorization` das chamadas do cron; sem ele, a rota responde 401.
- Os cron jobs só rodam no deploy de produção. Os logs ficam em **Vercel → Logs**, filtrando por
  `/api/cron/retencao`; eles mostram só contagens, sem dados pessoais.
