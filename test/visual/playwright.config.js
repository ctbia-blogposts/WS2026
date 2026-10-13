const path = require("path");
const { devices } = require("@playwright/test");

const repoRoot = path.resolve(__dirname, "../..");

const webServer = process.env.NO_WEBSERVER
  ? undefined
  : {
      command: "bundle exec jekyll serve --host 127.0.0.1 --port 4000 --baseurl /WS2026 --quiet",
      cwd: repoRoot,
      url: "http://127.0.0.1:4000/WS2026/",
      reuseExistingServer: !process.env.CI,
      timeout: 300000,
    };

module.exports = {
  testDir: __dirname,
  testMatch: ["seminar.spec.js", "tikz.spec.js"],
  timeout: 120000,
  expect: {
    timeout: 10000,
    toHaveScreenshot: {
      animations: "disabled",
      fullPage: true,
      maxDiffPixelRatio: 0.02,
    },
  },
  use: {
    baseURL: process.env.SEMINAR_PREVIEW_URL || "http://127.0.0.1:4000/WS2026",
    screenshot: "only-on-failure",
    trace: "retain-on-failure",
  },
  webServer,
  projects: [
    {
      name: "desktop",
      use: {
        viewport: { width: 1366, height: 1800 },
      },
    },
    {
      name: "tablet",
      use: { viewport: { width: 820, height: 1180 } },
    },
    {
      name: "mobile",
      use: {
        ...devices["iPhone 12"],
      },
    },
  ],
};
