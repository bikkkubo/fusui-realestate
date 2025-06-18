import React, { useCallback, useRef, useEffect, useState } from "react";
import { Wrapper, Status } from "@googlemaps/react-wrapper";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Plus, Minus, Layers, Crosshair, Maximize } from "lucide-react";

interface GoogleMapProps {
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

interface MapProps extends google.maps.MapOptions {
  style: { [key: string]: string };
  onClick?: (e: google.maps.MapMouseEvent) => void;
  onIdle?: (map: google.maps.Map) => void;
  onDrag?: (map: google.maps.Map) => void;
  children?: React.ReactNode;
}

const MapComponent: React.FC<MapProps> = ({
  onClick,
  onIdle,
  onDrag,
  children,
  style,
  ...options
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map>();

  useEffect(() => {
    if (ref.current && !map) {
      const newMap = new window.google.maps.Map(ref.current, {
        ...options,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
        zoomControl: false,
      });
      setMap(newMap);
    }
  }, [ref, map, options]);

  useEffect(() => {
    if (map) {
      ["click", "idle", "drag"].forEach((eventName) =>
        google.maps.event.clearListeners(map, eventName)
      );

      if (onClick) {
        map.addListener("click", onClick);
      }

      if (onIdle) {
        map.addListener("idle", () => onIdle(map));
      }

      if (onDrag) {
        map.addListener("drag", () => onDrag(map));
      }
    }
  }, [map, onClick, onIdle, onDrag]);

  return (
    <>
      <div ref={ref} style={style} />
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child, { map });
        }
      })}
    </>
  );
};

interface MarkerProps {
  position: google.maps.LatLngLiteral;
  map?: google.maps.Map;
  title?: string;
  icon?: string;
}

const Marker: React.FC<MarkerProps> = ({ position, map, title, icon }) => {
  const [marker, setMarker] = useState<google.maps.Marker>();

  useEffect(() => {
    if (!marker && map) {
      const newMarker = new google.maps.Marker({
        position,
        map,
        title,
        icon,
      });
      setMarker(newMarker);
    }

    return () => {
      if (marker) {
        marker.setMap(null);
      }
    };
  }, [marker, map, position, title, icon]);

  useEffect(() => {
    if (marker) {
      marker.setPosition(position);
    }
  }, [marker, position]);

  return null;
};

function MapControls({ 
  map, 
  isMobile = false 
}: { 
  map?: google.maps.Map; 
  isMobile?: boolean; 
}) {
  const [mapType, setMapType] = useState<google.maps.MapTypeId>(google.maps.MapTypeId.ROADMAP);

  const handleZoomIn = useCallback(() => {
    if (map) {
      const currentZoom = map.getZoom() || 10;
      map.setZoom(currentZoom + 1);
    }
  }, [map]);

  const handleZoomOut = useCallback(() => {
    if (map) {
      const currentZoom = map.getZoom() || 10;
      map.setZoom(currentZoom - 1);
    }
  }, [map]);

  const handleRecenter = useCallback(() => {
    if (map) {
      const center = map.getCenter();
      if (center) {
        map.panTo(center);
      }
    }
  }, [map]);

  const toggleMapType = useCallback(() => {
    if (map) {
      const newType = mapType === google.maps.MapTypeId.ROADMAP 
        ? google.maps.MapTypeId.SATELLITE 
        : google.maps.MapTypeId.ROADMAP;
      map.setMapTypeId(newType);
      setMapType(newType);
    }
  }, [map, mapType]);

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  }, []);

  const buttonSize = isMobile ? "w-12 h-12" : "w-10 h-10";
  const iconSize = isMobile ? "h-5 w-5" : "h-4 w-4";

  return (
    <div className={`absolute ${isMobile ? 'bottom-20 right-4' : 'top-4 right-4'} z-20 space-y-2`}>
      {/* Zoom Controls */}
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

      {/* Layer Controls */}
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

      {/* Recenter */}
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

      {/* Fullscreen - Hidden on mobile */}
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

      {/* Compass */}
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

const render = (status: Status) => {
  if (status === Status.LOADING) return <div>地図を読み込み中...</div>;
  if (status === Status.FAILURE) return <div>地図の読み込みに失敗しました</div>;
  return null;
};

export default function GoogleMap({
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
}: GoogleMapProps) {
  const [map, setMap] = useState<google.maps.Map>();
  const [currentZoom, setCurrentZoom] = useState(zoom);

  const onIdle = useCallback((map: google.maps.Map) => {
    const center = map.getCenter();
    const zoom = map.getZoom();
    
    if (center) {
      setCurrentPosition({
        lat: center.lat(),
        lng: center.lng()
      });
    }
    
    if (zoom) {
      setCurrentZoom(zoom);
    }
  }, [setCurrentPosition]);

  const onClick = useCallback((e: google.maps.MapMouseEvent) => {
    if (e.latLng) {
      setCurrentPosition({
        lat: e.latLng.lat(),
        lng: e.latLng.lng()
      });
    }
  }, [setCurrentPosition]);

  return (
    <div className="flex-1 relative">
      <Wrapper 
        apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY || process.env.GOOGLE_MAPS_API_KEY || ""} 
        render={render}
        libraries={["geometry"]}
      >
        <MapComponent
          center={currentPosition}
          zoom={zoom}
          style={{ 
            flexGrow: "1", 
            height: "100%",
            paddingTop: isMobile && kyuseiFormOffset > 0 ? `${kyuseiFormOffset}px` : "0"
          }}
          onClick={onClick}
          onIdle={onIdle}
        >
          {/* Center Marker */}
          <Marker 
            position={currentPosition} 
            title="現在位置"
            icon={{
              url: "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(`
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="12" cy="12" r="8" fill="#3b82f6" stroke="#ffffff" stroke-width="2"/>
                  <circle cx="12" cy="12" r="3" fill="#ffffff"/>
                </svg>
              `),
              scaledSize: new google.maps.Size(24, 24),
              anchor: new google.maps.Point(12, 12)
            }}
          />

          {/* Additional Markers */}
          {markers.map((marker, index) => (
            <Marker
              key={marker.id || index}
              position={marker.position}
              title={marker.title || `マーカー ${index + 1}`}
            />
          ))}
        </MapComponent>

        <MapControls map={map} isMobile={isMobile} />
        <StatusBar currentPosition={currentPosition} zoom={currentZoom} isMobile={isMobile} />
      </Wrapper>

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
    </div>
  );
}