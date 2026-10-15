# chromium-localhost-redirect

Extensão para navegadores baseados em Chromium (Chrome, Brave, Edge) com dois ajustes de URL:

- **127.0.0.1 → localhost**: redireciona `http(s)://127.0.0.1` para `localhost`, preservando porta, caminho e query.
- **Logs Explorer do Google Cloud**: ao abrir o Logs Explorer dos projetos abaixo, adiciona os campos na linha de resumo (`summaryFields`).

  | Projeto      | Campos                                 |
  |--------------|----------------------------------------|
  | `t3w-logs`   | `resource/labels/configuration_name`   |
  | `t3w-rocket` | `labels/deviceId`, `labels/appVersion` |

  Se a página for aberta pela navegação interna do console, ela recarrega uma vez já com os campos. Campos que você já configurou, ou removeu com o Logs Explorer aberto, são respeitados.

## Instalação

O Chromium não instala extensões a partir de um `.zip` nem de links fora da Chrome Web Store, então a extensão é carregada como **descompactada**. Escolha uma das formas abaixo para obter os arquivos e depois siga [Carregar no navegador](#carregar-no-navegador).

### Pelo link do zip

| Versão     | Link                                                                                   |
|------------|----------------------------------------------------------------------------------------|
| Mais recente | https://dev.jeferson-santos.com/chromium/chromium-localhost-redirect-latest.zip      |
| Específica | `https://dev.jeferson-santos.com/chromium/chromium-localhost-redirect-<versão>.zip` (ex.: `0.0.1`) |

No macOS ou Linux:

```bash
curl -fsSL https://dev.jeferson-santos.com/chromium/chromium-localhost-redirect-latest.zip -o /tmp/chromium-localhost-redirect.zip
```

```bash
unzip -o /tmp/chromium-localhost-redirect.zip -d ~/Extensions/chromium-localhost-redirect
```

No Windows, baixe o zip pelo navegador e use **Extrair tudo** numa pasta fixa, por exemplo `%USERPROFILE%\Extensions\chromium-localhost-redirect`.

### Clonando o repositório

```bash
git clone https://github.com/JefersonSantos06/chromium-localhost-redirect.git
```

A pasta clonada já é a extensão; não precisa de build.

### Carregar no navegador

1. Abra `chrome://extensions` (no Brave, `brave://extensions`; no Edge, `edge://extensions`).
2. Ative o **Modo do desenvolvedor**.
3. Clique em **Carregar sem compactação** e selecione a pasta da extensão (a que contém o `manifest.json`).

O navegador carrega a extensão direto dessa pasta: não a mova nem a apague depois.

## Atualização

Extensões descompactadas não se atualizam sozinhas.

- **Pelo zip**: repita os dois comandos de download e descompactação (o `unzip -o` sobrescreve a mesma pasta).
- **Pelo clone**: rode `git pull` na pasta do repositório.

Depois, em `chrome://extensions`, clique no botão de recarregar do card da extensão e confira a versão exibida.

## Desenvolvimento

### Adicionar ou mudar campos de um projeto

Edite o mapa `SUMMARY_FIELDS` em [`logs-summary-fields.js`](logs-summary-fields.js). Os valores seguem o formato do parâmetro `summaryFields` do console: campos separados por vírgula, com `/` escrito como `%252F`.

```js
const SUMMARY_FIELDS = {
  't3w-logs': 'resource%252Flabels%252Fconfiguration_name',
  't3w-rocket': 'labels%252FdeviceId,labels%252FappVersion',
};
```

O jeito mais fácil de obter o valor é configurar os campos pela interface do Logs Explorer e copiar o `summaryFields=` da URL (só a parte antes do primeiro `:`).

### Publicar uma versão

O workflow [`release.yml`](.github/workflows/release.yml) empacota a extensão e publica no bucket R2 `dev`, na pasta `chromium/`, como `chromium-localhost-redirect-<versão>.zip` e `chromium-localhost-redirect-latest.zip`.

1. Atualize `version` no [`manifest.json`](manifest.json) e faça o commit.
2. Crie e envie a tag com a mesma versão. O workflow falha se a tag não bater com o `manifest.json`.

```bash
git tag v0.0.2
```

```bash
git push origin v0.0.2
```

Também dá para rodar manualmente pela aba **Actions**, publicando a versão que estiver no `manifest.json`.

Secrets necessários em **Settings → Secrets and variables → Actions**: `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID` e `R2_SECRET_ACCESS_KEY`.
