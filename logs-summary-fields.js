// Garante os campos da linha de resumo (summaryFields) no Logs Explorer de cada projeto.
// Sem campo configurado o console escreve o parâmetro vazio
// (";summaryFields=:false:32:beginning"), e ele é preenchido no lugar.

// Valores no formato do summaryFields: campos separados por vírgula, com "/" como %252F.
const SUMMARY_FIELDS = {
  't3w-logs': 'resource%252Flabels%252Fconfiguration_name',
  't3w-rocket': 'labels%252FdeviceId,labels%252FappVersion',
};
const DEFAULT_SUMMARY_OPTIONS = ':false:32:beginning';
// O console costuma reescrever a URL várias vezes seguidas ao abrir uma página.
const SETTLE_MS = 300;

// Projeto configurado quando a URL é do Logs Explorer, ou null.
function logsProject(href) {
  const url = new URL(href);
  const project = url.searchParams.get('project');
  return /^\/logs\/query(;|$)/.test(url.pathname) && Object.hasOwn(SUMMARY_FIELDS, project) ? project : null;
}

function matrixParam(path, name) {
  const match = path.match(new RegExp(`;${name}=([^;]*)`));
  return match ? match[1] : null;
}

function setMatrixParam(path, name, value) {
  return matrixParam(path, name) === null
    ? `${path};${name}=${value}`
    : path.replace(new RegExp(`;${name}=[^;]*`), `;${name}=${value}`);
}

// URL com os campos configurados, ou null quando não há nada a fazer.
function withSummaryFields(href) {
  const project = logsProject(href);
  if (!project) return null;
  const queryStart = href.indexOf('?');
  const path = href.slice(0, queryStart);
  const summary = matrixParam(path, 'summaryFields');
  // Qualquer campo já configurado pela UI é respeitado.
  if (summary && !summary.startsWith(':')) return null;
  const value = SUMMARY_FIELDS[project] + (summary || DEFAULT_SUMMARY_OPTIONS);
  return setMatrixParam(path, 'summaryFields', value) + href.slice(queryStart);
}

// Carregamento completo: troca a URL antes de o console iniciar.
const initialTarget = withSummaryFields(location.href);
if (initialTarget) location.replace(initialTarget);

// Navegação interna (SPA): só recarrega quando chega no Logs Explorer do projeto vindo
// de outra página ou de outro projeto. Se os campos forem removidos pela UI com o Logs
// Explorer já aberto, a remoção é respeitada.
let settledHref = location.href;
let timer;

function check() {
  const href = location.href;
  const target = withSummaryFields(href);
  if (target && logsProject(settledHref) !== logsProject(href)) {
    // settledHref não é atualizado: se o console cancelar este reload com outra
    // mudança de URL, a próxima verificação tenta de novo.
    location.replace(target);
    return;
  }
  settledHref = href;
}

navigation.addEventListener('currententrychange', () => {
  clearTimeout(timer);
  timer = setTimeout(check, SETTLE_MS);
});
