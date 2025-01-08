import { Canvas } from "@react-three/fiber";
import { useState, useEffect } from "react";
import Experience from "./components/Experience";
import { MantineProvider } from "@mantine/core";
import Chatbot from "./components/Chatbot";
import logo from "./assets/icons/yucca.png";

const App = () => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-orange-50">
        <div className="text-center">
          <img src={logo} alt="Logo" className="w-24 h-24 mx-auto mb-6 animate-bounce" />
          <div className="w-48 h-1.5 mx-auto bg-orange-100 rounded-full overflow-hidden">
            <div className="h-full bg-orange-500 animate-progress"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-orange-50">
      <div className="grid grid-cols-1 md:grid-cols-2 h-full">
        {/* 3D Model Section */}
        <div className="hidden md:block h-screen bg-gradient-to-br from-orange-50 via-orange-100/50 to-orange-50 relative">
          <MantineProvider>
            <Canvas 
              camera={{ position: [3, 1, 0], fov: 50 }} 
              shadows
            >
              <color attach="background" args={['#fff7ed']} />
              <Experience />
            </Canvas>
          </MantineProvider>
          
          {/* Info Card */}
          <div className="absolute bottom-8 left-8">
            <div className="bg-white rounded-xl p-4 shadow-lg transition-transform duration-300 hover:-translate-y-1">
              <p className="text-orange-600 font-medium">Meet Yucca</p>
              <p className="text-gray-500 text-sm mt-1">Your UC Guide</p>
            </div>
          </div>
        </div>

        {/* Chat Section */}
        <div className="h-screen overflow-hidden border-l border-orange-100">
          <Chatbot />
        </div>
      </div>
    </div>
  );
};

export default App;