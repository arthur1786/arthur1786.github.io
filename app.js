// List of currencies to display
const currencies = ["USD", "EUR", "GBP", "BRL", "JPY", "CAD"];

// DOM references
const baseSel = document.getElementById("base");
const tbody   = document.querySelector("#rates tbody");
const updated = document.getElementById("updated");
const msg     = document.getElementById("msg");

/**
 * Tell the host (ScriptRunner → Jira) to resize the iframe to fit content.
 * Works via Atlassian Connect's AP.resize(). Adaptavist Bridge exposes AP.
 */
function resizeToContent() {
  try {
    if (typeof window.AP !== "undefined" && typeof window.AP.resize === "function") {
      window.AP.resize("100%", document.documentElement.scrollHeight + "px");
    }
  } catch (e) {
    // Cross‑origin access will throw; ignore and let the panel keep its default height.
  }
}
}

/**
 * Fetch and render FX rates using ExchangeRate-API (no key required).
 */
async function fetchRates(base) {
  msg.textContent = "";
  tbody.innerHTML = "<tr><td colspan='2'>Loading…</td></tr>";
  resizeToContent(); // ensure loading state fits too

  try {
    const res  = await fetch(`https://open.er-api.com/v6/latest/${base}`);
    if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
    const data = await res.json();
    if (data.result !== "success") throw new Error(data.error_type);

    tbody.innerHTML = "";
    currencies
      .filter(c => c !== base)
      .forEach(code => {
        const rate = data.rates[code];
        if (rate) {
          tbody.insertAdjacentHTML(
            "beforeend",
            `<tr><td>${code}</td><td>${rate.toFixed(4)}</td></tr>`
          );
        }
      });
    updated.textContent = data.time_last_update_utc
      ? `Updated ${new Date(data.time_last_update_utc).toLocaleDateString()}`
      : "";
  } catch (err) {
    tbody.innerHTML = "";
    msg.textContent = "Failed to load rates – " + err.message;
  } finally {
    // After DOM changes, ask host to resize
    resizeToContent();
  }
}

// Initial load and change handler
baseSel.addEventListener("change", e => fetchRates(e.target.value));
fetchRates(baseSel.value);

// Also resize once on initial DOMContentLoaded in case nothing else triggers
resizeToContent();
