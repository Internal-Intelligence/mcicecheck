import type { McLocation } from "@/types";

export interface PlaceResult {
  id: string;
  label: string;
  lat: number;
  lng: number;
}

export function filterRestaurants(
  locations: McLocation[],
  query: string
): McLocation[] {
  const q = query.trim().toLowerCase();
  if (!q) return locations;

  return locations.filter(
    (loc) =>
      loc.name.toLowerCase().includes(q) ||
      loc.address.toLowerCase().includes(q)
  );
}

