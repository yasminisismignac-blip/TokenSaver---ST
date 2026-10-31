// Funções PURAS de texto (sem DOM, sem SillyTavern). Fáceis de testar.

const ZERO_WIDTH = /[\u200B\u200C\u200D\u2060\uFEFF]/g;
const ODD_SPACES = /[\u00A0\u202F\u2007\u2009]/g;

/** Colapsa linhas em branco: n = quantas linhas em branco seguidas são permitidas. */
export function collapseBlank(text, n = 1) {
    const max = Math.max(0, n | 0);
    return text.replace(new RegExp(`\\n{${max + 2},}`, 'g'), '\n'.repeat(max + 1));
}

/** Limpeza que não altera o sentido do texto. */
export function safeClean(text, o) {
    let t = String(text ?? '');
    if (o.normalizeUnicode) {
        t = t.replace(/\r\n?/g, '\n').replace(ZERO_WIDTH, '').replace(ODD_SPACES, ' ');
    }
    if (o.stripHtmlComments) t = t.replace(/<!--[\s\S]*?-->/g, '');
    if (o.stripDecorLines) t = t.replace(/^[ \t]*[-=*_~#]{5,}[ \t]*$/gm, '');
    if (o.trimWhitespace) {
        t = t.replace(/[ \t]+$/gm, '').replace(/(\S)[ \t]{2,}(?=\S)/g, '$1 ');
    }
    if (o.maxBlankLines >= 0) t = collapseBlank(t, o.maxBlankLines);
    return o.trimWhitespace ? t.trim() : t;
}

/** Remove blocos de raciocínio (<think>…</think> e variantes). */
export function stripThink(text) {
    return text
        .replace(/<(think|thinking|thought|reasoning)\b[^>]*>[\s\S]*?<\/\1>/gi, '')
        .replace(/^[\s\S]*?<\/(?:think|thinking|thought|reasoning)>/i, (m) => (/<(think|thinking|thought|reasoning)\b/i.test(m) ? m : ''));
}

/** Remove tags HTML/CSS mantendo o texto interno. */
export function stripHtml(text) {
    return text
        .replace(/<(style|script)\b[\s\S]*?<\/\1>/gi, '')
        .replace(/<br\s*\/?>/gi, '\n')
        .replace(/<\/?(?:div|span|p|font|center|b|i|u|s|em|strong|small|sup|sub|details|summary|table|thead|tbody|tr|td|th|ul|ol|li|h[1-6]|img|a|hr|section|article|marquee|blockquote)\b[^>]*>/gi, '');
}

/** Mantém começo e fim, corta o meio. */
export function truncateMiddle(text, max) {
    if (!max || text.length <= max) return text;
    const marker = ' […] ';
    const budget = Math.max(20, max - marker.length);
    const headLen = Math.floor(budget * 0.6);
    const tailLen = budget - headLen;
    let head = text.slice(0, headLen);
    let tail = text.slice(text.length - tailLen);
    const sp = head.search(/\s\S*$/);
    if (sp > headLen - 25 && sp > 0) head = head.slice(0, sp);
    const sp2 = tail.search(/\s/);
    if (sp2 >= 0 && sp2 < 25) tail = tail.slice(sp2 + 1);
    return head.trimEnd() + marker + tail.trimStart();
}

const regexCache = new Map();

/** Converte o texto da textarea (1 regex por linha) em RegExp[]. */
export function parseRegexList(src) {
    const key = String(src ?? '');
    if (regexCache.has(key)) return regexCache.get(key);
    const out = [];
    for (const raw of key.split('\n')) {
        const line = raw.trim();
        if (!line || line.startsWith('//')) continue;
        try {
            const m = line.match(/^\/([\s\S]+)\/([a-z]*)$/);
            if (m) out.push(new RegExp(m[1], m[2].includes('g') ? m[2] : m[2] + 'g'));
            else out.push(new RegExp(line, 'g'));
        } catch {
            /* regex inválida: ignora */
        }
    }
    regexCache.set(key, out);
    return out;
}

export function applyRegexes(text, list) {
    let t = text;
    for (const re of list) {
        re.lastIndex = 0;
        t = t.replace(re, '');
    }
    return t;
}

/** Aplica fn nos textos de um `content` (string ou array multimodal). */
export function mapContent(content, fn, dropImages = false) {
    if (typeof content === 'string') return fn(content);
    if (Array.isArray(content)) {
        const parts = [];
        for (const p of content) {
            if (p && p.type === 'text' && typeof p.text === 'string') parts.push({ ...p, text: fn(p.text) });
            else if (dropImages && p && (p.type === 'image_url' || p.type === 'video_url')) continue;
            else parts.push(p);
        }
        return parts;
    }
    return content;
}

export function contentLength(content) {
    if (typeof content === 'string') return content.length;
    if (Array.isArray(content)) return content.reduce((n, p) => n + (p && typeof p.text === 'string' ? p.text.length : 0), 0);
    return 0;
}

export function contentText(content) {
    if (typeof content === 'string') return content;
    if (Array.isArray(content)) return content.map((p) => (p && typeof p.text === 'string' ? p.text : p?.type ? `[${p.type}]` : '')).join('\n');
    return '';
}

/** Remove linhas longas (>=40 chars) já vistas em blocos de sistema anteriores. */
export function dedupeLines(text, seen) {
    const keep = [];
    for (const line of text.split('\n')) {
        const key = line.trim().toLowerCase().replace(/\s+/g, ' ');
        if (key.length >= 40) {
            if (seen.has(key)) continue;
            seen.add(key);
        }
        keep.push(line);
    }
    return keep.join('\n');
}
