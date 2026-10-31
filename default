// Configurações padrão, presets e lista de chaves "ajustáveis por preset".

export const MODULE = 'tokensaver';

/** Chaves controladas pelos presets (Leve / Equilibrado / Extremo). */
export const BALANCED = {
    // Limpeza segura (não muda o sentido do texto)
    trimWhitespace: true,
    normalizeUnicode: true,
    stripHtmlComments: true,
    stripDecorLines: true,
    maxBlankLines: 1,

    // Janela de histórico estável (em blocos, para manter o prefixo igual e aproveitar cache)
    windowEnabled: true,
    windowMax: 40,
    windowStep: 6,

    // Mensagens antigas
    keepFull: 8,
    oldStripThink: true,
    oldStripHtml: true,
    oldStripImages: true,
    oldMaxChars: 1200,

    // Sistema / exemplos
    dedupeSystemLines: true,
    mergeSystem: true,
    dropEmpty: true,
    dropExamples: true,
    exampleAfter: 6,
};

export const PRESETS = {
    leve: {
        ...BALANCED,
        stripDecorLines: false,
        windowEnabled: false,
        keepFull: 12,
        oldStripHtml: false,
        oldMaxChars: 0,
        mergeSystem: false,
        dropExamples: false,
    },
    equilibrado: { ...BALANCED },
    extremo: {
        ...BALANCED,
        maxBlankLines: 0,
        windowMax: 24,
        windowStep: 4,
        keepFull: 4,
        oldMaxChars: 500,
        exampleAfter: 2,
    },
};

export const TUNABLE_KEYS = Object.keys(BALANCED);

export const DEFAULTS = {
    enabled: true,
    onlyOpenRouter: true,
    preset: 'equilibrado',

    ...BALANCED,

    maxTokensCap: 0,
    customRegexAll: '',
    customRegexOld: '',

    // Estimativas
    charsPerToken: 3.6,
    pricePerMTok: 1.0,

    stats: {
        runs: 0,
        tokensBefore: 0,
        tokensAfter: 0,
        last: null,
    },
};
