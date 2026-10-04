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
    const s = document.createElement('script');
    s.src =
      `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(KEY)}` +
      '&loading=async&language=he&region=IL&v=weekly';
    s.async = true;
    s.onload = () => resolve();
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
