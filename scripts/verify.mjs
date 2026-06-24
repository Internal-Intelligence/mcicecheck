#!/usr/bin/env node
/** Quick smoke tests for location store logic and API shapes */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataPath = path.join(__dirname, "..", "data", "mcdonalds-us.json");
const API_BASE = process.env.API_BASE ?? "http://localhost:3000";

let passed = 0;
let failed = 0;

function ok(label) {
  passed++;
  console.log(`  ✓ ${label}`);
}

function fail(label, err) {
  failed++;
  console.error(`  ✗ ${label}: ${err}`);
}

// 1. Dataset exists
if (!fs.existsSync(dataPath)) {
  fail("data file exists", `missing ${dataPath}`);
} else {
  const raw = JSON.parse(fs.readFileSync(dataPath, "utf-8"));
  if (!Array.isArray(raw.locations) || raw.locations.length < 1000) {
    fail("data file valid", `expected 1000+ locations, got ${raw.locations?.length}`);
  } else {
    ok(`dataset has ${raw.locations.length} locations`);
  }
}

// 2. Bbox filter logic (mirror locationStore)
function inBBox(loc, { north, south, east, west }) {
  if (loc.lat > north || loc.lat < south) return false;
  if (west <= east) return loc.lng >= west && loc.lng <= east;
  return loc.lng >= west || loc.lng <= east;
}

if (fs.existsSync(dataPath)) {
  const { locations } = JSON.parse(fs.readFileSync(dataPath, "utf-8"));
  const atlanta = { north: 34, south: 33.5, east: -84.2, west: -84.6 };
  const inArea = locations.filter((l) => inBBox(l, atlanta));
  if (inArea.length < 5) {
    fail("atlanta bbox", `only ${inArea.length} results`);
  } else {
    ok(`atlanta bbox returns ${inArea.length} locations`);
  }
}

// 3. API smoke (if server running)
async function testApi(path, label, assert) {
  try {
    const res = await fetch(`${API_BASE}${path}`);
    if (!res.ok) throw new Error(`status ${res.status}`);
    const body = await res.json();
    assert(body);
    ok(label);
  } catch (e) {
    fail(label, e.message);
  }
}

await testApi(
  "/api/locations?north=34&south=33&east=-84&west=-85",
  "API bbox returns locations",
  (body) => {
    if (!Array.isArray(body.locations)) throw new Error("missing locations array");
    if (typeof body.total !== "number") throw new Error("missing total");
    if (body.count < 1) throw new Error(`expected locations, got count=${body.count}`);
  }
);

await testApi(
  "/api/locations?lat=33.749&lng=-84.388&limit=3&status=working,unknown",
  "API nearest returns 3 working/unknown locations",
  (body) => {
    if (!Array.isArray(body.locations)) throw new Error("missing locations array");
    if (body.count !== 3) throw new Error(`expected 3, got ${body.count}`);
    for (const loc of body.locations) {
      if (loc.status === "broken") throw new Error("broken should be excluded");
    }
  }
);

await testApi(
  "/api/locations?q=atlanta&limit=5",
  "API text search returns matches",
  (body) => {
    if (!Array.isArray(body.locations)) throw new Error("missing locations array");
    if (body.count < 1) throw new Error(`expected matches, got count=${body.count}`);
  }
);

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);