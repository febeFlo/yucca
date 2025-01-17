import React, { useRef } from 'react';
import { useCharacterAnimations } from "../contexts/CharacterAnimations";
import Yucca_facerig_NgomongLoopVER1 from './Yucca_facerig_NgomongLoopVER1';
import Yucca_facerig_NgomongLoopVER2 from './Yucca_facerig_NgomongLoopVER2';
import YuccaBerpikirR from './YuccaBerpikirR';
import YuccaBerpikirRLoop from './YuccaBerpikirRLoop';
import YuccaEntrance from './YuccaEntrance';
import YuccaExit from './YuccaExit';
import YuccaIdleBiasa from './YuccaIdleBiasa';
import YuccaIdleLompat from './YuccaIdleLompat';
import YuccaMauMenjawab from './YuccaMauMenjawab';
import YuccaMendengarLoop from './YuccaMendengarLoop';
import YuccaMendengarR from './YuccaMendengarR';
import YuccaMikir1 from './YuccaMikir1';
import YuccaMikir2 from './YuccaMikir2';
import YuccaNgantuk from './YuccaNgantuk';
import YuccaNgomong from './YuccaNgomong';
import YuccaSedih from './YuccaSedih';
import YuccaSenang from './YuccaSenang';
import YuccaTungguSebentar_ver1 from './YuccaTungguSebentar_ver1';
import YuccaTungguSebentar_ver2 from './YuccaTungguSebentar_ver2';

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
    14: Yucca_facerig_NgomongLoopVER1,
    15: Yucca_facerig_NgomongLoopVER2,
    16: YuccaMendengarLoop,
    17: YuccaNgomong,
};

const ExperienceVirtualTour = () => {
    const { animationIndex, isListening } = useCharacterAnimations();
    const AnimationComponent = animationsMap[animationIndex];
    const lightRef = useRef();
    
    return (
        <>
            {/* Improved lighting for better visibility */}
            <ambientLight intensity={1} />
            <directionalLight
                ref={lightRef}
                position={[3, 3, 3]}
                intensity={1.2}
            />
            <pointLight position={[0, 2, 2]} intensity={0.5} />

            {/* Position Yucca at bottom */}
            <group 
                position={[0, -1.2, 0]} 
                scale={1.2} 
                rotation={[0, -Math.PI / 4, 0]}
            >
                {isListening && <YuccaMendengarR />}
                {!isListening && AnimationComponent && <AnimationComponent />}
            </group>
        </>
    );
};

export default ExperienceVirtualTour;