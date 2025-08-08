document.addEventListener('DOMContentLoaded', () => {
  /* ─── config ─────────────────────────────────────────────────── */
  const BASE = 'USD';           // fixed base

  // labels shown in the UI
  const currencies = [
    'EUR', 'GBP', 'CAD', 'AUD',
    'WON', 'YEN', 'BRL', 'SEK',
    'CHF', 'DKK', 'NOK'
  ];

  // mapping to the real ISO-4217 codes used by the API
  const apiCodeOf = {
    EUR: 'EUR',
    GBP: 'GBP',
    CAD: 'CAD',
    AUD: 'AUD',
    WON: 'KRW',  // South-Korean Won
    YEN: 'JPY',  // Japanese Yen
    BRL: 'BRL',
    SEK: 'SEK',
    CHF: 'CHF',
    DKK: 'DKK',
    NOK: 'NOK'
  };

  /* ─── DOM refs ───────────────────────────────────────────────── */
  const carousel = document.getElementById('carousel');
  const updated  = document.getElementById('updated');
  const msg      = document.getElementById('msg');
  const prevBtn  = document.getElementById('prev');
  const nextBtn  = document.getElementById('next');

  /* ─── build slides once ──────────────────────────────────────── */
  currencies.forEach(code => {
    carousel.insertAdjacentHTML(
      'beforeend',
      `<div class="slide">
         <span class="code">${code}</span>
         <span class="rate" id="rate-${code}">--</span>
       </div>`
    );
  });

  /* ─── fetch + render rates ───────────────────────────────────── */
  async function fetchRates () {
    try {
      msg.textContent = '';
      const res  = await fetch(`https://open.er-api.com/v6/latest/${BASE}`);
      if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);

      const data = await res.json();
      if (data.result !== 'success') throw new Error(data.error_type);

      currencies.forEach(code => {
        const rate = data.rates[apiCodeOf[code]];   // <-- mapped lookup
        document.getElementById(`rate-${code}`).textContent =
          rate ? rate.toFixed(4) : 'N/A';
      });

      updated.textContent = data.time_last_update_utc
        ? `Updated ${new Date(data.time_last_update_utc)
            .toLocaleDateString(undefined, { dateStyle: 'medium' })}`
        : '';
    } catch (err) {
      msg.textContent = 'Failed to load rates – ' + err.message;
    }
  }

  /* ─── tiny carousel slider ───────────────────────────────────── */
  let index = 0;
  function showSlide (i) {
    index = (i + currencies.length) % currencies.length;
    carousel.style.transform = `translateX(-${index * 100}%)`;
  }
  prevBtn.addEventListener('click', () => showSlide(index - 1));
  nextBtn.addEventListener('click', () => showSlide(index + 1));

  /* ─── init ───────────────────────────────────────────────────── */
  fetchRates();
  showSlide(0);
});
