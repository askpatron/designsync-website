// Browser convenience for marketing referral codes. The portal cookie is the
// source of truth for first-valid attribution. This only remembers a code so
// every /start CTA can carry it as a fallback.
(function (global) {
    const storageKey = 'ds_referral';
    const maxAgeMs = 365 * 24 * 60 * 60 * 1000;
    const pattern = /^[A-Za-z0-9_-]{1,40}$/;

    const normalize = (value) => {
        const code = String(value || '').trim();
        return pattern.test(code) ? code : '';
    };

    const readStored = (storage, now) => {
        try {
            const raw = storage.getItem(storageKey);
            if (!raw) return null;
            const data = JSON.parse(raw);
            const code = normalize(data && data.code);
            const capturedAt = Date.parse(data && data.capturedAt);
            const clock = typeof now === 'number' ? now : Date.now();
            if (!code || Number.isNaN(capturedAt) || capturedAt > clock || (clock - capturedAt) > maxAgeMs) {
                storage.removeItem(storageKey);
                return null;
            }
            return { code, capturedAt: data.capturedAt };
        } catch (error) {
            try { storage.removeItem(storageKey); } catch (ignore) {}
            return null;
        }
    };

    const writeStored = (storage, code, now) => {
        try {
            storage.setItem(storageKey, JSON.stringify({
                code,
                capturedAt: new Date(typeof now === 'number' ? now : Date.now()).toISOString(),
            }));
        } catch (ignore) {}
    };

    // An explicit well-formed ?ref= always updates the convenience value, even
    // when a previous unknown, disabled or expired code is still stored. Invalid
    // query values leave the stored code alone. The server still decides whether
    // the first valid capture may be replaced.
    const retain = (storage, queryRef, now) => {
        const queryCode = normalize(queryRef);
        if (queryCode) {
            writeStored(storage, queryCode, now);
        }
        const stored = readStored(storage, now);
        return (stored && stored.code) || queryCode || '';
    };

    const applyToStartLinks = (doc, portalBase, code) => {
        let portal;
        try { portal = new URL(portalBase); } catch (error) { return; }
        Array.from(doc.querySelectorAll('a[href]')).forEach((link) => {
            let url;
            try { url = new URL(link.href, portal.origin + '/'); } catch (error) { return; }
            if (url.origin !== portal.origin) return;
            if (url.pathname !== '/start' && url.pathname !== '/start/') return;
            url.searchParams.set('ref', code);
            link.href = url.toString();
        });
    };

    global.DesignSyncReferral = {
        storageKey,
        normalize,
        readStored,
        writeStored,
        retain,
        applyToStartLinks,
    };
})(typeof window !== 'undefined' ? window : globalThis);
