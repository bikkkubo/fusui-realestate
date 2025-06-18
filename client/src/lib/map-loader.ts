import { Loader } from '@googlemaps/js-api-loader';

const loader = new Loader({
  apiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
  libraries: ['maps', 'marker']
});

export async function initializeGoogleMaps() {
  try {
    await loader.importLibrary('maps');
    const { AdvancedMarkerElement } = await loader.importLibrary('marker');
    return { google: window.google, AdvancedMarkerElement };
  } catch (error) {
    console.error('Error loading Google Maps:', error);
    throw error;
  }
}