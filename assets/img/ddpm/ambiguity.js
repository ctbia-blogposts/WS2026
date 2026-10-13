/* Exact Bayesian denoising for an equally weighted two-point prior.
 * This illustration uses the paper's schedule; it does not run a trained DDPM.
 */
(() => {
  const figure = document.getElementById("ddpm-ambiguity");
  if (!figure) return;
  const time = figure.querySelector("#ddpm-time");
  const observation = figure.querySelector("#ddpm-observation");
  const plot = figure.querySelector("#ddpm-density-plot");
  const readout = figure.querySelector("#ddpm-posterior");
  const alphaBar = [1];
  for (let t = 1; t <= 1000; t++) {
    const beta = 0.0001 + ((0.02 - 0.0001) * (t - 1)) / 999;
    alphaBar[t] = alphaBar[t - 1] * (1 - beta);
  }
  const format = (value) => (Math.abs(value) < 0.005 ? "0.00" : value.toFixed(2));
  function render() {
    const t = Number(time.value);
    const y = Number(observation.value) / 100;
    const signal = Math.sqrt(alphaBar[t]);
    const variance = 1 - alphaBar[t];
    const noise = Math.sqrt(variance);
    // Stable form of Bayes' rule: posterior mean = tanh(signal * y / variance).
    const estimate = Math.tanh((signal * y) / variance);
    const probability = (1 + estimate) / 2;
    const predictedNoise = (y - signal * estimate) / noise;
    const width = Math.max(280, plot.clientWidth);
    const height = 275;
    const left = 28;
    const right = width - 18;
    const top = 32;
    const baseline = 218;
    const peak = 0.5 / (Math.sqrt(2 * Math.PI) * noise);
    const sx = (x) => left + ((x + 3) / 6) * (right - left);
    const sy = (density) => baseline - (density / peak) * (baseline - top);
    function curve(mean) {
      // Include the exact mean so a very narrow low-noise peak stays visible.
      const xs = Array.from({ length: 501 }, (_, i) => -3 + (6 * i) / 500);
      xs.push(mean);
      xs.sort((a, b) => a - b);
      return xs
        .map((x, i) => {
          const density = peak * Math.exp(-((x - mean) ** 2) / (2 * variance));
          return `${i ? "L" : "M"}${sx(x).toFixed(2)},${sy(density).toFixed(2)}`;
        })
        .join(" ");
    }
    const ticks = [-2, -1, 0, 1, 2].map((x) => `<text x="${sx(x)}" y="240" text-anchor="middle">${x}</text>`).join("");
    plot.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" aria-hidden="true">
      <g fill="none" stroke="currentColor">
        <path d="M${left},${baseline} H${right}" opacity=".35"/>
        <path d="${curve(-signal)}" stroke-width="2" stroke-dasharray="6 4" opacity=".65"/>
        <path d="${curve(signal)}" stroke-width="2.5"/>
        <path d="M${sx(y)},${top} V${baseline}" stroke-width="1" opacity=".4"/>
      </g>
      <g fill="currentColor" font-family="system-ui, sans-serif" font-size="13">
        <text x="${left}" y="18">– – source −1</text>
        <text x="${right}" y="18" text-anchor="end">— source +1</text>
        ${ticks}
        <text x="${(left + right) / 2}" y="267" text-anchor="middle">Noisy observation xₜ</text>
      </g>
      <circle cx="${sx(y)}" cy="${baseline}" r="4" fill="currentColor"/>
    </svg>`;
    figure.querySelector("#ddpm-time-value").textContent = `t = ${t}`;
    figure.querySelector("#ddpm-observation-value").textContent = `xₜ = ${format(y)}`;
    readout.textContent = `P(source +1 | xₜ) = ${(probability * 100).toFixed(1)}%. Optimal clean estimate = ${format(estimate)}. Predicted noise = ${format(predictedNoise)}.`;
    readout.dataset.estimate = String(estimate);
    readout.dataset.probability = String(probability);
    plot.setAttribute(
      "aria-label",
      `At timestep ${t}, the two Gaussian clouds have means ${format(-signal)} and ${format(signal)} and standard deviation ${format(noise)}. Selected observation ${format(y)} gives probability ${(probability * 100).toFixed(1)} percent for source +1.`
    );
  }
  time.addEventListener("input", render);
  observation.addEventListener("input", render);
  new ResizeObserver(render).observe(plot);
  render();
})();
