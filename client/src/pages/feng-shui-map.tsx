import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Sidebar from "@/components/sidebar";
import MapContainer from "@/components/map-container";
import KyuseiForm from "@/components/kyusei-form";
import { useMap } from "@/hooks/use-map";

export default function FengShuiMap() {
  const [searchAddress, setSearchAddress] = useState("");
  const [showPrimaryDirections, setShowPrimaryDirections] = useState(true);
  const [showSecondaryDirections, setShowSecondaryDirections] = useState(true);
  const [displayRadius, setDisplayRadius] = useState(1000);
  const [showKyuseiMode, setShowKyuseiMode] = useState(false);
  const [kyuseiSectors, setKyuseiSectors] = useState<Array<{start: number, end: number}>>([]);
  
  const {
    currentPosition,
    setCurrentPosition,
    markers,
    addMarker,
    clearMarkers,
    elevation,
    zoom,
    isLoading,
    setIsLoading
  } = useMap();

  const { data: markersData } = useQuery({
    queryKey: ["/api/markers"],
  });

  return (
    <div className="flex h-screen bg-background">
      {/* Top Form for Kyusei Mode */}
      {showKyuseiMode && (
        <KyuseiForm
          currentPosition={currentPosition}
          onSectorsCalculated={setKyuseiSectors}
          onClose={() => setShowKyuseiMode(false)}
        />
      )}
      
      <Sidebar
        searchAddress={searchAddress}
        setSearchAddress={setSearchAddress}
        currentPosition={currentPosition}
        elevation={elevation}
        showPrimaryDirections={showPrimaryDirections}
        setShowPrimaryDirections={setShowPrimaryDirections}
        showSecondaryDirections={showSecondaryDirections}
        setShowSecondaryDirections={setShowSecondaryDirections}
        displayRadius={displayRadius}
        setDisplayRadius={setDisplayRadius}
        onAddMarker={addMarker}
        onClearMarkers={clearMarkers}
        onLocationJump={(lat: number, lng: number) => setCurrentPosition({ lat, lng })}
        isLoading={isLoading}
        setIsLoading={setIsLoading}
        showKyuseiMode={showKyuseiMode}
        onToggleKyuseiMode={() => setShowKyuseiMode(!showKyuseiMode)}
      />
      <MapContainer
        currentPosition={currentPosition}
        setCurrentPosition={setCurrentPosition}
        showPrimaryDirections={showPrimaryDirections}
        showSecondaryDirections={showSecondaryDirections}
        displayRadius={displayRadius}
        markers={markers}
        zoom={zoom}
        isLoading={isLoading}
        kyuseiSectors={kyuseiSectors}
        showKyuseiMode={showKyuseiMode}
      />
    </div>
  );
}
