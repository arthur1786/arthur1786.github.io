document.addEventListener('DOMContentLoaded', () => {
  const currencies = ['USD', 'EUR', 'GBP', 'BRL', 'JPY', 'CAD'];
  const baseSel = document.getElementById('base');
  const tbody   = document.querySelector('#rates tbody');
  const updated = document.getElementById('updated');
  const msg     = document.getElementById('msg');
 
  async function fetchRates(base) {
    msg.textContent = '';
    tbody.innerHTML = '<tr><td colspan="2">Loading…</td></tr>';
    try {
      const res  = await fetch(`https://open.er-api.com/v6/latest/${base}`);
      if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
      const data = await res.json();
      if (data.result !== 'success') throw new Error(data.error_type);
 
      tbody.innerHTML = '';
      currencies.filter(c => c !== base).forEach(code => {
        const rate = data.rates[code];
        if (rate) {
          tbody.insertAdjacentHTML(
            'beforeend',
            `<tr><td>${code}</td><td>${rate.toFixed(4)}</td></tr>`
          );
        }
      });
      updated.textContent = data.time_last_update_utc
        ? `Updated ${new Date(data.time_last_update_utc).toLocaleDateString()}`
        : '';
    } catch (err) {
      tbody.innerHTML = '';
      msg.textContent = 'Failed to load rates – ' + err.message;
    }
  }
 
  baseSel.addEventListener('change', e => fetchRates(e.target.value));
  fetchRates(baseSel.value);
});
