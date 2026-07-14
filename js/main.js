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
