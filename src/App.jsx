import { Canvas } from "@react-three/fiber";
import Experience from "./components/Experience";
import Interface from "./components/Interface";
import { MantineProvider } from "@mantine/core";
import Chatbot from "./components/Chatbot";
import React, { useState, useEffect } from "react";
import logo from "./assets/icons/yucca.png"; 
function App() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 3000); 

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-orange-50">
        <div className="text-center">
          <img src={logo} alt="Logo" className=" animate-spin mx-auto h-16 w-16 mb-4" />
          <p className="mt-4 text-orange-600 font-bold">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-orange-50 flex flex-col md:flex-row h-screen">
      <MantineProvider>
        <Canvas camera={{ position: [3, 1, 0], fov: 50 }} shadows>
          <Experience />
        </Canvas>
      </MantineProvider>
      <Chatbot />
    </div>
  );
}

export default App;
