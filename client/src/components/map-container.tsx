import { useEffect, useRef, useState } from "react";
import { MapContainer as LeafletMapContainer, TileLayer, useMap, useMapEvents } from "react-leaflet";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import DirectionLines from "./direction-lines";
import KyuseiSectors from "./kyusei-sectors";
import { Plus, Minus, Layers, Crosshair, Maximize } from "lucide-react";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix for default markers
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

interface MapContainerProps {
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
    moveend: () => {
      const center = map.getCenter();
      setCurrentPosition({ lat: center.lat, lng: center.lng });
    }
  });

  return null;
}

function StatusBar({ currentPosition, zoom }: { currentPosition: { lat: number; lng: number }; zoom: number }) {
  const [mousePosition, setMousePosition] = useState<{ lat: number; lng: number } | null>(null);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setLastUpdated(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useMapEvents({
    mousemove: (e) => {
      setMousePosition({ lat: e.latlng.lat, lng: e.latlng.lng });
    }
  });

  return (
    <div className="absolute bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-t border-gray-200 px-4 py-2 z-10">
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center space-x-4">
          <span className="text-gray-600">ズーム:</span>
          <span className="font-mono text-primary">{zoom}</span>
          
          <span className="text-gray-600">|</span>
          
          <span className="text-gray-600">マウス位置:</span>
          <span className="font-mono text-secondary">
            {mousePosition ? `${mousePosition.lat.toFixed(4)}, ${mousePosition.lng.toFixed(4)}` : "---"}
          </span>
        </div>
        
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
      </div>
    </div>
  );
}

function MapControls() {
  const map = useMap();
  const [mapType, setMapType] = useState("streets");

  const handleZoomIn = () => map.zoomIn();
  const handleZoomOut = () => map.zoomOut();
  const handleRecenter = () => {
    const center = map.getCenter();
    map.setView([center.lat, center.lng], map.getZoom());
  };

  const toggleMapType = () => {
    // This would switch between different tile layers in a real implementation
    setMapType(mapType === "streets" ? "satellite" : "streets");
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  return (
    <div className="absolute top-4 right-4 z-20 space-y-2">
      {/* Zoom Controls */}
      <Card className="p-0 overflow-hidden">
        <Button
          onClick={handleZoomIn}
          variant="ghost"
          size="sm"
          className="w-10 h-10 rounded-none border-b"
        >
          <Plus className="h-4 w-4" />
        </Button>
        <Button
          onClick={handleZoomOut}
          variant="ghost"
          size="sm"
          className="w-10 h-10 rounded-none"
        >
          <Minus className="h-4 w-4" />
        </Button>
      </Card>

      {/* Layer Controls */}
      <Card className="p-2">
        <Button
          onClick={toggleMapType}
          variant="ghost"
          size="sm"
          className="w-10 h-10"
          title="地図タイプ切替"
        >
          <Layers className="h-4 w-4" />
        </Button>
      </Card>

      {/* Recenter */}
      <Card className="p-2">
        <Button
          onClick={handleRecenter}
          variant="ghost"
          size="sm"
          className="w-10 h-10"
          title="中心に戻る"
        >
          <Crosshair className="h-4 w-4" />
        </Button>
      </Card>

      {/* Fullscreen */}
      <Card className="p-2">
        <Button
          onClick={toggleFullscreen}
          variant="ghost"
          size="sm"
          className="w-10 h-10"
          title="フルスクリーン"
        >
          <Maximize className="h-4 w-4" />
        </Button>
      </Card>

      {/* Compass */}
      <Card className="p-3">
        <div className="w-12 h-12 relative">
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

export default function MapContainer({
  currentPosition,
  setCurrentPosition,
  showPrimaryDirections,
  showSecondaryDirections,
  displayRadius,
  markers,
  zoom,
  isLoading,
  kyuseiSectors,
  showKyuseiMode
}: MapContainerProps) {
  const mapRef = useRef<L.Map | null>(null);

  return (
    <div className="flex-1 relative">
      <LeafletMapContainer
        center={[currentPosition.lat, currentPosition.lng]}
        zoom={zoom}
        className="w-full h-full"
        zoomControl={false}
        ref={mapRef}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <MapController 
          currentPosition={currentPosition} 
          setCurrentPosition={setCurrentPosition} 
        />
        
        {!showKyuseiMode && (
          <DirectionLines
            center={currentPosition}
            showPrimaryDirections={showPrimaryDirections}
            showSecondaryDirections={showSecondaryDirections}
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
        
        <MapControls />
        <StatusBar currentPosition={currentPosition} zoom={zoom} />
      </LeafletMapContainer>

      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
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
