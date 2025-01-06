import { Canvas } from "@react-three/fiber";
import Experience from "./components/Experience";
import Interface from "./components/Interface";
import { MantineProvider } from "@mantine/core";
import Chatbot from "./components/Chatbot";

function App() {
  return (
    <div className="flex h-screen items-center">
      {/* Left Section: 3D Model */}
      <div className="bg-gray-100 h-screen w-1/2 items-right">
        <MantineProvider>
          <Interface />
          <Canvas camera={{ position: [5, 1, 5], fov: 50 }} shadows>
            <Experience />
          </Canvas>
        </MantineProvider>
      </div>

      {/* Right Section: Chatbot */}
      <div className="w-1/2 bg-white p-4 overflow-auto">
        <Chatbot />
      </div>
    </div>
  );
}

export default App;
