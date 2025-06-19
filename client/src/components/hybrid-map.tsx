import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Plus, Minus, Layers, Crosshair, Maximize, Map } from "lucide-react";
import DirectionLines from "./direction-lines";
import KyuseiSectors from "./kyusei-sectors";
import FortuneOverlay, { FortuneOverlaySpinner } from "./fortune-overlay";
import { initializeGoogleMaps } from "@/lib/map-loader";
import { MapContainer as LeafletMapContainer, TileLayer, useMap, useMapEvents, LayersControl } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix for default markers
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

interface HybridMapProps {
  currentPosition: { lat: number; lng: number };
  setCurrentPosition: (position: { lat: number; lng: number }) => void;
  showPrimaryDirections: boolean;
  showSecondaryDirections: boolean;
  displayRadius: number;
  markers: any[];
  zoom: number;
  isLoading: boolean;
  kyuseiSectors: Array<{start: number, end: number}>;
  showKyuseiMode: boolean;
  isMobile?: boolean;
  kyuseiFormOffset?: number;
}

declare global {
  interface Window {
    google: any;
    initMap?: () => void;
  }
}

function MapController({ currentPosition, setCurrentPosition }: { currentPosition: { lat: number; lng: number }; setCurrentPosition: (position: { lat: number; lng: number }) => void }) {
  const map = useMap();
  
  useEffect(() => {
    map.setView([currentPosition.lat, currentPosition.lng], map.getZoom());
  }, [currentPosition, map]);

  useMapEvents({
    click: (e) => {
      setCurrentPosition({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });

  return null;
}

function StatusBar({ 
  currentPosition, 
  zoom, 
  isMobile = false,
  mapType = "leaflet"
}: { 
  currentPosition: { lat: number; lng: number }; 
  zoom: number; 
  isMobile?: boolean;
  mapType?: string;
}) {
  const [mousePosition, setMousePosition] = useState<{ lat: number; lng: number } | null>(null);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setLastUpdated(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className={`absolute bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-t border-gray-200 px-4 py-2 z-10 ${isMobile ? 'status-bar' : ''}`}>
      <div className={`flex items-center ${isMobile ? 'flex-col space-y-1' : 'justify-between'} text-sm`}>
        <div className={`flex items-center ${isMobile ? 'space-x-2' : 'space-x-4'}`}>
          <span className="text-gray-600">ズーム:</span>
          <span className="font-mono text-primary">{zoom}</span>
          
          {!isMobile && <span className="text-gray-600">|</span>}
          
          <span className="text-gray-600">中心位置:</span>
          <span className="font-mono text-secondary">
            {`${currentPosition.lat.toFixed(4)}, ${currentPosition.lng.toFixed(4)}`}
          </span>
          
          {!isMobile && (
            <>
              <span className="text-gray-600">|</span>
              <span className="text-xs text-gray-500">地図: {mapType === 'google' ? 'Google Maps' : 'OpenStreetMap'}</span>
            </>
          )}
        </div>
        
        {!isMobile && (
          <div className="flex items-center space-x-2">
            <div className="flex items-center">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
              <span className="text-xs text-gray-600">接続中</span>
            </div>
            <span className="text-gray-400">|</span>
            <span className="text-xs text-gray-600">
              最終更新: {lastUpdated.toTimeString().slice(0, 8)}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

function MapControls({ 
  map, 
  isMobile = false,
  mapType = "leaflet",
  onToggleMapType,
  showFortuneOverlay,
  onToggleFortuneOverlay,
  overlayLoading
}: { 
  map?: any; 
  isMobile?: boolean;
  mapType?: string;
  onToggleMapType?: () => void;
  showFortuneOverlay?: boolean;
  onToggleFortuneOverlay?: () => void;
  overlayLoading?: boolean;
}) {
  const handleZoomIn = () => {
    if (mapType === 'google' && map && window.google) {
      const currentZoom = map.getZoom() || 10;
      map.setZoom(currentZoom + 1);
    } else if (mapType === 'leaflet' && map) {
      map.zoomIn();
    }
  };

  const handleZoomOut = () => {
    if (mapType === 'google' && map && window.google) {
      const currentZoom = map.getZoom() || 10;
      map.setZoom(currentZoom - 1);
    } else if (mapType === 'leaflet' && map) {
      map.zoomOut();
    }
  };

  const handleRecenter = () => {
    if (mapType === 'google' && map && window.google) {
      const center = map.getCenter();
      if (center) {
        map.panTo(center);
      }
    } else if (mapType === 'leaflet' && map) {
      const center = map.getCenter();
      map.setView([center.lat, center.lng], map.getZoom());
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  const buttonSize = isMobile ? "w-12 h-12" : "w-10 h-10";
  const iconSize = isMobile ? "h-5 w-5" : "h-4 w-4";

  return (
    <div className={`absolute ${isMobile ? 'bottom-20 right-4' : 'top-4 right-4'} z-20 space-y-2`}>
      <Card className="p-0 overflow-hidden">
        <Button
          onClick={handleZoomIn}
          variant="ghost"
          size="sm"
          className={`${buttonSize} rounded-none border-b`}
        >
          <Plus className={iconSize} />
        </Button>
        <Button
          onClick={handleZoomOut}
          variant="ghost"
          size="sm"
          className={`${buttonSize} rounded-none`}
        >
          <Minus className={iconSize} />
        </Button>
      </Card>

      <Card className="p-2">
        <Button
          onClick={onToggleMapType}
          variant="ghost"
          size="sm"
          className={buttonSize}
          title="地図タイプ切替"
        >
          <Layers className={iconSize} />
        </Button>
      </Card>

      {/* Fortune Overlay Toggle - Only show for Leaflet maps */}
      {mapType === 'leaflet' && (
        <Card className="p-2">
          <Button
            onClick={onToggleFortuneOverlay}
            variant={showFortuneOverlay ? "default" : "ghost"}
            size="sm"
            className={buttonSize}
            title="運気ヒートマップ"
            disabled={overlayLoading}
          >
            {overlayLoading ? (
              <div className={`${iconSize} animate-spin rounded-full border-2 border-gray-300 border-t-gray-600`}></div>
            ) : (
              <Map className={iconSize} />
            )}
          </Button>
        </Card>
      )}

      <Card className="p-2">
        <Button
          onClick={handleRecenter}
          variant="ghost"
          size="sm"
          className={buttonSize}
          title="中心に戻る"
        >
          <Crosshair className={iconSize} />
        </Button>
      </Card>

      {!isMobile && (
        <Card className="p-2">
          <Button
            onClick={toggleFullscreen}
            variant="ghost"
            size="sm"
            className={buttonSize}
            title="フルスクリーン"
          >
            <Maximize className={iconSize} />
          </Button>
        </Card>
      )}

      <Card className="p-3">
        <div className={`${isMobile ? 'w-10 h-10' : 'w-12 h-12'} relative`}>
          <div className="w-full h-full border-2 border-gray-300 rounded-full relative">
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1 w-0 h-0 border-l-2 border-r-2 border-b-4 border-transparent border-b-red-500"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-1 h-1 bg-gray-800 rounded-full"></div>
            <span className="absolute -top-1 left-1/2 transform -translate-x-1/2 text-xs font-bold text-red-500">N</span>
          </div>
        </div>
      </Card>
    </div>
  );
}

function GoogleMapComponent({ 
  currentPosition, 
  setCurrentPosition, 
  zoom, 
  isMobile,
  kyuseiFormOffset 
}: {
  currentPosition: { lat: number; lng: number };
  setCurrentPosition: (position: { lat: number; lng: number }) => void;
  zoom: number;
  isMobile?: boolean;
  kyuseiFormOffset?: number;
}) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<any>(null);
  const [markerElements, setMarkerElements] = useState<any[]>([]);
  const [isMapLoaded, setIsMapLoaded] = useState(false);

  useEffect(() => {
    const loadGoogleMaps = async () => {
      if (window.google && window.google.maps) {
        initializeMap();
        return;
      }

      const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
      const mapId = import.meta.env.VITE_GOOGLE_MAPS_MAP_ID;
      
      if (!apiKey) {
        console.error('Google Maps API key not configured');
        return;
      }
      
      if (!mapId) {
        console.warn('MAP_ID missing - AdvancedMarkerElement may not work properly');
      }
      
      try {
        const { google, AdvancedMarkerElement, isLoaded } = await initializeGoogleMaps();
        if (isLoaded) {
          // Store Google instance globally
          window.google = google;
          initializeMap();
        }
      } catch (error) {
        console.error('Error loading Google Maps:', error);
      }
    };

    const initializeMap = () => {
      if (mapRef.current && window.google) {
        try {
          const mapConfig: any = {
            center: currentPosition,
            zoom: zoom,
            mapTypeControl: false,
            streetViewControl: false,
            fullscreenControl: false,
            zoomControl: false,
            gestureHandling: 'cooperative',
          };

          // Use Map ID if available for AdvancedMarkerElement support
          const mapId = import.meta.env.VITE_GOOGLE_MAPS_MAP_ID;
          if (mapId) {
            mapConfig.mapId = mapId;
          }

          const newMap = new window.google.maps.Map(mapRef.current, mapConfig);

          // Create AdvancedMarkerElement with Map ID support
          try {
            const markerContent = document.createElement('div');
            markerContent.style.cssText = `
              width: 16px;
              height: 16px;
              background-color: #3b82f6;
              border: 2px solid white;
              border-radius: 50%;
              box-shadow: 0 2px 4px rgba(0,0,0,0.3);
            `;

            const centerMarker = new window.google.maps.marker.AdvancedMarkerElement({
              position: currentPosition,
              map: newMap,
              title: "現在位置",
              content: markerContent
            });
            
            setMarkerElements([centerMarker]);
            // AdvancedMarkerElement created successfully
          } catch (markerError) {
            console.error('AdvancedMarkerElement creation failed:', markerError);
            
            // Fallback to basic marker if AdvancedMarkerElement fails
            const fallbackMarker = new window.google.maps.Marker({
              position: currentPosition,
              map: newMap,
              title: "現在位置",
              icon: {
                path: window.google.maps.SymbolPath.CIRCLE,
                scale: 8,
                fillColor: "#3b82f6",
                fillOpacity: 1,
                strokeColor: "#ffffff",
                strokeWeight: 2
              }
            });
            
            setMarkerElements([fallbackMarker]);
            // Fallback to basic Marker due to AdvancedMarkerElement error
          }

          newMap.addListener('click', (e: any) => {
            if (e.latLng) {
              setCurrentPosition({
                lat: e.latLng.lat(),
                lng: e.latLng.lng()
              });
            }
          });

          setMap(newMap);
          setIsMapLoaded(true);
        } catch (error) {
          console.error('Google Maps initialization failed:', error);
        }
      }
    };

    loadGoogleMaps();
  }, []);

  useEffect(() => {
    if (map && window.google) {
      map.setCenter(currentPosition);
      
      // Update center marker position with AdvancedMarkerElement
      markerElements.forEach(marker => {
        if (marker.title === "現在位置") {
          marker.position = currentPosition;
        }
      });
    }
  }, [map, currentPosition, markerElements]);

  return (
    <div 
      ref={mapRef} 
      className="w-full h-full"
      style={{
        minHeight: "100%",
        paddingTop: isMobile && kyuseiFormOffset && kyuseiFormOffset > 0 ? `${kyuseiFormOffset}px` : "0"
      }}
    />
  );
}

export default function HybridMap({
  currentPosition,
  setCurrentPosition,
  showPrimaryDirections,
  showSecondaryDirections,
  displayRadius,
  markers,
  zoom,
  isLoading,
  kyuseiSectors,
  showKyuseiMode,
  isMobile = false,
  kyuseiFormOffset = 0
}: HybridMapProps) {
  const [mapType, setMapType] = useState<'google' | 'leaflet'>('google');
  const [googleMapError, setGoogleMapError] = useState(false);
  const [showFortuneOverlay, setShowFortuneOverlay] = useState(false);
  const [overlayLoading, setOverlayLoading] = useState(false);
  const mapRef = useRef<L.Map | null>(null);

  // Check for Google Maps API errors and fallback to Leaflet
  useEffect(() => {
    const checkGoogleMapsAvailability = () => {
      // Check if API key is available
      if (!import.meta.env.VITE_GOOGLE_MAPS_API_KEY) {
        console.log('Google Maps API key not configured, using OpenStreetMap');
        setGoogleMapError(true);
        setMapType('leaflet');
        return;
      }
      
      // Check for Google Maps loading errors
      const errorElements = document.querySelectorAll('[data-error], .gm-err-container');
      if (errorElements.length > 0) {
        console.log('Google Maps error detected, falling back to OpenStreetMap');
        setGoogleMapError(true);
        setMapType('leaflet');
      }
    };

    // Initial check
    checkGoogleMapsAvailability();
    
    // Check again after a delay to catch loading errors
    const timer = setTimeout(checkGoogleMapsAvailability, 2000);
    return () => clearTimeout(timer);
  }, []);

  const toggleMapType = () => {
    if (!googleMapError) {
      setMapType(mapType === 'google' ? 'leaflet' : 'google');
    }
  };

  return (
    <div className="flex-1 relative">
      {mapType === 'google' && !googleMapError ? (
        <GoogleMapComponent
          currentPosition={currentPosition}
          setCurrentPosition={setCurrentPosition}
          zoom={zoom}
          isMobile={isMobile}
          kyuseiFormOffset={kyuseiFormOffset}
        />
      ) : (
        <LeafletMapContainer
          center={[currentPosition.lat, currentPosition.lng]}
          zoom={zoom}
          className="w-full h-full"
          zoomControl={false}
          ref={mapRef}
          style={isMobile && kyuseiFormOffset > 0 ? { paddingTop: `${kyuseiFormOffset}px` } : {}}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          <MapController 
            currentPosition={currentPosition} 
            setCurrentPosition={setCurrentPosition} 
          />

          {showPrimaryDirections && (
            <DirectionLines
              center={currentPosition}
              showPrimaryDirections={true}
              showSecondaryDirections={false}
              radius={displayRadius}
            />
          )}

          {showSecondaryDirections && (
            <DirectionLines
              center={currentPosition}
              showPrimaryDirections={false}
              showSecondaryDirections={true}
              radius={displayRadius}
            />
          )}

          {showKyuseiMode && kyuseiSectors.length > 0 && (
            <KyuseiSectors
              center={currentPosition}
              sectors={kyuseiSectors}
              radius={120000}
            />
          )}

          {/* Fortune Overlay */}
          <FortuneOverlay
            center={currentPosition}
            kyuseiSectors={kyuseiSectors}
            isVisible={showFortuneOverlay && showKyuseiMode}
            onLoadingChange={setOverlayLoading}
          />
        </LeafletMapContainer>
      )}
      
      <MapControls 
        map={mapRef.current} 
        isMobile={isMobile} 
        mapType={mapType}
        onToggleMapType={toggleMapType}
        showFortuneOverlay={showFortuneOverlay}
        onToggleFortuneOverlay={() => setShowFortuneOverlay(!showFortuneOverlay)}
        overlayLoading={overlayLoading}
      />
      
      {/* Fortune Overlay Loading Spinner */}
      <FortuneOverlaySpinner 
        isVisible={overlayLoading} 
        progress={0} 
      />
      <StatusBar 
        currentPosition={currentPosition} 
        zoom={zoom} 
        isMobile={isMobile}
        mapType={mapType}
      />

      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-30">
          <Card className="p-6">
            <div className="flex items-center space-x-3">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
              <span className="text-secondary">地図データを読み込み中...</span>
            </div>
          </Card>
        </div>
      )}

      {/* Google Maps Error Notice */}
      {googleMapError && (
        <div className="absolute top-16 left-4 right-4 z-30">
          <Card className="p-4 bg-yellow-50 border-yellow-200">
            <div className="text-sm text-yellow-800">
              Google Maps APIキーの設定に問題があります。OpenStreetMapで表示しています。
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}