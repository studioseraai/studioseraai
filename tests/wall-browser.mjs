// Isolated browser acceptance: built app + intercepted fixture API; no production writes.
import { spawn } from "node:child_process";
import { randomBytes } from "node:crypto";
import assert from "node:assert/strict";
import { pathToFileURL } from "node:url";
const { chromium } = await import(
  pathToFileURL(process.env.SERAAI_QA_PLAYWRIGHT).href
);
const password = randomBytes(20).toString("hex"),
  base = "http://127.0.0.1:43129";
const server = spawn(
  process.execPath,
  [
    "node_modules/next/dist/bin/next",
    "start",
    "--hostname",
    "127.0.0.1",
    "--port",
    "43129",
  ],
  {
    env: {
      ...process.env,
      VERCEL: "1",
      SERAAI_PASSWORD: password,
      SERAAI_BACKEND_URL: "",
      SERAAI_BACKEND_TOKEN: "",
    },
    stdio: "ignore",
  },
);
let browser;
try {
  for (let i = 0; i < 60; i++) {
    try {
      if ((await fetch(base)).status === 401) break;
    } catch {}
    await new Promise((r) => setTimeout(r, 150));
  }
  browser = await chromium.launch({
    headless: true,
    executablePath: process.env.SERAAI_QA_CHROMIUM || undefined,
    args: ["--no-sandbox"],
  });
  const context = await browser.newContext({
    httpCredentials: { username: "owner", password },
    viewport: { width: 1440, height: 1000 },
    acceptDownloads: true,
  });
  const page = await context.newPage(),
    errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  const records = [
    {
      id: 1,
      title: "QA Square",
      width: 121.92,
      height: 121.92,
      framedWidth: 140,
      framedHeight: 140,
    },
    { id: 2, title: "QA Small", width: 40, height: 60 },
    { id: 3, title: "QA Companion", width: 40, height: 60 },
    { id: 4, title: "QA Oversize", width: 400, height: 400 },
    { id: 5, title: "QA Missing" },
  ].map((a) => ({
    ...a,
    kind: "artwork",
    artist: "QA artist",
    status: "Available",
    location: "QA",
    measurementVerified: true,
    price: 100,
    created: "2026-10-26",
    effective: "",
  }));
  let saved;
  await page.route("**/api/data*", async (route) => {
    const request = route.request(),
      url = new URL(request.url());
    if (request.method() === "POST") {
      saved = request.postDataJSON().data;
      return route.fulfill({
        json: { ok: true, id: "00000000-0000-4000-8000-000000000001" },
      });
    }
    if (url.searchParams.has("layouts"))
      return route.fulfill({
        json: {
          layouts: saved
            ? [
                {
                  id: "00000000-0000-4000-8000-000000000001",
                  title: saved.name,
                },
              ]
            : [],
        },
      });
    if (url.searchParams.has("layoutId"))
      return route.fulfill({ json: { layout: saved } });
    return route.fulfill({ json: { records, photos: [] } });
  });
  await page.goto(base + "/visualizer");
  await page.getByRole("button", { name: /SS-0001 · QA Square/ }).click();
  const shape = () => page.locator('[data-artid="1"] > rect').first();
  assert.equal(await shape().getAttribute("width"), "1219.2");
  assert.equal(
    await page.locator('[data-artid="1"]').getAttribute("transform"),
    "translate(1219.2 1219.2) rotate(0)",
  );
  await page.getByLabel("Display units").selectOption("in");
  await page.getByLabel(/View zoom/).fill("1.5");
  assert.equal(await shape().getAttribute("width"), "1219.2");
  await page.getByLabel(/Centre X from left/).fill("40");
  assert.match(
    await page.locator('[data-artid="1"]').getAttribute("transform"),
    /translate\(1016 /,
  );
  await page.getByRole("button", { name: "Undo", exact: true }).click();
  await page.getByRole("button", { name: "Use framed footprint" }).click();
  assert.equal(await shape().getAttribute("width"), "1400");
  await page.getByRole("button", { name: "Use canvas footprint" }).click();
  await page
    .getByRole("button", { name: "Lock position", exact: true })
    .click();
  await page.getByLabel(/Centre X from left/).fill("20");
  assert.equal(
    await page.locator('[data-artid="1"]').getAttribute("transform"),
    "translate(1219.2 1219.2) rotate(0)",
  );
  await page
    .getByRole("button", { name: "Unlock position", exact: true })
    .click();
  const target = await shape().boundingBox();
  await page.mouse.move(
    target.x + target.width / 2,
    target.y + target.height / 2,
  );
  await page.mouse.down();
  await page.mouse.move(
    target.x + target.width / 2 + 40,
    target.y + target.height / 2,
    { steps: 5 },
  );
  await page.mouse.up();
  assert.notEqual(
    await page.locator('[data-artid="1"]').getAttribute("transform"),
    "translate(1219.2 1219.2) rotate(0)",
  );
  assert.equal(await shape().getAttribute("width"), "1219.2");
  await page.getByRole("button", { name: "Undo", exact: true }).click();
  await page.getByRole("button", { name: "Save layout", exact: true }).click();
  await page.getByText("Layout saved to your workspace.").waitFor();
  assert.equal(saved.layers[0].width, 1219.2);
  let download = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export measured PNG" }).click();
  assert.equal((await download).suggestedFilename(), "SERAAI-wall-plan.png");
  download = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export proposal PDF" }).click();
  assert.equal(
    (await download).suggestedFilename(),
    "SERAAI-artwork-proposal.pdf",
  );
  await page.getByRole("button", { name: /SS-0004 · QA Oversize/ }).click();
  assert.equal(
    await page
      .getByRole("button", { name: "Export proposal PDF" })
      .isDisabled(),
    true,
  );
  await page
    .getByRole("button", { name: "Remove from wall", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Find Art That Fits My Wall", exact: true })
    .click();
  await page.getByRole("button", { name: "pair", exact: true }).click();
  await page
    .getByRole("button", { name: "Preview on measured wall" })
    .first()
    .click();
  assert.equal(await page.locator("[data-artid]").count(), 2);
  await page
    .getByRole("button", { name: "Calibrated room", exact: true })
    .click();
  await page
    .getByLabel("Room photograph", { exact: true })
    .selectOption("/rooms/living.webp");
  const c = page.locator(".measure-room canvas");
  await c.scrollIntoViewIfNeeded();
  for (const [x, y] of [
    [0.1, 0.1],
    [0.9, 0.1],
    [0.9, 0.6],
    [0.1, 0.6],
  ]) {
    const b = await c.boundingBox();
    await c.click({ position: { x: b.width * x, y: b.height * y } });
  }
  await page
    .getByRole("button", { name: "Measured wall", exact: true })
    .click();
  await page.screenshot({
    path: "/tmp/seraai-measurement-desktop.png",
    fullPage: true,
  });
  await page.setViewportSize({ width: 390, height: 844 });
  assert.ok(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth + 1,
    ),
    "mobile page overflow",
  );
  await page.screenshot({
    path: "/tmp/seraai-measurement-mobile.png",
    fullPage: true,
  });
  await page
    .getByRole("button", { name: "Free room styling", exact: true })
    .click();
  await page
    .getByText("Free styling is an approximate visual preview.", {
      exact: false,
    })
    .waitFor();
  assert.deepEqual(errors, []);
  console.log(
    "PASS browser: scale, units, zoom, drag, locks, undo, frame dimensions, save, PNG/PDF, oversize blocking, pair suggestions, calibrated room, mobile, legacy mode",
  );
} finally {
  await browser?.close();
  server.kill("SIGTERM");
}
