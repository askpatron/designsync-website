// Keep every marketing environment paired with the matching portal. This
// prevents staging reviews from creating chats, referrals, or purchases in
// production.
const designSyncLocal = ['localhost', '127.0.0.1'].includes(location.hostname);
const designSyncStaging = location.hostname === 'designs-staging.trydesignsync.com';
const designSyncPortalBase = designSyncLocal
    ? 'http://127.0.0.1:8100'
    : (designSyncStaging ? 'https://staging.trydesignsync.com' : 'https://app.trydesignsync.com');

if (designSyncLocal || designSyncStaging) {
    document.querySelectorAll('a[href^="https://app.trydesignsync.com"]').forEach((link) => {
        const target = new URL(link.href);
        link.href = designSyncPortalBase + target.pathname + target.search + target.hash;
    });
}

// Carry ?ref= through plan exploration and into every portal /start CTA.
// Browser storage is a convenience only. The portal decides validity and expiry.
(function () {
    const retain = globalThis.DesignSyncReferral && globalThis.DesignSyncReferral.retain;
    const applyToStartLinks = globalThis.DesignSyncReferral && globalThis.DesignSyncReferral.applyToStartLinks;
    if (typeof retain !== 'function' || typeof applyToStartLinks !== 'function') return;

    const queryCode = new URLSearchParams(location.search).get('ref');
    const code = retain(localStorage, queryCode);
    if (!code) return;

    applyToStartLinks(document, designSyncPortalBase, code);

    fetch(designSyncPortalBase + '/referral/capture', {
        method: 'POST',
        credentials: 'include',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code }),
    }).catch(() => {});
})();

// Header: Log in for guests, Workspace once the app session is visible.
(function () {
    const link = document.querySelector('[data-account-link]');
    if (!link) return;

    const safeHome = (home) => {
        if (typeof home !== 'string' || !home.startsWith('/') || home.startsWith('//') || home.includes('\\') || home.includes('://')) {
            return '/';
        }
        return home;
    };

    fetch(designSyncPortalBase + '/session-status', {
        credentials: 'include',
        headers: { Accept: 'application/json' },
    }).then((response) => (response.ok ? response.json() : null)).then((data) => {
        if (!data?.signed_in) return;
        link.href = designSyncPortalBase + safeHome(data.home);
        link.textContent = 'Workspace';
        link.classList.remove('btn-ghost');
        link.classList.add('btn-dark');
        link.setAttribute('aria-label', 'Open your workspace');
    }).catch(() => {});
})();

// Native DesignSync chat, opened only when requested.
(function () {
    const btn = document.querySelector('[data-chat]');
    if (! btn) return;
    const panel = document.querySelector('[data-chat-panel]');
    const frame = panel?.querySelector('iframe');
    const unread = btn.querySelector('[data-chat-unread]');
    const preview = document.querySelector('[data-chat-preview]');
    const previewText = preview?.querySelector('[data-chat-preview-text]');
    const chatUrl = designSyncPortalBase + '/chat';
    const clearUnread = () => { if (unread) unread.hidden = true; if (preview) preview.hidden = true; };
    const open = () => { if (!panel || !frame) return; if (!frame.src) frame.src = chatUrl + '?embed=1&from=' + encodeURIComponent(location.href); panel.hidden = false; btn.setAttribute('aria-expanded','true'); document.body.classList.add('chat-open'); clearUnread(); };
    const shut = () => { panel.hidden = true; btn.setAttribute('aria-expanded','false'); document.body.classList.remove('chat-open'); btn.focus(); };
    const newMessage = (text) => {
        if (!panel?.hidden) return;
        if (previewText && text) previewText.textContent = text;
        if (unread) unread.hidden = false;
        if (preview) preview.hidden = false;
    };
    btn.addEventListener('click', () => panel?.hidden ? open() : shut());
    preview?.addEventListener('click', open);
    document.addEventListener('pointerdown', event => {
        if (!panel?.hidden && !panel.contains(event.target) && !btn.contains(event.target)) shut();
    });
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && !panel.hidden) shut(); });
    window.addEventListener('message', event => {
        if (event.origin !== new URL(chatUrl).origin || event.data?.type !== 'designsync:message') return;
        newMessage(event.data.preview);
    });
    window.addEventListener('designsync:demo-message', event => newMessage(event.detail?.preview));
    if (designSyncLocal && new URLSearchParams(location.search).has('chatDemo')) {
        setTimeout(() => newMessage('Ada replied: I can help you choose the right plan.'), 500);
    }
})();

