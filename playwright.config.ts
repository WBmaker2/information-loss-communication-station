import { defineConfig } from "playwright/test";

export default defineConfig({
  testDir: "./e2e",
  timeout: 30_000,
  use: { baseURL: "http://127.0.0.1:43817", headless: true },
  projects: [{ name: "chromium", use: { browserName: "chromium" } }],
  webServer: {
    command: "npm run build && npm run start -- -p 43817",
    url: "http://127.0.0.1:43817",
    reuseExistingServer: false,
    timeout: 60_000,
  },
});
