import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";

export interface Position {
  lat: number;
  lng: number;
}

export interface MapMarker {
  id: string;
  position: Position;
  type: 'center' | 'point' | 'feng-shui';
}

export function useMap() {
  const [currentPosition, setCurrentPosition] = useState<Position>({
    lat: 35.6812362169920776,
    lng: 139.7287614763195
  });
  
  const [markers, setMarkers] = useState<MapMarker[]>([]);
  const [zoom, setZoom] = useState(15);
  const [isLoading, setIsLoading] = useState(false);

  // Query elevation data
  const { data: elevationData } = useQuery({
    queryKey: ["/api/elevation", currentPosition.lat, currentPosition.lng],
    queryFn: async () => {
      const response = await fetch(
        `/api/elevation?lat=${currentPosition.lat}&lng=${currentPosition.lng}`
      );
      if (!response.ok) throw new Error("Failed to fetch elevation");
      return response.json();
    },
  });

  const elevation = elevationData?.elevation || 0;

  const addMarker = () => {
    const newMarker: MapMarker = {
      id: Date.now().toString(),
      position: { ...currentPosition },
      type: 'point'
    };
    setMarkers(prev => [...prev, newMarker]);
  };

  const removeMarker = (id: string) => {
    setMarkers(prev => prev.filter(marker => marker.id !== id));
  };

  const clearMarkers = () => {
    setMarkers([]);
  };

  const updateMarkerPosition = (id: string, position: Position) => {
    setMarkers(prev => 
      prev.map(marker => 
        marker.id === id ? { ...marker, position } : marker
      )
    );
  };

  return {
    currentPosition,
    setCurrentPosition,
    markers,
    addMarker,
    removeMarker,
    clearMarkers,
    updateMarkerPosition,
    elevation,
    zoom,
    setZoom,
    isLoading,
    setIsLoading
  };
}