// Mobile project carousel: advance one card from right to left, while keeping
// native swipe available. A clone of the first card makes the loop reset
// invisibly instead of sliding backwards across the whole strip.
(function () {
    const track = document.querySelector('.work-grid');
    const mobile = window.matchMedia('(max-width: 640px)');
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (! track || ! mobile.matches || reducedMotion.matches) return;

    const cards = Array.from(track.querySelectorAll('img'));
    if (cards.length < 2) return;

    const loopCard = cards[0].cloneNode(true);
    loopCard.removeAttribute('data-reveal');
    loopCard.setAttribute('aria-hidden', 'true');
    track.appendChild(loopCard);

    let index = 0;
    let timer;
    let resumeTimer;
    const step = () => cards[0].getBoundingClientRect().width + parseFloat(getComputedStyle(track).gap || 0);
    const schedule = () => {
        clearInterval(timer);
        timer = setInterval(() => {
            if (document.hidden) return;
            index += 1;
            track.scrollTo({ left: step() * index, behavior: 'smooth' });

            if (index === cards.length) {
                setTimeout(() => {
                    track.scrollTo({ left: 0, behavior: 'auto' });
                    index = 0;
                }, 650);
            }
        }, 3200);
    };
    const pauseForInteraction = () => {
        clearInterval(timer);
        clearTimeout(resumeTimer);
        resumeTimer = setTimeout(schedule, 6000);
    };

    track.addEventListener('pointerdown', pauseForInteraction, { passive: true });
    track.addEventListener('touchstart', pauseForInteraction, { passive: true });
    document.addEventListener('visibilitychange', () => { if (! document.hidden) schedule(); });
    schedule();
})();

// On phones the skills section is not pinned to vertical scrolling. Keep the
// row moving like a continuous conveyor while preserving native swipe.
(function () {
    const viewport = document.querySelector('.cat-viewport');
    const track = viewport?.querySelector('.cat-track');
    const mobile = window.matchMedia('(max-width: 640px)');
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (! viewport || ! track || ! mobile.matches || reducedMotion.matches) return;

    const cards = Array.from(track.querySelectorAll('.cat-card:not([data-dup])'));
    if (cards.length < 2) return;

    track.classList.add('is-continuous');
    let resumeTimer;
    const start = () => {
        track.style.animationPlayState = 'running';
    };
    const pauseForInteraction = () => {
        track.style.animationPlayState = 'paused';
        clearTimeout(resumeTimer);
        resumeTimer = setTimeout(start, 6000);
    };

    viewport.addEventListener('pointerdown', pauseForInteraction, { passive: true });
    viewport.addEventListener('touchstart', pauseForInteraction, { passive: true });
    document.addEventListener('visibilitychange', () => {
        track.style.animationPlayState = document.hidden ? 'paused' : 'running';
    });
    start();
})();

// Split the grey half of each display heading into letters, so it can fill to
// the ink colour one character at a time on scroll. The stagger itself is CSS
// (see muted-resolve): all this does is create the letters and number them.
//
// If this never runs, the heading keeps its two-tone design state and nothing
// looks broken.
(function () {
    document.querySelectorAll('.display .muted').forEach((muted) => {
        const heading = muted.closest('.display');

        // The letters are decoration; give the heading its real text so screen
        // readers announce a sentence rather than a pile of spans. A <br> yields
        // no whitespace in textContent, so swap them for spaces on a clone first,
        // or the label reads "delivered,in three steps".
        if (heading && ! heading.hasAttribute('aria-label')) {
            const clone = heading.cloneNode(true);
            clone.querySelectorAll('br').forEach((br) => br.replaceWith(' '));
            heading.setAttribute('aria-label', clone.textContent.replace(/\s+/g, ' ').trim());
        }

        // Count the ink first: each letter needs to know its place in the whole
        // to work out when its turn comes.
        const nodes = Array.from(muted.childNodes);
        const total = nodes.reduce((n, node) =>
            node.nodeType === Node.TEXT_NODE ? n + node.textContent.replace(/\s/g, '').length : n, 0);
        if (! total) return;

        let i = 0;
        nodes.forEach((node) => {
            // Anything that is not text (a <br>, notably) passes through intact.
            if (node.nodeType !== Node.TEXT_NODE) return;

            const frag = document.createDocumentFragment();
            for (const ch of node.textContent) {
                // Spaces stay bare text nodes so the line still wraps normally.
                if (/\s/.test(ch)) {
                    frag.appendChild(document.createTextNode(ch));
                    continue;
                }
                const span = document.createElement('span');
                span.className = 'ltr';
                span.textContent = ch;
                span.style.setProperty('--i', i++);
                frag.appendChild(span);
            }
            muted.replaceChild(frag, node);
        });

        muted.style.setProperty('--n', total);
    });
})();

