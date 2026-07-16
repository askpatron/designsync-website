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

    if (! ('IntersectionObserver' in window)) {
        items.forEach((el) => el.classList.add('is-in'));
        return;
    }

    // Trigger 80px above the viewport bottom. Deliberately an absolute value, not
    // a percentage: a percentage scales with viewport height, so a tall window
    // creates a dead zone at the foot of the page that never reveals.
    const io = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            // Also reveal anything the page has already scrolled past (restored
            // scroll position, or an anchor jump), which never "enters" the view.
            const scrolledPast = entry.boundingClientRect.bottom < 0;
            if (! entry.isIntersecting && ! scrolledPast) return;
            entry.target.classList.add('is-in');
            io.unobserve(entry.target);
        });
    }, { rootMargin: '0px 0px -80px 0px', threshold: 0 });

    items.forEach((el) => io.observe(el));
})();

// Testimonial carousel: arrows scroll the track one card at a time.
(function () {
    const track = document.getElementById('testiTrack');
    if (! track) return;
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
