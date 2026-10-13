const { test, expect } = require("@playwright/test");

for (const theme of ["light", "dark"]) {
  test(`DDPM review, scientific figures, and posterior experiment (${theme})`, async ({ page }, testInfo) => {
    await page.route("**/livereload.js*", (route) => route.abort());
    await page.addInitScript((theme) => localStorage.setItem("theme", theme), theme);
    await page.goto("/WS2026/articles/ddpm/", { waitUntil: "domcontentloaded" });
    // The loading spinner is also an SVG; require actual compiled diagram paths.
    await expect(page.locator(".seminar-tikz svg:has(path)")).toHaveCount(4, { timeout: 90000 });
    await expect(page.locator('img[src*="invalid.site"]')).toHaveCount(0);
    await expect(page.locator(".seminar-byline")).toContainText("Supervisor: Supervisor Name");
    if (theme === "dark") {
      const ink = await page
        .locator(".seminar-tikz svg text")
        .first()
        .evaluate((element) => getComputedStyle(element).fill);
      expect(ink).not.toBe("rgb(0, 0, 0)");
    }
    await expect(page.locator("d-citation-list")).toContainText("Denoising Diffusion Probabilistic Models");
    await expect(page.locator("d-cite").first()).toContainText("1");
    await expect(page.locator("#ddpm-density-plot svg")).toBeVisible();
    const setSlider = async (selector, value) => {
      await page.locator(selector).evaluate((element, value) => {
        element.value = String(value);
        element.dispatchEvent(new Event("input", { bubbles: true }));
      }, value);
    };
    await setSlider("#ddpm-observation", 0);
    await expect(page.locator("#ddpm-posterior")).toHaveAttribute("data-estimate", "0");
    await expect(page.locator("#ddpm-posterior")).toHaveAttribute("data-probability", "0.5");
    await setSlider("#ddpm-time", 1);
    await setSlider("#ddpm-observation", 100);
    expect(Number(await page.locator("#ddpm-posterior").getAttribute("data-estimate"))).toBeGreaterThan(0.99);
    await setSlider("#ddpm-time", 1000);
    expect(Math.abs(Number(await page.locator("#ddpm-posterior").getAttribute("data-estimate")))).toBeLessThan(0.01);
    await setSlider("#ddpm-time", 300);
    await setSlider("#ddpm-observation", 50);
    await page.locator("#ddpm-time").focus();
    await page.locator("#ddpm-time").press("ArrowRight");
    await expect(page.locator("#ddpm-time")).toHaveValue("301");
    await setSlider("#ddpm-time", 300);
    await expect(page.locator("#ddpm-step-plot svg")).toBeVisible();
    await expect(page.locator(".ddpm-table-scroll table")).toHaveCount(3);
    await setSlider("#ddpm-step-noise", 0);
    const stepResult = page.locator("#ddpm-step-result");
    const mean = Number(await stepResult.getAttribute("data-mean"));
    expect(Number(await stepResult.getAttribute("data-next"))).toBeCloseTo(mean, 10);
    const clean = await stepResult.getAttribute("data-clean");
    await setSlider("#ddpm-step-noise", 100);
    expect(Number(await stepResult.getAttribute("data-next"))).toBeGreaterThan(mean);
    await expect(stepResult).toHaveAttribute("data-clean", clean);
    await expect(stepResult).toHaveAttribute("data-mean", String(mean));
    await page.locator("#ddpm-step-zero").click();
    await expect(page.locator("#ddpm-step-noise")).toHaveValue("0");
    await page.locator("#ddpm-step-resample").click();
    const drawnNoise = Number(await page.locator("#ddpm-step-noise").inputValue()) / 100;
    const sigma = Number(await stepResult.getAttribute("data-sigma"));
    expect(Number(await stepResult.getAttribute("data-next"))).toBeCloseTo(mean + sigma * drawnNoise, 10);
    await setSlider("#ddpm-step-time", 1);
    await expect(page.locator("#ddpm-step-noise")).toBeDisabled();
    expect(Number(await stepResult.getAttribute("data-next"))).toBeCloseTo(Number(await stepResult.getAttribute("data-clean")), 10);
    await setSlider("#ddpm-step-time", 600);
    await setSlider("#ddpm-step-noise", 100);
    await page.locator("#ddpm-step-lab").screenshot({ path: `output/playwright/ddpm-step-${testInfo.project.name}-${theme}.png` });
    await expect(page.locator("d-citation-list")).toContainText("Denoising Diffusion Implicit Models");
    await expect(page.locator("d-citation-list")).toContainText("Improved Denoising Diffusion Probabilistic Models");
    await expect(page.locator("mjx-container").first()).toBeVisible();
    await expect(page.locator("mjx-merror")).toHaveCount(0);
    const sidenotes = page.locator("aside.seminar-sidenote");
    await expect(sidenotes).toHaveCount(3);
    for (const note of await sidenotes.all()) {
      const placement = await note.evaluate((element) => ({
        note: element.getBoundingClientRect().toJSON(),
        paragraph: element.previousElementSibling.getBoundingClientRect().toJSON(),
      }));
      if (testInfo.project.name === "desktop") {
        expect(placement.note.left).toBeGreaterThan(placement.paragraph.right);
        expect(Math.abs(placement.note.top - placement.paragraph.top)).toBeLessThanOrEqual(2);
      } else {
        expect(placement.note.left).toBeCloseTo(placement.paragraph.left, 0);
        expect(placement.note.top).toBeGreaterThanOrEqual(placement.paragraph.bottom);
      }
    }
    await sidenotes.first().screenshot({ path: `output/playwright/ddpm-sidenote-${testInfo.project.name}-${theme}.png` });
    for (const id of ["ddpm-forward-derivation", "ddpm-score-derivation"]) {
      const derivation = page.locator(`#${id}`);
      await expect(derivation).not.toHaveAttribute("open", "");
      await derivation.locator("summary").focus();
      await derivation.locator("summary").press("Enter");
      await expect(derivation).toHaveAttribute("open", "");
      await expect(derivation.locator("mjx-container").first()).toBeVisible();
      await expect(derivation.locator("mjx-merror")).toHaveCount(0);
      await derivation.screenshot({ path: `output/playwright/${id}-${testInfo.project.name}-${theme}.png` });
      await derivation.locator("summary").press("Enter");
      await expect(derivation).not.toHaveAttribute("open", "");
    }

    for (const link of await page.locator("d-contents a").all()) {
      const hash = await link.getAttribute("href");
      await expect(page.locator(hash)).toBeAttached();
    }
    const articleFigures = page.locator("d-article figure");
    await expect(articleFigures).toHaveCount(15);
    for (const figure of await articleFigures.all()) {
      await figure.scrollIntoViewIfNeeded();
      for (const image of await figure.locator("img").all()) {
        await expect(image).toHaveAttribute("alt", /.+/);
        await expect.poll(() => image.evaluate((element) => element.complete && element.naturalWidth > 0)).toBe(true);
        expect(await image.getAttribute("src")).toMatch(/^\/WS2026\/assets\//);
      }
    }
    for (const name of ["score-field", "reverse-posterior", "loss-weighting", "unet-architecture", "residual-block", "objective-ablation"]) {
      await page.locator(`figure:has(img[src*="${name}.svg"])`).screenshot({
        path: `output/playwright/ddpm-${name}-${testInfo.project.name}-${theme}.png`,
      });
    }
    await expect(page.locator(".seminar-figure-label")).toHaveCount(0);
    await expect(page.locator("#back-to-top")).toBeVisible();
    const arrowAlignment = await page.locator("#back-to-top").evaluate((element) => {
      const button = element.getBoundingClientRect();
      const icon = element.querySelector("svg").getBoundingClientRect();
      return {
        x: Math.abs(button.x + button.width / 2 - icon.x - icon.width / 2),
        y: Math.abs(button.y + button.height / 2 - icon.y - icon.height / 2),
      };
    });
    expect(arrowAlignment.x).toBeLessThanOrEqual(1);
    expect(arrowAlignment.y).toBeLessThanOrEqual(1);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.locator("#ddpm-ambiguity").screenshot({ path: `output/playwright/ddpm-experiment-${testInfo.project.name}-${theme}.png` });
    const policy = await page.locator('meta[http-equiv="Content-Security-Policy"]').getAttribute("content");
    expect(policy).toContain("'wasm-unsafe-eval'");
    expect(policy).toContain("worker-src 'self' blob:");
    for (const svg of await page.locator(".seminar-tikz svg").all()) {
      const dimensions = await svg.evaluate((element) => ({
        diagram: element.getBoundingClientRect().width,
        available: element.parentElement.clientWidth,
      }));
      expect(Math.abs(dimensions.diagram - dimensions.available)).toBeLessThanOrEqual(1);
    }
    await page
      .locator(".seminar-tikz")
      .first()
      .screenshot({ path: `output/playwright/ddpm-tikz-${testInfo.project.name}-${theme}.png` });
    await page.goto("/WS2026/", { waitUntil: "domcontentloaded" });
    const homePolicy = await page.locator('meta[http-equiv="Content-Security-Policy"]').getAttribute("content");
    expect(homePolicy).not.toContain("'wasm-unsafe-eval'");
    expect(homePolicy).not.toContain("worker-src");
  });
}
