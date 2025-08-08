document.addEventListener('DOMContentLoaded', () => {
  /* ─── config ─────────────────────────────────────────────────── */
  const BASE       = 'USD';
  const currencies = ['EUR','GBP','CAD','AUD','WON','YEN','BRL','SEK','CHF','DKK','NOK'];
  const apiCodeOf  = {
    EUR:'EUR', GBP:'GBP', CAD:'CAD', AUD:'AUD',
    WON:'KRW', YEN:'JPY', BRL:'BRL', SEK:'SEK',
    CHF:'CHF', DKK:'DKK', NOK:'NOK'
  };

  /* ─── DOM refs ───────────────────────────────────────────────── */
  const carousel = document.getElementById('carousel');
  const wrapper  = document.querySelector('.carousel-wrapper');
  const prevBtn  = document.getElementById('prev');
  const nextBtn  = document.getElementById('next');
  const updated  = document.getElementById('updated');
  const msg      = document.getElementById('msg');

  /* ─── build slides ───────────────────────────────────────────── */
  currencies.forEach(code => {
    carousel.insertAdjacentHTML('beforeend', `
      <div class="slide">
        <span class="code">${code}</span>
        <span class="rate" id="rate-${code}">--</span>
      </div>
    `);
  });

  const slides = Array.from(carousel.children);

  /* ─── size slides exactly to wrapper ─────────────────────────── */
  function sizeSlides() {
    const width  = wrapper.clientWidth;
    const height = wrapper.clientHeight;
    slides.forEach(slide => {
      slide.style.width  = `${width}px`;
      slide.style.height = `${height}px`;
    });
  }

  window.addEventListener('resize', () => {
    sizeSlides();
    // re-center on the current slide
    showSlide(currentIndex);
  });

  /* ─── fetch + render rates ───────────────────────────────────── */
  async function fetchRates() {
    try {
      msg.textContent = '';
      const res  = await fetch(`https://open.er-api.com/v6/latest/${BASE}`);
      if (!res.ok) throw new Error(res.statusText);
      const data = await res.json();
      if (data.result !== 'success') throw new Error(data.error_type);

      currencies.forEach(code => {
        const r = data.rates[apiCodeOf[code]];
        document.getElementById(`rate-${code}`).textContent = r ? r.toFixed(4) : 'N/A';
      });

      updated.textContent = data.time_last_update_utc
        ? `Updated ${new Date(data.time_last_update_utc)
            .toLocaleDateString(undefined, { dateStyle: 'medium' })}`
        : '';
    } catch (err) {
      msg.textContent = 'Failed to load rates – ' + err.message;
    }
  }

  /* ─── carousel logic ─────────────────────────────────────────── */
  let currentIndex = 0;
  function showSlide(i) {
    currentIndex = (i + slides.length) % slides.length;
    const offset = wrapper.clientWidth * currentIndex;
    carousel.style.transform = `translateX(-${offset}px)`;
  }

  prevBtn.addEventListener('click', () => showSlide(currentIndex - 1));
  nextBtn.addEventListener('click', () => showSlide(currentIndex + 1));

  /* ─── init ───────────────────────────────────────────────────── */
  fetchRates().then(() => {
    sizeSlides();
    showSlide(0);
  });
});
