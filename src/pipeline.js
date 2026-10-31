// Pipeline de compactação do prompt (array de mensagens do Chat Completion).
// Puro: recebe mensagens + opções, devolve novas mensagens + relatório.

import {
    applyRegexes, collapseBlank, contentLength, dedupeLines, mapContent,
    parseRegexList, safeClean, stripHtml, stripThink, truncateMiddle,
} from './compactor.js';

const isExample = (m) => m.name === 'example_user' || m.name === 'example_assistant';
const isConv = (m) => (m.role === 'user' || m.role === 'assistant') && !isExample(m) && !m.tool_calls;
const isStartMarker = (m) => m.role === 'system' && typeof m.content === 'string' && /^\[start a new chat\]$/i.test(m.content.trim());
const isExampleMarker = (m) => m.role === 'system' && typeof m.content === 'string' && /^\[example chat\]$/i.test(m.content.trim());
const canMerge = (m) => m.role === 'system' && !m.name && typeof m.content === 'string';
const totalChars = (msgs) => msgs.reduce((n, m) => n + contentLength(m.content), 0);

export function compactPrompt(chat, o) {
    const msgs = chat.map((m) => ({ ...m }));
    const charsBefore = totalChars(msgs);

    const hasTools = msgs.some((m) => m.role === 'tool' || m.tool_calls || m.function_call);
    const step = Math.max(1, o.windowStep | 0);
    const keepFull = Math.max(2, o.keepFull | 0);

    const convIdx = [];
    msgs.forEach((m, i) => { if (isConv(m)) convIdx.push(i); });
    const n = convIdx.length;

    const drop = new Set();

    // 1) Janela em blocos (múltiplos de `step` => prefixo estável entre turnos)
    let droppedConv = 0;
    const windowMax = Math.max(4, o.windowMax | 0);
    if (o.windowEnabled && !hasTools && n > windowMax) {
        droppedConv = Math.ceil((n - windowMax) / step) * step;
        droppedConv = Math.min(droppedConv, Math.max(0, n - 2));
        convIdx.slice(0, droppedConv).forEach((i) => drop.add(i));
    }
    const nKept = n - droppedConv;

    // 2) Exemplos de diálogo e marcadores
    let droppedExtras = 0;
    if (o.dropExamples && (droppedConv > 0 || nKept >= o.exampleAfter)) {
        msgs.forEach((m, i) => {
            if (isExample(m) || isExampleMarker(m)) { drop.add(i); droppedExtras++; }
        });
    }
    if (o.dropExamples && nKept > 0) {
        msgs.forEach((m, i) => { if (isStartMarker(m)) { drop.add(i); droppedExtras++; } });
    }

    // 3) Limite entre "antigo" e "recente" — alinhado ao bloco para ser estável
    const oldBoundary = Math.max(0, Math.floor((nKept - keepFull) / step) * step);

    const reAll = parseRegexList(o.customRegexAll);
    const reOld = parseRegexList(o.customRegexOld);

    let k = -1;
    let oldCompacted = 0;
    msgs.forEach((m, i) => {
        if (drop.has(i) || m.role === 'tool') return;
        let old = false;
        if (isConv(m)) {
            k++;
            old = k < oldBoundary && k < nKept - 1;
            if (old) oldCompacted++;
        }
        const fn = (t) => {
            let x = applyRegexes(t, reAll);
            if (old) {
                if (o.oldStripThink) x = stripThink(x);
                if (o.oldStripHtml) x = stripHtml(x);
                x = applyRegexes(x, reOld);
            }
            x = safeClean(x, o);
            if (old && o.oldMaxChars > 0) x = truncateMiddle(x, o.oldMaxChars);
            return x;
        };
        m.content = mapContent(m.content, fn, old && o.oldStripImages);
    });

    let out = msgs.filter((_, i) => !drop.has(i));

    // 4) Linhas repetidas entre blocos de sistema (card × preset × lorebook)
    if (o.dedupeSystemLines) {
        const seen = new Set();
        for (const m of out) {
            if (canMerge(m)) m.content = collapseBlank(dedupeLines(m.content, seen), o.maxBlankLines).trim();
        }
    }

    // 5) Mensagens vazias (nunca a última)
    let droppedEmpty = 0;
    if (o.dropEmpty) {
        out = out.filter((m, i) => {
            const empty = typeof m.content === 'string' && m.content.trim() === '' &&
                m.role !== 'tool' && !m.tool_calls && !m.function_call && i < out.length - 1;
            if (empty) droppedEmpty++;
            return !empty;
        });
    }

    // 6) Junta blocos de sistema consecutivos
    let merged = 0;
    if (o.mergeSystem) {
        const res = [];
        for (const m of out) {
            const prev = res[res.length - 1];
            if (prev && canMerge(prev) && canMerge(m)) {
                prev.content = `${prev.content}\n\n${m.content}`;
                merged++;
            } else res.push(m);
        }
        out = res;
    }

    return {
        messages: out,
        report: {
            charsBefore,
            charsAfter: totalChars(out),
            droppedConv,
            droppedExtras,
            droppedEmpty,
            oldCompacted,
            merged,
            messagesBefore: chat.length,
            messagesAfter: out.length,
        },
    };
}
