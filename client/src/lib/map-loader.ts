import { Loader } from '@googlemaps/js-api-loader';

export async function initializeGoogleMaps() {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  const mapId = import.meta.env.VITE_GOOGLE_MAPS_MAP_ID;
  
  if (!apiKey) {
    throw new Error('Google Maps API key not configured');
  }

  const loaderConfig: any = {
    apiKey,
    libraries: ['maps', 'marker']
  };

  // Only add mapIds if MAP_ID is configured
  if (mapId) {
    loaderConfig.mapIds = [mapId];
  }

  const loader = new Loader(loaderConfig);

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