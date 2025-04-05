'use client';

import { useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';

// Dynamic import for the Spline runtime to prevent SSR issues
const Spline3DText = ({ 
  url, 
  width = '100%', 
  height = '300px', // Reduced default height
  onLoad, 
  backgroundColor = 'transparent', 
  className = '',
  hideWatermark = true // New option to control watermark visibility
}: {
  url: string;
  width?: string;
  height?: string;
  onLoad?: (splineApp: any) => void;
  backgroundColor?: string;
  className?: string;
  hideWatermark?: boolean;
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const splineRef = useRef<any>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  
  useEffect(() => {
    if (!canvasRef.current) return;
    
    // Dynamic import for the Spline runtime
    import('@splinetool/runtime').then(({ Application }) => {
      const loadSpline = async () => {
        try {
          // Initialize Spline scene
          const splineApp = new Application(canvasRef.current!);
          
          // Load the scene from the provided URL
          await splineApp.load(url);
          
          // Store reference for potential interaction
          splineRef.current = splineApp;
          
          // Hide watermark if requested
          if (hideWatermark) {
            // CSS-based hiding (enhanced approach)
            const style = document.createElement('style');
            style.textContent = `
              /* Target by known selectors */
              .spline-watermark, 
              [data-spline-watermark="true"],
              a[href*="app.spline.design"],
              a[href="https://spline.design"],
              #logo,
              [class*="spline-credit"], 
              [class*="watermark"],
              
              /* Target common attribution patterns */
              [class*="attribution"],
              [class*="powered-by"],
              [class*="logo-container"],
              
              /* Target by position (most watermarks are in corners) */
              [style*="position: absolute"][style*="bottom: 0"][style*="right: 0"],
              [style*="position: absolute"][style*="bottom: 10px"][style*="right: 10px"],
              [style*="position: fixed"][style*="bottom: 0"][style*="right: 0"] {
                /* Multiple methods to ensure hiding */
                display: none !important;
                opacity: 0 !important;
                visibility: hidden !important;
                pointer-events: none !important;
                
                /* Position off-screen as backup method */
                position: absolute !important;
                top: -9999px !important;
                left: -9999px !important;
                
                /* Size reduction as third method */
                height: 0 !important;
                width: 0 !important;
                max-height: 0 !important;
                max-width: 0 !important;
                overflow: hidden !important;
                
                /* Clip as fourth method */
                clip: rect(0, 0, 0, 0) !important;
                clip-path: inset(100%) !important;
                
                /* Transform as fifth method */
                transform: scale(0) !important;
                
                /* Z-index to ensure it's below everything */
                z-index: -9999 !important;
              }
              
              /* Target iframe containers that might hold watermarks */
              iframe[src*="spline"] {
                position: relative !important;
              }
              
              /* Create a transparent overlay to intercept watermark clicks in case it's visible */
              .spline-container::after {
                content: "" !important;
                position: absolute !important;
                bottom: 0 !important;
                right: 0 !important;
                width: 150px !important;
                height: 50px !important;
                background: transparent !important;
                z-index: 99999 !important;
              }
            `;
            document.head.appendChild(style);
            
            // Direct DOM removal approach (second attempt)
            const removeWatermark = () => {
              // Method 1: Shadow DOM approach for newer versions
              const viewers = document.querySelectorAll('spline-viewer');
              viewers.forEach(viewer => {
                if (viewer && (viewer as any).shadowRoot) {
                  const logo = (viewer as any).shadowRoot.querySelector('#logo');
                  if (logo) {
                    logo.remove();
                    console.log("Logo removed from shadow DOM!");
                  }
                }
              });
              
              // Method 2: Direct selector approach for older versions
              const watermarks = document.querySelectorAll(
                '.spline-watermark, [data-spline-watermark="true"], a[href*="app.spline.design"], a[href="https://spline.design"]'
              );
              
              if (watermarks.length > 0) {
                watermarks.forEach(el => {
                  if (el.parentNode) {
                    el.parentNode.removeChild(el);
                    console.log("Watermark element removed from DOM!");
                  }
                });
              }
              
              // Method 3: Look for specific spline credit elements
              const credits = document.querySelectorAll('[class*="spline-credit"], [class*="watermark"]');
              credits.forEach(el => {
                if (el.parentNode) {
                  el.parentNode.removeChild(el);
                  console.log("Credit element removed!");
                }
              });
            };
            
            // Initially try to remove it
            removeWatermark();
            
            // Set up an interval to repeatedly try removing the watermark
            // (it might be added dynamically after the scene loads)
            intervalRef.current = setInterval(() => {
              removeWatermark();
              
              // Check if the canvas is loaded and potentially check if we found watermarks
              // to decide if we should stop trying
              const hasLoaded = document.querySelector('canvas[data-spline-loaded="true"]');
              if (hasLoaded) {
                // Keep trying for a bit longer after load, then stop
                setTimeout(() => {
                  if (intervalRef.current) {
                    clearInterval(intervalRef.current);
                    intervalRef.current = null;
                  }
                }, 2000);
              }
            }, 200);
          }
          
          // Callback when scene is loaded
          if (onLoad && typeof onLoad === 'function') {
            onLoad(splineApp);
          }
        } catch (error) {
          console.error('Error loading Spline scene:', error);
        }
      };
      
      loadSpline();
    });
    
    // Cleanup function
    return () => {
      // Clear the interval when component unmounts
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      
      if (splineRef.current) {
        splineRef.current = null;
      }
    };
  }, [url, onLoad, hideWatermark]);
  
  return (
    <div 
      ref={containerRef}
      style={{ 
        position: 'relative',
        width, 
        height,
        backgroundColor,
        overflow: 'hidden'
      }}
      className={`spline-container ${className}`}
    >
      <canvas
        ref={canvasRef}
        style={{
          width: '100%',
          height: '100%',
          display: 'block'
        }}
      />
    </div>
  );
};

// Export as a dynamic component with SSR disabled
export default dynamic(() => Promise.resolve(Spline3DText), { ssr: false });