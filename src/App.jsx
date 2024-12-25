import { Canvas } from "@react-three/fiber"
import Experience from "./components/Experience"
import Interface from "./components/Interface";
import { MantineProvider } from '@mantine/core';

function App() {
  return (
    <>
    <MantineProvider>
      <Canvas camera={{ position: [6, 1, 0], fov: 50 }} shadows>
        <Experience />
      </Canvas>
      <Interface />
    </MantineProvider>
    </>
  )
}

export default App;
