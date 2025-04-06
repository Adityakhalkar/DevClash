'use client';

import { useEffect, useRef } from 'react';
import Spline from '@splinetool/react-spline';

// Props interface for the component
interface SplineWatermarkRemoverProps {
  scene: string;
  className?: string;
  style?: React.CSSProperties;
  onLoad?: (splineApp: any) => void;
}

/**
 * Enhanced Spline component that removes watermarks automatically
 */
const SplineWatermarkRemover = ({
  scene,
  className,
  style,
  onLoad,
}: SplineWatermarkRemoverProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  
  useEffect(() => {
    // Inject CSS to hide watermark
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
    
    // Function to remove watermarks directly from DOM
    const removeWatermark = () => {
      // Method 1: Shadow DOM approach for newer versions
      const viewers = document.querySelectorAll('spline-viewer');
      viewers.forEach(viewer => {
        if (viewer && (viewer as any).shadowRoot) {
          const logo = (viewer as any).shadowRoot.querySelector('#logo');
          if (logo) {
            logo.remove();
            console.debug("Spline logo removed from shadow DOM");
          }
          
          // Additional shadow DOM cleanup (deeper traversal)
          const shadowEls = (viewer as any).shadowRoot.querySelectorAll('*');
          shadowEls.forEach((el: Element) => {
            if (el.tagName === 'A' && (el.getAttribute('href')?.includes('spline.design') || el.getAttribute('href')?.includes('app.spline.design'))) {
              el.remove();
              console.debug("Shadow DOM link element removed");
            }
          });
        }
      });
      
      // Method 2: Direct selector approach for older versions
      const watermarks = document.querySelectorAll(
        '.spline-watermark, [data-spline-watermark="true"], a[href*="app.spline.design"], a[href="https://spline.design"], #logo'
      );
      
      if (watermarks.length > 0) {
        watermarks.forEach(el => {
          if (el.parentNode) {
            el.parentNode.removeChild(el);
            console.debug("Watermark element removed from DOM");
          }
        });
      }
      
      // Method 3: Look for specific spline credit elements
      const credits = document.querySelectorAll('[class*="spline-credit"], [class*="watermark"], [class*="attribution"]');
      credits.forEach(el => {
        if (el.parentNode) {
          el.parentNode.removeChild(el);
          console.debug("Credit element removed");
        }
      });
      
      // Method 4: Look for likely watermark elements by position and size
      document.querySelectorAll('*').forEach(el => {
        const rect = el.getBoundingClientRect();
        const style = window.getComputedStyle(el);
        
        // Check if element is positioned in the bottom right corner and is small
        const isBottomRight = 
          style.position === 'absolute' || style.position === 'fixed' || style.position === 'sticky';
        
        const isSmall = rect.width < 200 && rect.height < 80;
        
        const isInCorner = 
          (window.innerHeight - (rect.top + rect.height) < 20) && 
          (window.innerWidth - (rect.left + rect.width) < 20);
        
        if (isBottomRight && isSmall && isInCorner) {
          // This is likely a watermark
          if(el.parentNode && !el.className?.includes('custom-branding') && !el.id?.includes('custom-branding')) {
            (el as HTMLElement).style.display = 'none';
            (el as HTMLElement).style.opacity = '0';
            console.debug("Suspected watermark element hidden by position analysis");
          }
        }
      });
      
      // Ensure our container has the spline-container class
      if (containerRef.current) {
        containerRef.current.classList.add('spline-container');
      }
    };
    
    // Initial attempt to remove watermarks
    removeWatermark();
    
    // Set up an interval to repeatedly try removing the watermark
    // (it might be added dynamically after the scene loads)
    intervalRef.current = setInterval(() => {
      removeWatermark();
      
      // Check if the spline has loaded
      const hasLoaded = 
        document.querySelector('canvas[data-spline-loaded="true"]') || 
        document.querySelector('spline-viewer:not([loading])');
        
      if (hasLoaded) {
        // Keep trying for a bit longer after load, then reduce frequency
        setTimeout(() => {
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            
            // Switch to a less frequent interval after initial loading
            intervalRef.current = setInterval(removeWatermark, 2000);
            
            // After 10 seconds, check one final time and stop
            setTimeout(() => {
              removeWatermark();
              if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
              }
            }, 10000);
          }
        }, 2000);
      }
    }, 200);

    return () => {
      // Cleanup interval on component unmount
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, []);

  // Handle the onLoad callback
  const handleLoad = (splineApp: any) => {
    if (onLoad) {
      onLoad(splineApp);
    }
  };

  return (
    <div 
      ref={containerRef} 
      className={`relative overflow-hidden ${className || ''}`}
      style={style}
    >
      <Spline scene={scene} onLoad={handleLoad} />
      
      {/* Custom branding replacement for bottom right corner */}
      <div className="absolute bottom-4 right-4 z-10 custom-branding" id="custom-branding">
        <div className="px-4 py-1.5 bg-yellow-500/80 backdrop-blur-sm rounded-full border border-yellow-500/20">
          <span className="text-white text-xs font-medium">Savium Investments</span>
        </div>
      </div>
    </div>
  );
};

export default SplineWatermarkRemover;