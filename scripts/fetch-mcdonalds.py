#!/usr/bin/env python3
"""Fetch all US McDonald's from OpenStreetMap and write public/data/mcdonalds-us.json."""

import json
import os
import urllib.parse
import urllib.request

QUERY = """
[out:json][timeout:180];
area["ISO3166-1"="US"]->.usa;
(
  node["brand"="McDonald's"]["amenity"="fast_food"](area.usa);
  way["brand"="McDonald's"]["amenity"="fast_food"](area.usa);
  node["brand"="McDonald's"]["amenity"="restaurant"](area.usa);
  way["brand"="McDonald's"]["amenity"="restaurant"](area.usa);
);
out center;
"""

OUT_PATH = os.path.join(
    os.path.dirname(__file__), "..", "data", "mcdonalds-us.json"
)


def main() -> None:
    data = urllib.parse.urlencode({"data": QUERY}).encode()
    req = urllib.request.Request(
        "https://overpass-api.de/api/interpreter",
        data=data,
        headers={"User-Agent": "McIceCheck/1.0 data-fetch"},
    )
    print("Fetching from Overpass API (may take 2–3 min)…")
    with urllib.request.urlopen(req, timeout=200) as resp:
        raw = json.load(resp)

    locations = []
    seen: set[str] = set()
    for el in raw.get("elements", []):
        lat = el.get("lat") or el.get("center", {}).get("lat")
        lng = el.get("lon") or el.get("center", {}).get("lon")
        if lat is None or lng is None:
            continue

        osm_id = f"osm-{el['type']}-{el['id']}"
        if osm_id in seen:
            continue
        seen.add(osm_id)

        tags = el.get("tags", {})
        parts = []
        if tags.get("addr:housenumber") and tags.get("addr:street"):
            parts.append(f"{tags['addr:housenumber']} {tags['addr:street']}")
        if tags.get("addr:city"):
            parts.append(tags["addr:city"])
        if tags.get("addr:state"):
            parts.append(tags["addr:state"])
        if tags.get("addr:postcode"):
            parts.append(tags["addr:postcode"])

        locations.append(
            {
                "id": osm_id,
                "name": tags.get("name", "McDonald's"),
                "address": ", ".join(parts) if parts else "Address unavailable",
                "lat": round(lat, 6),
                "lng": round(lng, 6),
            }
        )

    os.makedirs(os.path.dirname(OUT_PATH), exist_ok=True)
    payload = {
        "generated": __import__("datetime").date.today().isoformat(),
        "count": len(locations),
        "locations": locations,
    }
    with open(OUT_PATH, "w", encoding="utf-8") as f:
        json.dump(payload, f, separators=(",", ":"))

    size_mb = os.path.getsize(OUT_PATH) / 1024 / 1024
    print(f"Wrote {len(locations)} locations to {OUT_PATH} ({size_mb:.1f} MB)")


if __name__ == "__main__":
    main()