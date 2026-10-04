// Loads the Google Maps JS API once and exposes the Places (New) library.
// Key comes from VITE_GOOGLE_MAPS_API_KEY — restrict it by HTTP referrer in the
// Google Cloud console. Without a key the checkout form still works (manual entry).

const KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

let placesPromise = null;

export function hasPlacesKey() {
  return Boolean(KEY);
}

export function loadPlaces() {
  if (!KEY) return Promise.reject(new Error('Missing VITE_GOOGLE_MAPS_API_KEY'));
  if (placesPromise) return placesPromise;

  placesPromise = new Promise((resolve, reject) => {
    if (window.google?.maps?.importLibrary) {
      resolve();
      return;
    }
    // The script's onload fires before google.maps.importLibrary exists; Google
    // invokes the callback only once the API is actually ready.
    window.__ccMapsReady = () => resolve();
    const s = document.createElement('script');
    s.src =
      `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(KEY)}` +
      '&loading=async&language=he&region=IL&v=weekly&callback=__ccMapsReady';
    s.async = true;
    s.onerror = () => reject(new Error('Failed to load Google Maps'));
    document.head.appendChild(s);
  })
    .then(() => window.google.maps.importLibrary('places'))
    .catch((e) => {
      placesPromise = null; // allow a retry on next mount
      throw e;
    });

  return placesPromise;
}

// Splits a Place's addressComponents into the fields the checkout form uses.
export function parseAddress(place) {
  const get = (type) =>
    place.addressComponents?.find((c) => c.types.includes(type))?.longText || '';
  const route = get('route');
  const number = get('street_number');
  return {
    street: [route, number].filter(Boolean).join(' '),
    city: get('locality') || get('postal_town') || get('administrative_area_level_2'),
    zip: get('postal_code'),
  };
}

// Places (New) often omits postal_code for Israeli addresses even though the
// legacy Places / Geocoding services return it. Try those as fallbacks; each
// step fails quietly (e.g. if that API isn't enabled on the key).
const withTimeout = (p, ms = 4000) =>
  Promise.race([p, new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), ms))]);

const zipFrom = (components) =>
  components?.find((c) => c.types.includes('postal_code'))?.long_name || '';

export async function findZip(placeId) {
  const g = window.google?.maps;
  if (!g || !placeId) return '';

  // 1) Legacy PlacesService.getDetails (what the classic widget's place_changed uses).
  try {
    const { PlacesService } = await g.importLibrary('places');
    const svc = new PlacesService(document.createElement('div'));
    const zip = await withTimeout(
      new Promise((resolve, reject) =>
        svc.getDetails({ placeId, fields: ['address_components'], language: 'he' }, (res, status) =>
          status === 'OK' ? resolve(zipFrom(res?.address_components)) : reject(new Error(status)),
        ),
      ),
    );
    if (zip) return zip;
  } catch {
    /* fall through */
  }

  // 2) Geocoder by place id.
  try {
    const { Geocoder } = await g.importLibrary('geocoding');
    const { results } = await withTimeout(new Geocoder().geocode({ placeId, language: 'he' }));
    for (const r of results || []) {
      const zip = zipFrom(r.address_components);
      if (zip) return zip;
    }
  } catch {
    /* no zip available */
  }
  return '';
}
