// Interface gerada a partir do SCHEMA. Sem dependências além do DOM.

import { SCHEMA } from './schema.js';
import { TUNABLE_KEYS } from './defaults.js';

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const fmt = (n) => Math.round(n).toLocaleString('pt-BR');

const FIELD_BY_KEY = Object.fromEntries(SCHEMA.flatMap((s) => s.fields).map((f) => [f.key, f]));

function fieldHtml(f) {
    const hint = f.hint ? `<small class="ts-hint">${esc(f.hint)}</small>` : '';
    if (f.type === 'bool') {
        return `<div class="ts-field"><label class="checkbox_label"><input type="checkbox" data-key="${f.key}"><span>${esc(f.label)}</span></label>${hint}</div>`;
    }
    if (f.type === 'num') {
        return `<div class="ts-field"><label class="ts-row"><span>${esc(f.label)}</span><input type="number" class="text_pole ts-num" data-key="${f.key}" min="${f.min}" max="${f.max}" step="${f.step ?? 1}"></label>${hint}</div>`;
    }
    return `<div class="ts-field"><label class="ts-col"><span>${esc(f.label)}</span><textarea class="text_pole" rows="${f.rows ?? 3}" data-key="${f.key}" placeholder="${esc(f.placeholder ?? '')}" spellcheck="false"></textarea></label>${hint}</div>`;
}

function template() {
    const sections = SCHEMA.map((sec) => `
        <details class="ts-section">
            <summary>${esc(sec.title)}</summary>
            ${sec.fields.map(fieldHtml).join('')}
        </details>`).join('');

    return `
    <div class="inline-drawer">
        <div class="inline-drawer-toggle inline-drawer-header">
            <b>💸 TokenSaver — economia de tokens</b>
            <div class="inline-drawer-icon fa-solid fa-circle-chevron-down down"></div>
        </div>
        <div class="inline-drawer-content">
            <div class="ts-stats" data-role="stats"></div>
            <div class="ts-row ts-presetbar">
                <span>Preset</span>
                <select class="text_pole" data-role="preset">
                    <option value="leve">🌱 Leve (só limpeza)</option>
                    <option value="equilibrado">⚖️ Equilibrado</option>
                    <option value="extremo">🔥 Extremo</option>
                    <option value="custom">🛠️ Personalizado</option>
                </select>
            </div>
            ${sections}
            <div class="ts-buttons">
                <div class="menu_button" data-role="preview">👁️ Ver último prompt enviado</div>
                <div class="menu_button" data-role="reset">♻️ Zerar estatísticas</div>
            </div>
        </div>
    </div>`;
}

export function mountUI(api) {
    const host = document.getElementById('extensions_settings2') || document.getElementById('extensions_settings');
    if (!host) return null;

    const root = document.createElement('div');
    root.className = 'ts-root';
    root.innerHTML = template();
    host.appendChild(root);

    const $q = (sel) => root.querySelectorAll(sel);

    function sync() {
        const s = api.getSettings();
        $q('[data-key]').forEach((el) => {
            const v = s[el.dataset.key];
            if (el.type === 'checkbox') el.checked = !!v;
            else el.value = v ?? '';
        });
        root.querySelector('[data-role="preset"]').value = s.preset;
    }

    function refresh() {
        const sum = api.summarize();
        const el = root.querySelector('[data-role="stats"]');
        if (!sum.runs) {
            el.innerHTML = '<i>Nenhuma geração compactada ainda. Mande uma mensagem pelo OpenRouter!</i>';
            return;
        }
        const l = sum.last;
        const lastPct = l && l.before ? (1 - l.after / l.before) * 100 : 0;
        el.innerHTML = `
            <div><b>Acumulado:</b> ${fmt(sum.runs)} gerações · ${fmt(sum.before)} → ${fmt(sum.after)} tokens (est.)</div>
            <div class="ts-big">−${sum.pct.toFixed(1)}% · ≈ ${fmt(sum.saved)} tokens · ≈ US$ ${sum.usd.toFixed(4)}</div>
            ${l ? `<div class="ts-last"><b>Última:</b> ${fmt(l.before)} → ${fmt(l.after)} (−${lastPct.toFixed(0)}%) · cortadas ${l.droppedConv} msgs · ${l.oldCompacted} antigas compactadas · ${l.merged} blocos de sistema unidos</div>` : ''}`;
    }

    root.addEventListener('input', (e) => {
        const el = e.target.closest('[data-key]');
        if (!el) return;
        const key = el.dataset.key;
        const f = FIELD_BY_KEY[key];
        const s = api.getSettings();
        if (f.type === 'bool') s[key] = el.checked;
        else if (f.type === 'num') {
            let v = Number(el.value);
            if (!Number.isFinite(v)) return;
            v = Math.min(f.max, Math.max(f.min, v));
            s[key] = v;
        } else s[key] = el.value;

        if (TUNABLE_KEYS.includes(key) && s.preset !== 'custom') {
            s.preset = 'custom';
            root.querySelector('[data-role="preset"]').value = 'custom';
        }
        api.save();
        refresh();
    });

    root.querySelector('[data-role="preset"]').addEventListener('change', (e) => {
        if (e.target.value !== 'custom') api.applyPreset(e.target.value);
        else api.getSettings().preset = 'custom';
        sync();
        api.save();
    });
    root.querySelector('[data-role="reset"]').addEventListener('click', () => { api.resetStats(); api.save(); refresh(); });
    root.querySelector('[data-role="preview"]').addEventListener('click', () => api.showPreview());

    sync();
    refresh();
    return { refresh, sync };
}
