import { Canvas } from "@react-three/fiber";
import { useState, useEffect } from "react";
import Experience from "./components/Experience";
import { MantineProvider } from "@mantine/core";
import Chatbot from "./components/Chatbot";
import logo from "./assets/icons/yucca.png";

const App = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark');
  };

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

   if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-orange-50 dark:bg-gray-900 transition-colors">
        <div className="text-center">
          <img src={logo} alt="Logo" className="w-24 h-24 mx-auto mb-6 animate-bounce" />
          <div className="w-48 h-1.5 mx-auto bg-orange-100 dark:bg-gray-700 rounded-full overflow-hidden">
            <div className="h-full bg-orange-500 dark:bg-orange-600 animate-progress"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-orange-50 dark:bg-gray-900 transition-colors flex flex-col md:grid md:grid-cols-2">
      {/* 3D Model Section */}
      <div className="h-[40vh] md:h-screen relative">
        <div className={`absolute inset-0 ${
          isDarkMode 
            ? 'bg-gradient-to-br from-gray-900 via-gray-800/50 to-gray-900' 
            : 'bg-gradient-to-br from-orange-50 via-orange-100/50 to-orange-50'
        } transition-colors`}>
          <MantineProvider>
            <Canvas 
              camera={{ position: [3, 1, 0], fov: 50 }} 
              shadows
            >
              <color attach="background" args={[isDarkMode ? '#1a1b1e' : '#fff7ed']} />
              <Experience />
            </Canvas>
          </MantineProvider>
        </div>
        
        {/* Info Card - Hidden on very small screens */}
        <div className="absolute bottom-4 left-4 md:bottom-8 md:left-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-3 md:p-4 shadow-lg transition-all duration-300 hover:-translate-y-1">
            <p className="text-orange-600 dark:text-orange-400 font-medium text-sm md:text-base">Temui Yucca</p>
            <p className="text-gray-500 dark:text-gray-400 text-xs md:text-sm mt-1">Panduan UC Anda</p>
          </div>
        </div>
      </div>

      {/* Chat Section */}
      <div className="flex-1 md:h-screen overflow-hidden border-t md:border-l border-orange-100 dark:border-gray-700 transition-colors">
        <Chatbot isDarkMode={isDarkMode} toggleTheme={toggleTheme} />
      </div>
    </div>
  );
};

export default App;