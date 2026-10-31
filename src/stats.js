// Estatísticas persistentes (guardadas junto das configurações da extensão).

export function recordRun(s, r) {
    const st = s.stats;
    const cpt = s.charsPerToken || 3.6;
    const before = Math.round(r.charsBefore / cpt);
    const after = Math.round(r.charsAfter / cpt);
    st.runs += 1;
    st.tokensBefore += before;
    st.tokensAfter += after;
    st.last = { before, after, ...r, at: Date.now() };
}

export function resetStats(s) {
    s.stats = { runs: 0, tokensBefore: 0, tokensAfter: 0, last: null };
}

export function summarize(s) {
    const { runs, tokensBefore, tokensAfter, last } = s.stats;
    const saved = Math.max(0, tokensBefore - tokensAfter);
    return {
        runs,
        before: tokensBefore,
        after: tokensAfter,
        saved,
        pct: tokensBefore ? (saved / tokensBefore) * 100 : 0,
        usd: (saved / 1e6) * (s.pricePerMTok || 0),
        last,
    };
}
