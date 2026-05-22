/**
 * Parse PostGIS EWKB hex string to [lat, lng] (Leaflet-friendly).
 * Supports POINT geometry in SRID 4326 (WGS84).
 */
export function parseWKBPoint(wkbHex: string): [number, number] | null {
  if (!wkbHex) return null;
  const hex = wkbHex.startsWith("0x") ? wkbHex.slice(2) : wkbHex;
  if (hex.length < 50) return null;

  const byteOrder = parseInt(hex.slice(0, 2), 16);
  // 01 01 00 00 20 = little-endian Point with SRID
  // Skip bytes 2-9 (geometry type + SRID)
  const xBytes = hex.slice(18, 34);
  const yBytes = hex.slice(34, 50);

  const xBuf = new ArrayBuffer(8);
  const xView = new DataView(xBuf);
  const yBuf = new ArrayBuffer(8);
  const yView = new DataView(yBuf);

  for (let i = 0; i < 8; i++) {
    xView.setUint8(
      byteOrder === 1 ? i : 7 - i,
      parseInt(xBytes.slice(i * 2, i * 2 + 2), 16),
    );
    yView.setUint8(
      byteOrder === 1 ? i : 7 - i,
      parseInt(yBytes.slice(i * 2, i * 2 + 2), 16),
    );
  }

  return [yView.getFloat64(0, byteOrder === 1), xView.getFloat64(0, byteOrder === 1)]; // [lat, lng]
}
