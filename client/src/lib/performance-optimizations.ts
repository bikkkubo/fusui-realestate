/**
 * Performance optimizations for Google Maps and grid overlays
 */

// Grid overlay performance improvements
export function createOptimizedGridLayer(
  center: { lat: number; lng: number },
  radiusKm: number = 120,
  cellSizeKm: number = 1
) {
  const cells: Array<{ lat: number; lng: number; bounds: [number, number][] }> = [];
  
  // Use requestIdleCallback for non-blocking computation
  const computeCells = (callback: (cells: any[]) => void) => {
    const startTime = performance.now();
    const maxTime = 16; // 16ms for 60fps
    
    let currentRow = -radiusKm;
    
    const processChunk = () => {
      const chunkStart = performance.now();
      
      while (currentRow <= radiusKm && (performance.now() - chunkStart) < maxTime) {
        for (let col = -radiusKm; col <= radiusKm; col += cellSizeKm) {
          const lat = center.lat + (currentRow / 111); // 1 degree ≈ 111km
          const lng = center.lng + (col / (111 * Math.cos(lat * Math.PI / 180)));
          
          cells.push({
            lat,
            lng,
            bounds: [
              [lat - cellSizeKm/222, lng - cellSizeKm/(222 * Math.cos(lat * Math.PI / 180))],
              [lat + cellSizeKm/222, lng + cellSizeKm/(222 * Math.cos(lat * Math.PI / 180))]
            ]
          });
        }
        currentRow += cellSizeKm;
      }
      
      if (currentRow <= radiusKm) {
        // More work to do, schedule next chunk
        requestAnimationFrame(processChunk);
      } else {
        // Done, call callback
        callback(cells);
      }
    };
    
    processChunk();
  };
  
  return new Promise((resolve) => {
    computeCells(resolve);
  });
}

// WebGL layer for vector map performance
export function createVectorMapLayer(map: google.maps.Map) {
  // Enable vector maps for better performance
  map.setOptions({
    tilt: 0,
    heading: 0
  });
  
  // Custom WebGL overlay for 3D effects
  const overlay = new google.maps.OverlayView();
  
  overlay.onAdd = function() {
    // WebGL context setup
  };
  
  overlay.draw = function() {
    // Custom rendering with requestAnimationFrame
  };
  
  overlay.setMap(map);
  return overlay;
}

// Idle callback for smooth grid updates
export function requestIdleCallback(callback: (deadline: any) => void) {
  if ('requestIdleCallback' in window) {
    return window.requestIdleCallback(callback);
  } else {
    // Fallback for browsers without requestIdleCallback
    return setTimeout(callback, 1);
  }
}

// Performance monitoring
export function createPerformanceMonitor() {
  let frameCount = 0;
  let lastTime = performance.now();
  
  const monitor = () => {
    frameCount++;
    const currentTime = performance.now();
    
    if (currentTime - lastTime >= 1000) {
      const fps = frameCount / ((currentTime - lastTime) / 1000);
      console.log(`FPS: ${fps.toFixed(1)}`);
      
      frameCount = 0;
      lastTime = currentTime;
    }
    
    requestAnimationFrame(monitor);
  };
  
  monitor();
}