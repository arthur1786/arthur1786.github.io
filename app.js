document.addEventListener('DOMContentLoaded', () => {
  const BASE       = 'USD';
  const currencies = ['EUR','GBP','CAD','AUD','WON','YEN','BRL','SEK','CHF','DKK','NOK'];
  const apiMap     = { EUR:'EUR', GBP:'GBP', CAD:'CAD', AUD:'AUD',
                       WON:'KRW', YEN:'JPY', BRL:'BRL', SEK:'SEK',
                       CHF:'CHF', DKK:'DKK', NOK:'NOK' };

  const codeEl    = document.getElementById('slide-code');
  const rateEl    = document.getElementById('slide-rate');
  const updatedEl = document.getElementById('updated');
  const msgEl     = document.getElementById('msg');
  const prevBtn   = document.getElementById('prev');
  const nextBtn   = document.getElementById('next');

  let rates = {};
  let idx   = 0;

  // fetch rates once
  fetch(`https://open.er-api.com/v6/latest/${BASE}`)
    .then(r => r.json())
    .then(data => {
      if (data.result !== 'success') throw new Error(data.error_type);
      // build a simple map of codes → numbers
      currencies.forEach(c => {
        rates[c] = data.rates[apiMap[c]] ?? null;
      });
      updatedEl.textContent = data.time_last_update_utc
        ? `Updated ${new Date(data.time_last_update_utc).toLocaleDateString(undefined,{dateStyle:'medium'})}`
        : '';

      showCurrent();  // render the first
    })
    .catch(err => {
      msgEl.textContent = 'Failed to load rates – ' + err.message;
    });

  function showCurrent() {
    const code = currencies[idx];
    const val  = rates[code];
    codeEl.textContent = code;
    rateEl.textContent = val !== null ? val.toFixed(4) : 'N/A';
  }

  prevBtn.addEventListener('click', () => {
    idx = (idx - 1 + currencies.length) % currencies.length;
    showCurrent();
  });

  nextBtn.addEventListener('click', () => {
    idx = (idx + 1) % currencies.length;
    showCurrent();
  });
});
