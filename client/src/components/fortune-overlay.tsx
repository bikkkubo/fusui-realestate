import { useEffect, useState } from "react";
import { Polygon, LayersControl } from "react-leaflet";
import { buildLuckOverlay, OverlayData, getGridStats } from "@/lib/overlay-calculations";

interface FortuneOverlayProps {
  center: { lat: number; lng: number };
  kyuseiSectors: Array<{start: number, end: number}>;
  isVisible: boolean;
  onLoadingChange?: (loading: boolean) => void;
}

export default function FortuneOverlay({ 
  center, 
  kyuseiSectors, 
  isVisible,
  onLoadingChange 
}: FortuneOverlayProps) {
  const [overlayData, setOverlayData] = useState<OverlayData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!isVisible || kyuseiSectors.length === 0) {
      return;
    }

    const generateOverlay = async () => {
      setIsLoading(true);
      onLoadingChange?.(true);
      
      try {
        const data = await buildLuckOverlay(
          center,
          kyuseiSectors,
          (progress) => setProgress(progress * 100)
        );
        
        setOverlayData(data);
        
        // Log statistics for debugging
        const stats = getGridStats(data);
        console.log('運気ヒートマップ統計:', stats);
      } catch (error) {
        console.error('運気ヒートマップ生成エラー:', error);
      } finally {
        setIsLoading(false);
        onLoadingChange?.(false);
      }
    };

    generateOverlay();
  }, [center.lat, center.lng, kyuseiSectors, isVisible, onLoadingChange]);

  if (!isVisible || !overlayData) {
    return null;
  }

  return (
    <>
      {/* Good fortune areas - Green */}
      {overlayData.goodPolygons.map((polygon, index) => (
        <Polygon
          key={`good-${index}`}
          positions={polygon}
          pathOptions={{
            color: '#00A96E',
            fillColor: '#00A96E',
            fillOpacity: 0.3,
            stroke: false,
            weight: 0
          }}
        >
          {/* Tooltip for good areas */}
          <div style={{ display: 'none' }}>
            吉方エリア：転居に最適
          </div>
        </Polygon>
      ))}
      
      {/* Bad fortune areas - Red */}
      {overlayData.badPolygons.map((polygon, index) => (
        <Polygon
          key={`bad-${index}`}
          positions={polygon}
          pathOptions={{
            color: '#EF4444',
            fillColor: '#EF4444',
            fillOpacity: 0.3,
            stroke: false,
            weight: 0
          }}
        >
          {/* Tooltip for bad areas */}
          <div style={{ display: 'none' }}>
            凶方エリア：転居は避ける
          </div>
        </Polygon>
      ))}
    </>
  );
}

// Loading spinner component for the overlay generation
export function FortuneOverlaySpinner({ 
  isVisible, 
  progress 
}: { 
  isVisible: boolean; 
  progress: number; 
}) {
  if (!isVisible) return null;

  return (
    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 bg-white bg-opacity-90 rounded-lg p-4 shadow-lg">
      <div className="flex flex-col items-center space-y-3">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <div className="text-sm text-gray-700">
          運気ヒートマップ生成中...
        </div>
        <div className="w-32 bg-gray-200 rounded-full h-2">
          <div 
            className="bg-primary h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        <div className="text-xs text-gray-500">
          {Math.round(progress)}%
        </div>
      </div>
    </div>
  );
}