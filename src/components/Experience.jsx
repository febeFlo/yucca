import React, { useRef, useEffect } from 'react';
import { OrbitControls } from "@react-three/drei";
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

const Experience = () => {
    const { animationIndex, isListening } = useCharacterAnimations();
    const AnimationComponent = animationsMap[animationIndex];
    const lightRef = useRef();
    const hasPlayedEntranceRef = useRef(false);

    console.log('Current animation index:', animationIndex);
        
    useEffect(() => {
        if (!hasPlayedEntranceRef.current) {
            const entranceAudio = new Audio('../../public/audio/entrance.mp3');
            entranceAudio.play().catch(error => {
                console.error('Failed to play entrance audio:', error);
            });
            hasPlayedEntranceRef.current = true;
        }
    }, []);
    // Update light position based on time
    useEffect(() => {
        const updateLightPosition = () => {
            // Dapatkan waktu Jakarta (UTC+7)
            const jakartaTime = new Date(new Date().toLocaleString("en-US", {timeZone: "Asia/Jakarta"}));
            const hours = jakartaTime.getHours();
            const minutes = jakartaTime.getMinutes();
            
            // Untuk waktu yang lebih realistis:
            // - Jam 6 pagi: matahari dari timur (x positif)
            // - Jam 12 siang: matahari di atas (y maksimum)
            // - Jam 6 sore: matahari dari barat (x negatif)
            // Kita geser 6 jam (90 derajat) agar sesuai dengan waktu sebenarnya
            const timeAngle = (((hours - 6) * 60 + minutes) / (24 * 60)) * Math.PI * 2;
            
            // Kita gunakan fungsi cosinus untuk ketinggian matahari
            // yang maksimal di siang hari dan minimal di malam hari
            const height = Math.cos((hours - 12) / 12 * Math.PI) * 5 + 6;
            
            // Hitung posisi x dan z untuk menentukan arah bayangan
            const radius = 10; // Jarak horizontal dari pusat
            const x = Math.cos(timeAngle) * radius;
            const z = Math.sin(timeAngle) * radius;
            
            // Sesuaikan waktu matahari terbit (5:30) dan terbenam (17:30) untuk Jakarta
            const isSunrise = hours === 5 && minutes >= 30 || hours === 6 && minutes < 30;
            const isSunset = hours === 17 && minutes >= 30 || hours === 18 && minutes < 30;
            const isNight = hours >= 18 || hours < 5 || (hours === 5 && minutes < 30);
            
            // Sesuaikan y berdasarkan waktu
            let y = isNight ? 2 : Math.max(2, height);
            
            // Sesuaikan intensitas untuk sunrise dan sunset
            let intensity;
            if (isNight) {
                intensity = 0.3; // Malam hari
            } else if (isSunrise) {
                // Transisi halus saat matahari terbit
                const sunriseProgress = (hours === 5) ? 
                    (minutes - 30) / 60 : 
                    (minutes + 30) / 60;
                intensity = 0.3 + (0.9 * sunriseProgress);
                y = 2 + (4 * sunriseProgress);
            } else if (isSunset) {
                // Transisi halus saat matahari terbenam
                const sunsetProgress = (hours === 17) ? 
                    (minutes - 30) / 60 : 
                    (minutes + 30) / 60;
                intensity = 1.2 - (0.9 * sunsetProgress);
                y = 6 - (4 * sunsetProgress);
            } else {
                intensity = 1.2; // Siang hari
            }
            
            if (lightRef.current) {
                lightRef.current.position.set(x, y, z);
                lightRef.current.intensity = intensity;
                
                console.log(`Jakarta Time: ${hours}:${minutes.toString().padStart(2, '0')}`);
                console.log(`Light position:`, {x, y, z});
                console.log(`Light intensity:`, intensity);
            }
        };
    
        // Update setiap detik
        updateLightPosition();
        const interval = setInterval(updateLightPosition, 1000);
    
        return () => clearInterval(interval);
    }, []);

    return (
        <>
            <OrbitControls />
            
            <ambientLight intensity={0.7} />
            <directionalLight
                ref={lightRef}
                castShadow
                shadow-mapSize-width={2048}
                shadow-mapSize-height={2048}
                shadow-camera-left={-10}
                shadow-camera-right={10}
                shadow-camera-top={10}
                shadow-camera-bottom={-10}
                shadow-camera-near={0.1}
                shadow-camera-far={50}
                shadow-bias={-0.001}
                shadow-radius={1}
                color="#ffffff"
            />
            
            <hemisphereLight 
                intensity={0.3}
                groundColor="#b97a20"
                color="#fff"
            />

            <group position={[0, 0, 0]}>
                <group position={[-2, -1.5, 0]} rotation={[0, Math.PI / 2, 0]}>
                    {/* Render EITHER listening animation OR idle animations, never both */}
                    {isListening && <YuccaMendengarR />}
                    {!isListening && AnimationComponent && <AnimationComponent />}
                </group>
            </group>

            <mesh
                rotation={[-0.5 * Math.PI, 0, 0]}
                position={[0, -1.5, 0]}
                receiveShadow
            >
                <planeGeometry args={[20, 20]} />
                <shadowMaterial 
                    transparent 
                    opacity={0.3}
                    color="#000000"
                />
            </mesh>
        </>
    );
};

export default Experience;