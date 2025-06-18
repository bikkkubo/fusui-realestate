import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Plus, Minus, Layers, Crosshair, Maximize } from "lucide-react";

interface SimpleGoogleMapProps {
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

function MapControls({ 
  map, 
  isMobile = false 
}: { 
  map?: any; 
  isMobile?: boolean; 
}) {
  const [mapType, setMapType] = useState("roadmap");

  const handleZoomIn = () => {
    if (map && window.google) {
      const currentZoom = map.getZoom() || 10;
      map.setZoom(currentZoom + 1);
    }
  };

  const handleZoomOut = () => {
    if (map && window.google) {
      const currentZoom = map.getZoom() || 10;
      map.setZoom(currentZoom - 1);
    }
  };

  const handleRecenter = () => {
    if (map && window.google) {
      const center = map.getCenter();
      if (center) {
        map.panTo(center);
      }
    }
  };

  const toggleMapType = () => {
    if (map && window.google) {
      const newType = mapType === "roadmap" ? "satellite" : "roadmap";
      map.setMapTypeId(newType);
      setMapType(newType);
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
          onClick={toggleMapType}
          variant="ghost"
          size="sm"
          className={buttonSize}
          title="地図タイプ切替"
        >
          <Layers className={iconSize} />
        </Button>
      </Card>

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

function StatusBar({ 
  currentPosition, 
  zoom, 
  isMobile = false 
}: { 
  currentPosition: { lat: number; lng: number }; 
  zoom: number; 
  isMobile?: boolean; 
}) {
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

export default function SimpleGoogleMap({
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
}: SimpleGoogleMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<any>(null);
  const [currentZoom, setCurrentZoom] = useState(zoom);
  const [isMapLoaded, setIsMapLoaded] = useState(false);

  useEffect(() => {
    const loadGoogleMaps = async () => {
      if (window.google && window.google.maps) {
        initializeMap();
        return;
      }

      const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
      if (!apiKey) {
        console.error('Google Maps API key not found');
        return;
      }
      
      try {
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=geometry&loading=async`;
        script.async = true;
        
        script.onerror = () => {
          console.error('Failed to load Google Maps API');
        };
        
        document.head.appendChild(script);
        
        // Wait for Google Maps to load and initialize
        await new Promise((resolve, reject) => {
          script.onload = () => {
            // Small delay to ensure Google Maps is fully loaded
            setTimeout(() => {
              if (window.google && window.google.maps) {
                initializeMap();
                resolve(true);
              } else {
                reject(new Error('Google Maps failed to initialize'));
              }
            }, 100);
          };
          script.onerror = reject;
        });
      } catch (error) {
        console.error('Error loading Google Maps:', error);
      }
    };

    const initializeMap = () => {
      if (mapRef.current && window.google) {
        const newMap = new window.google.maps.Map(mapRef.current, {
          center: currentPosition,
          zoom: zoom,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
          zoomControl: false,
          gestureHandling: 'cooperative',
          styles: [
            {
              featureType: "poi",
              elementType: "labels",
              stylers: [{ visibility: "off" }]
            }
          ]
        });

        // Center marker
        const centerMarker = new window.google.maps.Marker({
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

        // Map event listeners
        newMap.addListener('click', (e: any) => {
          if (e.latLng) {
            setCurrentPosition({
              lat: e.latLng.lat(),
              lng: e.latLng.lng()
            });
          }
        });

        newMap.addListener('idle', () => {
          const center = newMap.getCenter();
          const zoom = newMap.getZoom();
          
          if (center) {
            setCurrentPosition({
              lat: center.lat(),
              lng: center.lng()
            });
          }
          
          if (zoom) {
            setCurrentZoom(zoom);
          }
        });

        setMap(newMap);
        setIsMapLoaded(true);
      }
    };

    loadGoogleMaps();
  }, []);

  // Update map center when currentPosition changes
  useEffect(() => {
    if (map && window.google) {
      map.setCenter(currentPosition);
    }
  }, [map, currentPosition]);

  return (
    <div className="flex-1 relative">
      <div 
        ref={mapRef} 
        className="w-full h-full"
        style={{
          minHeight: "100vh",
          height: "100%",
          width: "100%",
          paddingTop: isMobile && kyuseiFormOffset > 0 ? `${kyuseiFormOffset}px` : "0"
        }}
      />

      {isMapLoaded && (
        <>
          <MapControls map={map} isMobile={isMobile} />
          <StatusBar currentPosition={currentPosition} zoom={currentZoom} isMobile={isMobile} />
        </>
      )}

      {/* Loading Overlay */}
      {(isLoading || !isMapLoaded) && (
        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-30">
          <Card className="p-6">
            <div className="flex items-center space-x-3">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
              <span className="text-secondary">地図データを読み込み中...</span>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}