// Reveal sections as they scroll into view. CSS hides them only while html.js
// is set, so any failure in here leaves the page fully visible rather than blank.
(function () {
    const items = document.querySelectorAll('[data-reveal]');
    if (! items.length) return;

    // Cascade the children of a marked group so grids flow in instead of popping.
    document.querySelectorAll('[data-reveal-stagger]').forEach((group) => {
        Array.from(group.children).forEach((child, i) => {
            child.style.setProperty('--reveal-delay', (i * 90) + 'ms');
        });
    });

    const reveal = (el) => el.classList.add('is-in');

    // Absolute inset from the viewport bottom — same idea as the old IO margin.
    const nearViewport = (el) => {
        const rect = el.getBoundingClientRect();
        const vh = window.innerHeight || document.documentElement.clientHeight;
        return rect.top < vh - 80 && rect.bottom > 0;
    };

    // Sync pass: cover restored scroll positions and cases where IO is late or
    // quiet (some embedded / reduced-motion environments never deliver entries).
    const revealVisible = () => {
        items.forEach((el) => {
            if (el.classList.contains('is-in')) return;
            if (nearViewport(el)) reveal(el);
        });
    };

    if (! ('IntersectionObserver' in window)) {
        items.forEach(reveal);
        return;
    }

    const io = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            const scrolledPast = entry.boundingClientRect.bottom < 0;
            if (! entry.isIntersecting && ! scrolledPast) return;
            reveal(entry.target);
            io.unobserve(entry.target);
        });
    }, { rootMargin: '0px 0px -80px 0px', threshold: 0 });

    items.forEach((el) => io.observe(el));
    revealVisible();
    window.addEventListener('scroll', revealVisible, { passive: true });
    window.addEventListener('resize', revealVisible);
})();

// Testimonial carousel: arrows scroll the track one card at a time.
(function () {
    const track = document.getElementById('testiTrack');
    if (! track) return;

    // Approved reviews are the publication switch: pending/rejected submissions
    // never enter this feed. Keep the honest placeholders if the API is empty or
    // unavailable, so the page never invents social proof.
    fetch(designSyncPortalBase + '/feedback/published', {
        headers: { Accept: 'application/json' },
    })
        .then((response) => response.ok ? response.json() : Promise.reject())
        .then(({ data }) => {
            if (! Array.isArray(data) || data.length === 0) return;

            const fragment = document.createDocumentFragment();
            data.forEach((review) => {
                const card = document.createElement('div');
                card.className = 'testi-card';

                const stars = document.createElement('div');
                stars.className = 'stars';
                stars.setAttribute('aria-label', `${review.rating} out of 5 stars`);
                stars.textContent = '★'.repeat(review.rating) + '☆'.repeat(5 - review.rating);

                const quote = document.createElement('p');
                quote.textContent = review.body;

                const source = document.createElement('div');
                source.className = 'testi-source';
                source.textContent = [
                    review.author_name,
                    review.author_title,
                    review.company_name,
                ].filter(Boolean).join(' · ');

                card.append(stars, quote, source);
                fragment.append(card);
            });

            track.replaceChildren(fragment);
        })
        .catch(() => {});

    const step = () => {
        const card = track.querySelector('.testi-card');
        return card ? card.offsetWidth + 20 : 360;
    };
    document.querySelectorAll('.testi-arrows .arrow').forEach((btn) => {
        btn.addEventListener('click', () => {
            track.scrollBy({ left: step() * Number(btn.dataset.dir), behavior: 'smooth' });
        });
    });
})();

// FAQ: keep only one item open at a time, matching the design.
(function () {
    const items = document.querySelectorAll('.faq-item');
    items.forEach((item) => {
        item.addEventListener('toggle', () => {
            if (item.open) {
                items.forEach((other) => { if (other !== item) other.open = false; });
            }
        });
    });
})();
