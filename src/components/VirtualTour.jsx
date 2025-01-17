import React, { useState, useRef } from 'react';
import { Maximize2, Minimize2, Info, X } from 'lucide-react';
import { Canvas } from "@react-three/fiber";
import ExperienceVirtualTour from './VirtualTourExperience';

const VirtualTour = ({ isDarkMode }) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showInfo, setShowInfo] = useState(true);
  const containerRef = useRef(null);

  const toggleFullscreen = async () => {
    try {
      if (!isFullscreen) {
        if (containerRef.current.requestFullscreen) {
          await containerRef.current.requestFullscreen();
        } else if (containerRef.current.webkitRequestFullscreen) {
          await containerRef.current.webkitRequestFullscreen();
        }
        setIsFullscreen(true);
      } else {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
          await document.webkitExitFullscreen();
        }
        setIsFullscreen(false);
      }
    } catch (error) {
      console.error('Error toggling fullscreen:', error);
    }
  };

  React.useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(
        document.fullscreenElement ||
        document.webkitFullscreenElement
      ));
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
    };
  }, []);

  return (
    <div className="space-y-4">
      <div 
        ref={containerRef}
        className={`relative ${isFullscreen ? 'w-screen h-screen' : 'w-full h-[480px] rounded-lg overflow-hidden shadow-lg'}`}
      >
        {/* Virtual Tour Iframe */}
        <div className="absolute inset-0">
          <iframe
            src="https://dieng.blob.core.windows.net/virtual-tour-2023/index.htm"
            width="100%"
            height="100%"
            className="border-0"
            title="UC Virtual Tour"
          />
        </div>

        {/* Yucca Canvas Overlay */}
        <div className="absolute -bottom-10 right-0 w-96 h-96">
          <Canvas 
            camera={{ position: [0, 0, 3.5], fov: 45 }}
            style={{ background: 'transparent' }}
            gl={{
              alpha: true,
              antialias: true,
              preserveDrawingBuffer: false,
            }}
          >
            <ExperienceVirtualTour />
          </Canvas>
        </div>
        
        {/* Fullscreen Button */}
        {isFullscreen && (
          <button
            onClick={toggleFullscreen}
            className="absolute top-4 right-4 p-2 bg-black/20 hover:bg-black/30 backdrop-blur-sm rounded-lg text-white transition-colors"
            title="Exit Fullscreen"
          >
            <Minimize2 size={18} />
          </button>
        )}
      </div>

      {/* Controls Section */}
      <div className={`${isFullscreen ? 'hidden' : 'flex flex-col items-center gap-4'}`}>
        <div className="flex gap-4 justify-center">
          <button
            onClick={() => setShowInfo(true)}
            className="py-2 px-4 bg-white dark:bg-gray-800 rounded-lg shadow-md text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-2 border border-gray-200 dark:border-gray-700"
          >
            <Info size={20} />
            <span>Panduan Penggunaan</span>
          </button>

          <button
            onClick={toggleFullscreen}
            className="py-2 px-4 bg-white dark:bg-gray-800 rounded-lg shadow-md text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-2 border border-gray-200 dark:border-gray-700"
          >
            <Maximize2 size={20} />
            <span>Mode Fullscreen</span>
          </button>
        </div>

        {showInfo && (
          <div className="w-full max-w-2xl bg-white dark:bg-gray-800 rounded-lg p-4 shadow-md border border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-start">
              <div className="space-y-3 w-full">
                <div className="flex justify-between items-start w-full">
                  <h2 className="text-lg font-bold text-gray-800 dark:text-white">Panduan Virtual Tour UC</h2>
                  <button
                    onClick={() => setShowInfo(false)}
                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  >
                    <X size={20} />
                  </button>
                </div>
                
                <p className="text-gray-600 dark:text-gray-300">
                  Jelajahi kampus Universitas Ciputra secara virtual dengan panduan Yucca.
                </p>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
                    <span className="text-xl">🖱️</span>
                    <div>
                      <p className="font-medium">Klik & Drag</p>
                      <p className="text-sm">Gerakkan mouse untuk melihat sekeliling</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
                    <span className="text-xl">⚡</span>
                    <div>
                      <p className="font-medium">Double Click</p>
                      <p className="text-sm">Klik dua kali untuk berpindah ke lokasi yang dituju</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VirtualTour;