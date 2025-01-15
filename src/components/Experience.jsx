import { OrbitControls } from "@react-three/drei";
import Yucca from "./Yucca";
import YuccaEnterance from "./YuccaEnterance";
import YuccaMendengar from "./YuccaMendengar";
import YuccaBerpikir from "./YuccaBerpikir";
import YuccaBerbicara from "./YuccaBerbicara";
import Yucca_idleblend5 from "./Yucca_idleblend5";
import YuccaIdleLompat from "./YuccaIdleLompat";

const Experience = () => {
    return (
        <>
        <OrbitControls />
        <ambientLight />
        <directionalLight 
            position={[-5, 5, 5]} 
            castShadow 
            shadow-mapSize-width={1024}
            shadow-mapSize-height={1024}
        />
        <group position={[0, 0, 0]}>
            <group position={[-2, -1.5, 0]} rotation={[0, Math.PI / 2, 0]}> 
                {/* Ini yang diganti */}
                <YuccaIdleLompat /> 
            </group>
        </group>
        <mesh 
            rotation={[-0.5 * Math.PI, 0, 0]} 
            position={[0, 0, 0]} 
            receiveShadow
        >
            <planeGeometry args={[10, 10, 1, 1]} />
            <shadowMaterial transparent opacity={0.2} />
        </mesh>
        </>
    );
};

export default Experience;