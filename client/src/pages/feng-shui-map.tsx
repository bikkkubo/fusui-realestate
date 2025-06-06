import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Sidebar from "@/components/sidebar";
import MapContainer from "@/components/map-container";
import { useMap } from "@/hooks/use-map";

export default function FengShuiMap() {
  const [searchAddress, setSearchAddress] = useState("");
  const [showPrimaryDirections, setShowPrimaryDirections] = useState(true);
  const [showSecondaryDirections, setShowSecondaryDirections] = useState(true);
  const [displayRadius, setDisplayRadius] = useState(1000);
  
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
      />
    </div>
  );
}
