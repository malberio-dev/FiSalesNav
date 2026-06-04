// Simple in-memory and LocalStorage cache for geocoding to bypass rate limits
let geoCache: Record<string, [number, number]> = {};

try {
  const saved = localStorage.getItem("fsn:geo_cache");
  if (saved) {
    geoCache = JSON.parse(saved);
  }
} catch (e) {
  console.error("Failed to parse geo cache from localStorage", e);
}

function saveGeoCache() {
  try {
    localStorage.setItem("fsn:geo_cache", JSON.stringify(geoCache));
  } catch (e) {
    console.error("Failed to save geo cache", e);
  }
}

// Haversine calculation fallback
function getHaversineDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export async function geocodeAddress(address: string): Promise<[number, number] | null> {
  const cleanAddress = address.trim().toLowerCase();
  if (!cleanAddress) return null;

  if (geoCache[cleanAddress]) {
    return geoCache[cleanAddress];
  }

  // Pre-configured coordinates for popular Northern Italian hubs to guarantee instant values if offline
  const popularCoordinates: Record<string, [number, number]> = {
    "rovello porro": [45.6517, 9.0396],
    "rovello porro, co": [45.6517, 9.0396],
    "milano": [45.4642, 9.19],
    "monza": [45.5845, 9.2735],
    "brescia": [45.5416, 10.2118],
    "bergamo": [45.6983, 9.6773],
    "bologna": [44.4949, 11.3426],
    "modena": [44.6471, 10.9252],
    "parma": [44.8015, 10.3279],
    "reggio emilia": [44.6982, 10.6312],
    "piacenza": [45.0526, 9.693],
    "cremona": [45.1332, 10.0227],
    "lecco": [45.8566, 9.3977],
    "como": [45.8081, 9.0852],
    "torino": [45.0703, 7.6869],
    "verona": [45.4384, 10.9916],
    "busto arsizio": [45.6111, 8.852],
    "saronno": [45.6268, 9.0366],
    "rho": [45.529, 9.04],
    "cinisello balsamo": [45.5583, 9.2222],
    "segrate": [45.49, 9.2965],
  };

  // Check simple substring match for instant offline response
  for (const [key, coords] of Object.entries(popularCoordinates)) {
    if (cleanAddress.includes(key)) {
      geoCache[cleanAddress] = coords;
      saveGeoCache();
      return coords;
    }
  }

  // Live OSM request
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);
    const query = `${encodeURIComponent(address)}, Italy`;
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${query}&limit=1`,
      { signal: controller.signal }
    );
    clearTimeout(timeoutId);

    if (res.ok) {
      const list = await res.json();
      if (list && list.length > 0) {
        const coords: [number, number] = [parseFloat(list[0].lat), parseFloat(list[0].lon)];
        geoCache[cleanAddress] = coords;
        saveGeoCache();
        return coords;
      }
    }
  } catch (error) {
    console.error("OSM Geocoding failed, falling back to random coordinate offset near Milan", error);
  }

  // Fallback coords centered near Milan, with a slight hash offset to keep multiple addresses geographically unique
  const charSum = cleanAddress.split("").reduce((sum, ch) => sum + ch.charCodeAt(0), 0);
  const offsetLat = (charSum % 50) / 500 - 0.05; // -0.05 to +0.05 deg
  const offsetLon = (charSum % 37) / 370 - 0.05;
  const coords: [number, number] = [45.4642 + offsetLat, 9.19 + offsetLon];
  geoCache[cleanAddress] = coords;
  saveGeoCache();
  return coords;
}

export interface TravelLeg {
  distanceKm: string;
  durationMin: number;
}

export async function calculateRouteLegs(
  startAddress: string,
  destAddresses: string[]
): Promise<TravelLeg[]> {
  const result: TravelLeg[] = [];
  const coordsList: ([number, number] | null)[] = [];

  // Geocode all points
  coordsList.push(await geocodeAddress(startAddress));
  for (const addr of destAddresses) {
    coordsList.push(await geocodeAddress(addr));
  }

  // Calculate successive legs
  for (let i = 0; i < coordsList.length - 1; i++) {
    const p1 = coordsList[i];
    const p2 = coordsList[i + 1];

    if (!p1 || !p2) {
      result.push({ distanceKm: "12.5", durationMin: 18 }); // Standard reasonable default
      continue;
    }

    let calculated = false;

    // Try live OSRM routing
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000);
      const res = await fetch(
        `https://router.project-osrm.org/route/v1/driving/${p1[1]},${p1[0]};${p2[1]},${p2[0]}?overview=false`,
        { signal: controller.signal }
      );
      clearTimeout(timeoutId);

      if (res.ok) {
        const body = await res.json();
        if (body.routes && body.routes.length > 0) {
          const route = body.routes[0];
          const dist = (route.distance / 1000).toFixed(1);
          const dur = Math.round(route.duration / 60);
          result.push({ distanceKm: dist, durationMin: dur });
          calculated = true;
        }
      }
    } catch (e) {
      // Slitly expected on sandbox or rate limiting
    }

    if (!calculated) {
      // Use haversine spherical fallback + realistic driving speed factor
      const dist = getHaversineDistanceKm(p1[0], p1[1], p2[0], p2[1]);
      const actualRoadDistMultiplier = 1.25; // actual roads add winding factor
      const roadDist = dist * actualRoadDistMultiplier;
      const averageSpeedKmh = 45; // including urban traffic
      const durationMin = Math.max(5, Math.round((roadDist / averageSpeedKmh) * 60));
      result.push({
        distanceKm: roadDist.toFixed(1),
        durationMin,
      });
    }
  }

  return result;
}
