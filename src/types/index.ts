export type IceCreamStatus = "working" | "broken" | "unknown";

export interface McLocation {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  status: IceCreamStatus;
  /** ISO timestamp of last status update */
  lastUpdated: string;
  /** Number of community reports in the last 24h */
  reportCount: number;
}

export interface UserReport {
  locationId: string;
  status: IceCreamStatus;
  timestamp: string;
  /** Optional: geolocation of reporter for fraud detection */
  reporterLat?: number;
  reporterLng?: number;
}

export interface GeoPosition {
  lat: number;
  lng: number;
}