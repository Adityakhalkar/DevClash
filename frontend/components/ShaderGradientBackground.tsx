import React, { useEffect, useState } from 'react'
import { ShaderGradientCanvas, ShaderGradient } from '@shadergradient/react'

function ShaderGradientBackground() {
  const [isMobile, setIsMobile] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  if (!mounted) return null;

  return (
    <ShaderGradientCanvas
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: isMobile ? '100%' : '90%',
        zIndex: 0,
        opacity: 0.85,
        pointerEvents: 'none', // Allow clicking through
      }}
    >
      <ShaderGradient
        control='query'
        urlString='https://www.shadergradient.co/customize?animate=on&axesHelper=off&bgColor1=%23ffffff&bgColor2=%23ffffff&brightness=1.2&cAzimuthAngle=180&cDistance=5.3&cPolarAngle=70&cameraZoom=1&color1=%233b82f6&color2=%234f46e5&color3=%23ffffff&destination=onCanvas&embedMode=off&envPreset=city&format=gif&fov=45&frameRate=10&gizmoHelper=hide&grain=on&lightType=3d&pixelDensity=1.4&positionX=0&positionY=0.9&positionZ=0&range=enabled&rangeEnd=40&rangeStart=0&reflection=0.1&rotationX=50&rotationY=0&rotationZ=0.7&shader=defaults&type=waterPlane&uAmplitude=0&uDensity=1&uFrequency=0&uSpeed=0.3&uStrength=3.8&uTime=0&wireframe=false&zoomOut=false'
      />
    </ShaderGradientCanvas>
  )
}

export default ShaderGradientBackground;