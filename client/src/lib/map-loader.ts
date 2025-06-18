import { Loader } from '@googlemaps/js-api-loader';

export async function initializeGoogleMaps() {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  
  if (!apiKey) {
    throw new Error('Google Maps API key not configured');
  }

  const loader = new Loader({
    apiKey,
    libraries: ['maps', 'marker']
  });

  try {
    await loader.importLibrary('maps');
    const { AdvancedMarkerElement } = await loader.importLibrary('marker');
    return { 
      google: window.google, 
      AdvancedMarkerElement,
      isLoaded: true
    };
  } catch (error) {
    console.error('Error loading Google Maps:', error);
    throw error;
  }
}