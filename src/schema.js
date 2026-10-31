// Descrição declarativa da interface: a UI é gerada a partir daqui.

export const SCHEMA = [
    {
        title: '⚙️ Geral',
        fields: [
            { key: 'enabled', type: 'bool', label: 'Ativar TokenSaver' },
            {
                key: 'onlyOpenRouter', type: 'bool', label: 'Só agir quando a fonte for OpenRouter',
                hint: 'Desmarque para usar com qualquer fonte de Chat Completion.',
            },
            {
                key: 'maxTokensCap', type: 'num', label: 'Teto de tokens da RESPOSTA (0 = não mexer)', min: 0, max: 32000, step: 50,
                hint: 'Tokens de saída costumam custar 3–5x mais que os de entrada. Só reduz, nunca aumenta o valor do seu preset.',
            },
        ],
    },
    {
        title: '🧹 Limpeza segura (todas as mensagens)',
        fields: [
            { key: 'trimWhitespace', type: 'bool', label: 'Remover espaços sobrando' },
            { key: 'normalizeUnicode', type: 'bool', label: 'Normalizar caracteres invisíveis / espaços estranhos' },
            { key: 'stripHtmlComments', type: 'bool', label: 'Remover comentários <!-- -->' },
            { key: 'stripDecorLines', type: 'bool', label: 'Remover linhas decorativas (=====, -----, _____)', hint: 'Só linhas de 5+ caracteres; "***" de quebra de cena continua intacto.' },
            { key: 'maxBlankLines', type: 'num', label: 'Máx. de linhas em branco seguidas', min: 0, max: 3, step: 1 },
        ],
    },
    {
        title: '🪟 Janela de histórico estável',
        fields: [
            {
                key: 'windowEnabled', type: 'bool', label: 'Cortar histórico antigo em BLOCOS',
                hint: 'Em vez de deslizar 1 mensagem por turno (que quebra o prompt cache), remove blocos inteiros de uma vez. O prefixo fica igual por vários turnos.',
            },
            { key: 'windowMax', type: 'num', label: 'Máx. de mensagens de chat no prompt', min: 6, max: 500, step: 1 },
            { key: 'windowStep', type: 'num', label: 'Tamanho do bloco (mensagens)', min: 1, max: 50, step: 1 },
        ],
    },
    {
        title: '🗜️ Compactação de mensagens antigas',
        fields: [
            { key: 'keepFull', type: 'num', label: 'Mensagens recentes intocadas', min: 2, max: 100, step: 1 },
            { key: 'oldStripThink', type: 'bool', label: 'Remover <think>/<thinking> do histórico' },
            { key: 'oldStripHtml', type: 'bool', label: 'Remover tags HTML/CSS do histórico (mantém o texto)' },
            { key: 'oldStripImages', type: 'bool', label: 'Remover imagens de mensagens antigas' },
            {
                key: 'oldMaxChars', type: 'num', label: 'Limite de caracteres por msg antiga (0 = off)', min: 0, max: 20000, step: 50,
                hint: 'Mantém começo e fim da mensagem, corta o meio.',
            },
        ],
    },
    {
        title: '📦 Sistema, exemplos e lorebook',
        fields: [
            { key: 'dedupeSystemLines', type: 'bool', label: 'Remover linhas repetidas entre blocos de sistema', hint: 'Pega duplicatas entre card, preset e entradas de lorebook.' },
            { key: 'mergeSystem', type: 'bool', label: 'Juntar blocos de sistema consecutivos' },
            { key: 'dropEmpty', type: 'bool', label: 'Remover mensagens vazias' },
            { key: 'dropExamples', type: 'bool', label: 'Remover diálogos de exemplo quando o chat já está rolando' },
            { key: 'exampleAfter', type: 'num', label: '…depois de quantas mensagens de chat', min: 0, max: 100, step: 1 },
        ],
    },
    {
        title: '🧪 Regex personalizadas',
        fields: [
            {
                key: 'customRegexAll', type: 'text', rows: 3, label: 'Remover em TODAS as mensagens (uma por linha)',
                placeholder: '/\\[OOC:.*?\\]/gi',
                hint: 'Formato /padrão/flags ou apenas o padrão. Linhas começando com // são ignoradas.',
            },
            {
                key: 'customRegexOld', type: 'text', rows: 3, label: 'Remover só nas mensagens ANTIGAS',
                placeholder: '<status>[\\s\\S]*?</status>',
                hint: 'Ótimo para painéis de status, HUDs e blocos de stats que se repetem a cada resposta.',
            },
        ],
    },
    {
        title: '💰 Estimativas',
        fields: [
            { key: 'pricePerMTok', type: 'num', label: 'Preço de entrada do seu modelo (US$ / 1M tokens)', min: 0, max: 200, step: 0.01 },
            { key: 'charsPerToken', type: 'num', label: 'Caracteres por token (estimativa)', min: 1.5, max: 6, step: 0.1 },
        ],
    },
];
