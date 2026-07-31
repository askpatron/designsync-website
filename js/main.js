// Live chat, loaded on click rather than on page load.
//
// Tawk's own snippet fetches on page load and starts monitoring immediately.
// That puts a third-party script and a websocket on the critical path of the
// page we buy ad traffic for, for the small share who ever open chat, and it
// tracks people before they have asked for anything. Deferring to the click
// keeps the page fast and means there is nothing to consent to: the click IS the
// request for the service.
(function () {
    const btn = document.querySelector('[data-chat]');
    if (! btn) return;

    const PROPERTY = '6a591c54940f101d53239d3b';
    const WIDGET = '1jtm1db40';
    let loading = false;

    btn.addEventListener('click', () => {
        if (loading) return;
        loading = true;
        btn.setAttribute('aria-busy', 'true');

        window.Tawk_API = window.Tawk_API || {};
        window.Tawk_LoadStart = new Date();

        // Set before the script loads, or we miss the hook. The click already
        // said "I want to chat", so open it rather than leave them a bubble to
        // click a second time; Tawk's own launcher then replaces ours.
        window.Tawk_API.onLoad = function () {
            if (typeof window.Tawk_API.maximize === 'function') window.Tawk_API.maximize();
            btn.remove();
        };

        const s = document.createElement('script');
        s.async = true;
        s.src = 'https://embed.tawk.to/' + PROPERTY + '/' + WIDGET;
        s.charset = 'UTF-8';
        s.setAttribute('crossorigin', '*');
        // Blocked by a shield, or offline: give the button back rather than
        // leave a dead control.
        s.onerror = () => {
            loading = false;
            btn.removeAttribute('aria-busy');
        };
        document.head.appendChild(s);
    });
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
    fetch('https://app.trydesignsync.com/feedback/published', {
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
