// Great-circle distance in km, rounded to 0.1.
export const distanceKm = (aLat: number, aLng: number, bLat: number, bLng: number) => {
  const r = 6371;
  const dLat = ((bLat - aLat) * Math.PI) / 180;
  const dLng = ((bLng - aLng) * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((aLat * Math.PI) / 180) * Math.cos((bLat * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return Math.round(2 * r * Math.asin(Math.sqrt(h)) * 10) / 10;
};

/** East / north offset of `b` from `a` in km (flat approximation, fine within a city). */
export const offsetKm = (aLat: number, aLng: number, bLat: number, bLng: number) => ({
  east: (bLng - aLng) * 111.32 * Math.cos((aLat * Math.PI) / 180),
  north: (bLat - aLat) * 110.574,
});
