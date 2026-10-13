/* Analytical two-point denoiser plus one DDPM-style Gaussian reverse step.
 * No trained network, full reverse chain, or exact posterior sampler is claimed.
 */
(() => {
  const figure = document.getElementById("ddpm-step-lab");
  if (!figure) return;
  const time = figure.querySelector("#ddpm-step-time");
  const observation = figure.querySelector("#ddpm-step-observation");
  const noiseInput = figure.querySelector("#ddpm-step-noise");
  const fresh = figure.querySelector("#ddpm-step-resample");
  const zero = figure.querySelector("#ddpm-step-zero");
  const plot = figure.querySelector("#ddpm-step-plot");
  const result = figure.querySelector("#ddpm-step-result");
  const alphaBar = [1];
  const beta = [0];
  for (let t = 1; t <= 1000; t++) {
    beta[t] = 0.0001 + ((0.02 - 0.0001) * (t - 1)) / 999;
    alphaBar[t] = alphaBar[t - 1] * (1 - beta[t]);
  }
  const format = (x) => (Math.abs(x) < 0.00005 ? "0.0000" : x.toFixed(4));
  function render() {
    const t = Number(time.value);
    const observed = Number(observation.value) / 100;
    const z = Number(noiseInput.value) / 100;
    const signal = Math.sqrt(alphaBar[t]);
    const variance = 1 - alphaBar[t];
    const clean = Math.tanh((signal * observed) / variance);
    const epsilon = (observed - signal * clean) / Math.sqrt(variance);
    const mean = (observed - (beta[t] / Math.sqrt(variance)) * epsilon) / Math.sqrt(1 - beta[t]);
    const sigma = t > 1 ? Math.sqrt(beta[t]) : 0;
    const next = mean + sigma * z;
    noiseInput.disabled = t === 1;
    fresh.disabled = t === 1;
    zero.disabled = t === 1;
    figure.querySelector("#ddpm-step-time-value").textContent = `t = ${t}`;
    figure.querySelector("#ddpm-step-observation-value").textContent = `xₜ = ${observed.toFixed(2)}`;
    figure.querySelector("#ddpm-step-noise-value").textContent = t > 1 ? `z = ${z.toFixed(2)}` : "No random term at t = 1";
    result.textContent = `Clean estimate = ${format(clean)}; reverse mean = ${format(mean)}; next state = ${format(next)}. ${t > 1 ? `Random displacement σₜz = ${format(sigma * z)}.` : "The final step has zero random displacement."}`;
    Object.assign(result.dataset, { clean: String(clean), mean: String(mean), next: String(next), sigma: String(sigma) });
    const width = Math.max(280, plot.clientWidth);
    const left = 116;
    const right = width - 18;
    const limit = Math.max(2.5, Math.abs(observed) + 0.25, Math.abs(next) + 0.25);
    const sx = (x) => left + ((x + limit) / (2 * limit)) * (right - left);
    const rows = [
      ["Clean estimate", clean, 52],
      ["Reverse mean", mean, 123],
      ["Next state", next, 194],
    ];
    const accent = "var(--global-theme-color)";
    const rowMarkup = rows
      .map(
        ([label, value, y], i) => `
      <text x="0" y="${y + 4}" fill="currentColor">${label}</text>
      <text x="0" y="${y + 23}" fill="currentColor" opacity=".65">${format(value)}</text>
      <path d="M${left},${y} H${right}" stroke="currentColor" opacity=".25"/>
      ${i === 2 ? `<path d="M${sx(mean)},${y} H${sx(next)}" stroke="${accent}" stroke-width="3"/>` : ""}
      <circle cx="${sx(value)}" cy="${y}" r="5" fill="${i === 2 ? accent : "currentColor"}"/>
    `
      )
      .join("");
    const ticks = [-2, -1, 0, 1, 2].map((x) => `<text x="${sx(x)}" y="243" text-anchor="middle" fill="currentColor">${x}</text>`).join("");
    plot.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} 275" aria-hidden="true">
      <g font-family="system-ui, sans-serif" font-size="13">
        <path d="M${sx(observed)},22 V220" stroke="currentColor" opacity=".2" stroke-dasharray="4 4"/>
        ${rowMarkup}${ticks}
        <text x="${(left + right) / 2}" y="267" text-anchor="middle" fill="currentColor">Shared coordinate axis</text>
      </g>
    </svg>`;
    plot.setAttribute(
      "aria-label",
      `At timestep ${t} and observed value ${observed}, clean estimate ${format(clean)}, reverse mean ${format(mean)}, and next state ${format(next)}. Random displacement ${format(sigma * z)}.`
    );
  }
  for (const input of [time, observation, noiseInput]) input.addEventListener("input", render);
  zero.addEventListener("click", () => {
    noiseInput.value = "0";
    render();
  });
  fresh.addEventListener("click", () => {
    // Box–Muller; the slider displays the sample rounded to two decimal places.
    const z = Math.sqrt(-2 * Math.log(1 - Math.random())) * Math.cos(2 * Math.PI * Math.random());
    const value = Math.round(z * 100);
    // Extend the control for rare tails instead of silently clipping the sample.
    noiseInput.min = String(Math.min(-300, value));
    noiseInput.max = String(Math.max(300, value));
    noiseInput.value = String(value);
    render();
  });
  new ResizeObserver(render).observe(plot);
  render();
})();
