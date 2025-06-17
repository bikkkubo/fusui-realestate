import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Sidebar from "@/components/sidebar";
import SimpleGoogleMap from "@/components/simple-google-map";
import KyuseiForm from "@/components/kyusei-form";
import { Button } from "@/components/ui/button";
import { useMap } from "@/hooks/use-map";
import { useMobileSidebar } from "@/hooks/use-mobile";
import { Menu, X } from "lucide-react";

export default function FengShuiMap() {
  const [searchAddress, setSearchAddress] = useState("");
  const [showPrimaryDirections, setShowPrimaryDirections] = useState(true);
  const [showSecondaryDirections, setShowSecondaryDirections] = useState(true);
  const [displayRadius, setDisplayRadius] = useState(1000);
  const [showKyuseiMode, setShowKyuseiMode] = useState(false);
  const [kyuseiSectors, setKyuseiSectors] = useState<Array<{start: number, end: number}>>([]);
  
  const { isOpen, toggleSidebar, closeSidebar, isMobile } = useMobileSidebar();
  
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
    <div className="flex h-screen bg-background relative">
      {/* Mobile Menu Button */}
      {isMobile && (
        <Button
          onClick={toggleSidebar}
          className="mobile-menu-btn p-3"
          variant="outline"
          size="sm"
        >
          {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      )}

      {/* Mobile Overlay */}
      {isMobile && isOpen && (
        <div 
          className="mobile-overlay"
          onClick={closeSidebar}
        />
      )}

      {/* Top Form for Kyusei Mode - Mobile Responsive */}
      {showKyuseiMode && (
        <div className={isMobile ? "kyusei-form-mobile" : ""}>
          <KyuseiForm
            currentPosition={currentPosition}
            onSectorsCalculated={setKyuseiSectors}
            onClose={() => setShowKyuseiMode(false)}
            isMobile={isMobile}
          />
        </div>
      )}
      
      {/* Sidebar - Mobile Responsive */}
      <div className={`${isMobile ? `sidebar-mobile ${isOpen ? 'open' : ''}` : ''}`}>
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
          isMobile={isMobile}
          onCloseMobile={closeSidebar}
        />
      </div>

      {/* Map Container */}
      <div className={`flex-1 ${isMobile ? 'w-full' : ''}`}>
        <SimpleGoogleMap
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
          isMobile={isMobile}
          kyuseiFormOffset={showKyuseiMode && isMobile ? 200 : 0}
        />
      </div>
    </div>
  );
}
