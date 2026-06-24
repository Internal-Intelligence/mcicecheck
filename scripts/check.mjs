#!/usr/bin/env node
/**
 * Full project check: lint → build → production server → API smoke tests.
 * Exits non-zero on any failure.
 */

import { spawn, execSync } from "child_process";
import { fileURLToPath } from "url";
import path from "path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const CHECK_PORT = 3456;
const API_BASE = `http://127.0.0.1:${CHECK_PORT}`;

function run(cmd, args, opts = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args, {
      cwd: root,
      stdio: "inherit",
      env: { ...process.env, PATH: `${process.env.HOME}/.local/node/bin:${process.env.PATH}` },
      ...opts,
    });
    child.on("close", (code) => (code === 0 ? resolve() : reject(new Error(`${cmd} exited ${code}`))));
  });
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function waitForServer(maxMs = 15000) {
  const start = Date.now();
  while (Date.now() - start < maxMs) {
    try {
      const res = await fetch(`${API_BASE}/api/locations?north=34&south=33&east=-84&west=-85`);
      if (res.ok) return;
    } catch {
      /* retry */
    }
    await sleep(500);
  }
  throw new Error(`Server did not become ready on ${API_BASE}`);
}

let serverProc = null;

function stopDevServers() {
  // `next build` overwrites `.next` while `next dev` is running and corrupts the dev cache.
  try {
    execSync('pkill -f "next dev" 2>/dev/null || true', {
      cwd: root,
      stdio: "ignore",
      shell: true,
    });
    execSync('pkill -f "next start" 2>/dev/null || true', {
      cwd: root,
      stdio: "ignore",
      shell: true,
    });
  } catch {
    /* best effort */
  }
}

async function main() {
  console.log("→ lint");
  execSync("npm run lint", { cwd: root, stdio: "inherit", env: process.env });

  stopDevServers();
  console.log("→ build");
  execSync("npm run build", { cwd: root, stdio: "inherit", env: process.env });

  console.log(`→ start production server on :${CHECK_PORT}`);
  serverProc = spawn("npx", ["next", "start", "-p", String(CHECK_PORT)], {
    cwd: root,
    stdio: "ignore",
    env: { ...process.env, PATH: `${process.env.HOME}/.local/node/bin:${process.env.PATH}` },
  });

  await waitForServer();

  console.log("→ verify (dataset + API)");
  execSync(`API_BASE=${API_BASE} node scripts/verify.mjs`, {
    cwd: root,
    stdio: "inherit",
    env: { ...process.env, API_BASE },
  });

  console.log("\n✓ All checks passed");
  console.log("  Restart dev with: npm run dev:clean");
}

main()
  .catch((err) => {
    console.error("\n✗ Check failed:", err.message);
    process.exit(1);
  })
  .finally(() => {
    if (serverProc) serverProc.kill("SIGTERM");
  });