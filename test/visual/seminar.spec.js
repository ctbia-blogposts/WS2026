const { test, expect } = require("@playwright/test");

for (const theme of ["light", "dark"]) {
  test(`two-article publication and Distill layout (${theme})`, async ({ page }, testInfo) => {
    await page.route("**/livereload.js*", (route) => route.abort());
    await page.addInitScript((theme) => localStorage.setItem("theme", theme), theme);
    await page.goto("/WS2026/", { waitUntil: "networkidle" });
    await expect(page.locator(".seminar-entry")).toHaveCount(2);
    await expect(page.locator(".seminar-entry h2")).toHaveText(["a distill-style blog post", "Denoising Diffusion Probabilistic Models"]);
    await expect(page.getByRole("link", { name: "a distill-style blog post", exact: true })).toHaveAttribute("href", "/WS2026/articles/distill/");
    await expect(page.getByRole("link", { name: "Denoising Diffusion Probabilistic Models", exact: true })).toHaveAttribute(
      "href",
      "/WS2026/articles/ddpm/"
    );
    await expect(page.locator("html")).toHaveAttribute("data-theme", theme);
    const headerAlignment = await page.evaluate(() => {
      const link = document.querySelector(".seminar-header nav a").getBoundingClientRect();
      const toggle = document.getElementById("light-toggle").getBoundingClientRect();
      return Math.abs(link.y + link.height / 2 - toggle.y - toggle.height / 2);
    });
    expect(headerAlignment).toBeLessThanOrEqual(1);
    await expect(page.locator("h1")).toContainText("Biomedical Image Analysis");
    await expect(page.getByRole("navigation", { name: "Main navigation" }).getByRole("link")).toHaveCount(3);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    if (testInfo.project.name === "desktop") {
      const indexWidth = await page.locator(".seminar-introduction").evaluate((element) => element.clientWidth);
      expect(indexWidth).toBeGreaterThanOrEqual(880);
      expect(indexWidth).toBeLessThanOrEqual(920);
    }
    expect((await page.locator(".seminar-entry").first().boundingBox()).y).toBeLessThan(400);
    await expect(page.locator(".seminar-opening, .seminar-grid, .seminar-card, [class*=accent-]")).toHaveCount(0);
    await page.screenshot({ path: `output/playwright/home-${testInfo.project.name}-${theme}.png`, fullPage: true });

    await page.getByRole("link", { name: "Denoising Diffusion Probabilistic Models", exact: true }).click();
    await expect(page.locator("d-title h1")).toHaveText("Denoising Diffusion Probabilistic Models");
    await expect(page.locator(".seminar-byline")).toContainText("Supervisor: Supervisor Name");
    await expect(page.locator(".seminar-glance dt")).toHaveText(["Problem", "Key idea", "Why it matters"]);
    await expect(page.getByRole("link", { name: /Next article/ })).toHaveCount(0);
    await expect(page.getByRole("link", { name: /Previous article/ })).toHaveAttribute("href", "/WS2026/articles/distill/");
    const figureStyle = await page
      .locator(".seminar-figure")
      .first()
      .evaluate((element) => ({
        top: parseFloat(getComputedStyle(element).marginTop),
        bottom: parseFloat(getComputedStyle(element).marginBottom),
        captionFont: getComputedStyle(element.querySelector("figcaption")).fontSize,
        shadow: getComputedStyle(element).boxShadow,
        radius: getComputedStyle(element).borderRadius,
      }));
    expect(figureStyle.top).toBeGreaterThanOrEqual(32);
    expect(figureStyle.bottom).toBeGreaterThanOrEqual(36);
    expect(figureStyle.captionFont).toBe("14px");
    expect(figureStyle.shadow).toBe("none");
    expect(figureStyle.radius).toBe("0px");
    await expect(page.locator(".seminar-figure-label")).toHaveCount(0);
    if (testInfo.project.name === "desktop") {
      const alignment = await page.evaluate(() => {
        const title = document.querySelector("d-title h1");
        const prose = document.querySelector("d-article > p");
        const toc = document.querySelector("d-contents");
        const articleStyle = getComputedStyle(document.querySelector("d-article"));
        return {
          titleWidth: title.clientWidth,
          bodyWidth: prose.clientWidth,
          figureWidth: document.querySelector(".seminar-figure").clientWidth,
          titleLeft: title.getBoundingClientRect().left,
          proseLeft: prose.getBoundingClientRect().left,
          tocRight: toc.getBoundingClientRect().right,
          fontSize: parseFloat(articleStyle.fontSize),
          lineHeight: parseFloat(articleStyle.lineHeight),
        };
      });
      expect(alignment.titleWidth).toBe(704);
      expect(alignment.bodyWidth).toBe(alignment.titleWidth);
      expect(alignment.figureWidth).toBeGreaterThan(alignment.bodyWidth);
      expect(alignment.proseLeft).toBe(alignment.titleLeft);
      expect(alignment.tocRight).toBeLessThan(alignment.proseLeft);
      expect(alignment.proseLeft - alignment.tocRight).toBeLessThanOrEqual(32);
      expect(alignment.fontSize).toBe(17);
      expect(alignment.lineHeight / alignment.fontSize).toBeCloseTo(1.65, 2);
    } else if (testInfo.project.name === "mobile") {
      await expect(page.locator("d-contents")).toBeHidden();
    }
    const brokenInternalPaths = await page.evaluate(() =>
      [...document.querySelectorAll("[href], [src]")]
        .flatMap((el) => [el.getAttribute("href"), el.getAttribute("src")])
        .filter((url) => url?.startsWith("/") && !url.startsWith("/WS2026/"))
    );
    expect(brokenInternalPaths).toEqual([]);

    await page.getByRole("link", { name: /Previous article/ }).click();
    await expect(page.locator("d-title h1")).toHaveText("a distill-style blog post");
    await expect(page.getByRole("link", { name: /Next article/ })).toHaveAttribute("href", "/WS2026/articles/ddpm/");
    await expect(page.getByRole("link", { name: /Previous article/ })).toHaveCount(0);
    await expect(page.locator("d-cite").first()).toContainText("1", { timeout: 30000 });
    await expect(page.locator("d-citation-list")).toContainText("DRAW", { timeout: 30000 });
    await expect(page.locator("mjx-container").first()).toBeVisible({ timeout: 30000 });
    await expect(page.locator(".mermaid svg").first()).toBeVisible({ timeout: 30000 });
    if (testInfo.project.name === "desktop") {
      const nativeWidths = await page.evaluate(() => ({
        body: document.querySelector(".fake-img.l-body").getBoundingClientRect().width,
        page: document.querySelector(".fake-img.l-page").getBoundingClientRect().width,
      }));
      expect(nativeWidths.body).toBe(704);
      expect(nativeWidths.page).toBeGreaterThan(nativeWidths.body);
      await page.screenshot({ path: `output/playwright/distill-desktop-${theme}.png` });
    }
  });
}
