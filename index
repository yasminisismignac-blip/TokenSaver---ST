// TokenSaver — ponto de entrada. Liga o pipeline aos eventos do SillyTavern.

import { DEFAULTS, MODULE, PRESETS } from './src/defaults.js';
import { compactPrompt } from './src/pipeline.js';
import { recordRun, resetStats, summarize } from './src/stats.js';
import { contentText } from './src/compactor.js';
import { mountUI } from './src/ui.js';

const LOG = '[TokenSaver]';
const ctx = () => SillyTavern.getContext();

let ui = null;
let lastMessages = null;

function getSettings() {
    const { extensionSettings } = ctx();
    if (!extensionSettings[MODULE]) extensionSettings[MODULE] = structuredClone(DEFAULTS);
    const s = extensionSettings[MODULE];
    for (const k of Object.keys(DEFAULTS)) {
        if (!Object.hasOwn(s, k)) s[k] = structuredClone(DEFAULTS[k]);
    }
    return s;
}

const save = () => ctx().saveSettingsDebounced();

function applyPreset(name) {
    if (!PRESETS[name]) return;
    Object.assign(getSettings(), structuredClone(PRESETS[name]), { preset: name });
}

function shouldRun(s) {
    if (!s.enabled) return false;
    const c = ctx();
    if (c.mainApi && c.mainApi !== 'openai') return false;
    if (s.onlyOpenRouter) {
        const src = document.getElementById('chat_completion_source')?.value;
        if (src !== 'openrouter') return false;
    }
    return true;
}

function onPromptReady(data) {
    try {
        const s = getSettings();
        if (!data || !Array.isArray(data.chat) || !shouldRun(s)) return;

        const { messages, report } = compactPrompt(data.chat, s);
        data.chat.splice(0, data.chat.length, ...messages);

        if (!data.dryRun) {
            lastMessages = messages;
            recordRun(s, report);
            save();
            ui?.refresh();
        }
    } catch (err) {
        // Nunca derruba a geração: se algo falhar, o prompt original segue.
        console.error(LOG, 'falha ao compactar, prompt original mantido:', err);
    }
}

function onSettingsReady(gen) {
    try {
        const s = getSettings();
        if (!gen || !shouldRun(s) || !(s.maxTokensCap > 0)) return;
        for (const key of ['max_tokens', 'max_completion_tokens']) {
            if (typeof gen[key] === 'number' && gen[key] > s.maxTokensCap) gen[key] = s.maxTokensCap;
        }
    } catch (err) {
        console.error(LOG, err);
    }
}

async function showPreview() {
    if (!lastMessages?.length) {
        toastr.info('Ainda não há prompt compactado nesta sessão.', 'TokenSaver');
        return;
    }
    const text = lastMessages.map((m) => `━━ [${m.role}${m.name ? `:${m.name}` : ''}] ━━\n${contentText(m.content)}`).join('\n\n');
    const html = document.createElement('div');
    const pre = document.createElement('div');
    pre.className = 'ts-preview';
    pre.textContent = text; // textContent: seguro contra HTML no chat
    html.append(pre);
    const c = ctx();
    if (c.callGenericPopup) await c.callGenericPopup(html, c.POPUP_TYPE?.TEXT ?? 1, '', { wide: true, large: true, allowVerticalScrolling: true });
    else console.log(LOG, text);
}

(function init() {
    const c = ctx();
    const types = c.eventTypes ?? c.event_types;

    getSettings();
    ui = mountUI({
        getSettings,
        save,
        applyPreset,
        resetStats: () => resetStats(getSettings()),
        summarize: () => summarize(getSettings()),
        showPreview,
    });

    c.eventSource.on(types.CHAT_COMPLETION_PROMPT_READY, onPromptReady);
    if (types.CHAT_COMPLETION_SETTINGS_READY) c.eventSource.on(types.CHAT_COMPLETION_SETTINGS_READY, onSettingsReady);

    console.log(LOG, 'carregado.');
})();
