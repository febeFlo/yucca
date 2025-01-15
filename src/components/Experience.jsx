import { OrbitControls } from "@react-three/drei";
import { useCharacterAnimations } from "../contexts/CharacterAnimations";
import YuccaBerpikirR from "./YuccaBerpikirR";
import YuccaEntrance from "./YuccaEntrance";
import YuccaExit from "./YuccaExit";
import YuccaIdleBiasa from "./YuccaIdleBiasa";
import YuccaIdleLompat from "./YuccaIdleLompat";
import YuccaMauMenjawab from "./YuccaMauMenjawab";
import YuccaMendengarR from "./YuccaMendengarR";
import YuccaMikir1 from "./YuccaMikir1";
import YuccaMikir2 from "./YuccaMikir2";
import YuccaNgantuk from "./YuccaNgantuk";
import YuccaSedih from "./YuccaSedih";
import YuccaSenang from "./YuccaSenang";
import YuccaTungguSebentar_ver1 from "./YuccaTungguSebentar_ver1";
import YuccaTungguSebentar_ver2 from "./YuccaTungguSebentar_ver2";

const animationsMap = {
    0: YuccaEntrance,
    1: YuccaBerpikirR,
    2: YuccaExit,
    3: YuccaIdleBiasa,
    4: YuccaIdleLompat,
    5: YuccaMauMenjawab,
    6: YuccaMendengarR,
    7: YuccaMikir1,
    8: YuccaMikir2,
    9: YuccaNgantuk,
    10: YuccaSedih,
    11: YuccaSenang,
    12: YuccaTungguSebentar_ver1,
    13: YuccaTungguSebentar_ver2,
};

const Experience = () => {

    const { animationIndex } = useCharacterAnimations();
    const AnimationComponent = animationsMap[animationIndex];

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
                    {AnimationComponent && <AnimationComponent />}
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