import { NextResponse } from "next/server";

/**
 * Geocode proxy for OpenStreetMap Nominatim.
 * Keeps API calls server-side and respects Nominatim usage policy.
 *
 * TODO: Cache results in Redis/Upstash to reduce upstream calls.
 * TODO: Swap for Google Geocoding API for production scale.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim();

  if (!q || q.length < 2) {
    return NextResponse.json([]);
  }

  const params = new URLSearchParams({
    q,
    format: "json",
    limit: "5",
    countrycodes: "us",
    addressdetails: "1",
  });

  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?${params}`,
      {
        headers: {
          "User-Agent": "McIceCheck/1.0 (ice cream machine status app)",
          Accept: "application/json",
        },
        next: { revalidate: 3600 },
      }
    );

    if (!res.ok) {
      return NextResponse.json({ error: "Geocode failed" }, { status: 502 });
    }

    const data = (await res.json()) as Array<{
      place_id: number;
      display_name: string;
      lat: string;
      lon: string;
    }>;

    const results = data.map((item) => ({
      id: String(item.place_id),
      label: item.display_name,
      lat: parseFloat(item.lat),
      lng: parseFloat(item.lon),
    }));

    return NextResponse.json(results);
  } catch {
    return NextResponse.json({ error: "Geocode unavailable" }, { status: 503 });
  }
}