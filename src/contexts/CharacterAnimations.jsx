import { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";

const CharacterAnimationsContext = createContext({});

// Konfigurasi waktu untuk animasi mendengar
const LISTENING_CONFIG = {
  START_DURATION: 3000,    // Durasi MendengarR awal (ms)
  END_DURATION: 3000,      // Durasi MendengarR akhir (ms)
  LOOP_DURATION: 3000      // Durasi satu cycle loop animation (ms)
};

const SPEAK_WAIT_AUDIO = [
  '../../sounds/Yucca1.mp3',
  '../../sounds/Yucca2.mp3',
  '../../sounds/Yucca3.mp3',
  '../../sounds/Yucca4.mp3',
  '../../sounds/Yucca5.mp3',
  '../../sounds/Yucca6.mp3',
  '../../sounds/Yucca7.mp3',
  '../../sounds/Yucca8.mp3',
  '../../sounds/Yucca9.mp3',
  '../../sounds/Yucca10.mp3',
  '../../sounds/Yucca11.mp3',
  '../../sounds/Yucca12.mp3',
  '../../sounds/Yucca13.mp3',
  '../../sounds/Yucca14.mp3',
  '../../sounds/Yucca15.mp3',
  '../../sounds/Yucca16.mp3',
  '../../sounds/Yucca17.mp3',
];

const ANIMATION_DURATIONS = {
  ENTRANCE: 3000,
  IDLE_INTERVAL: 3000,
  TRANSITION: 500
};

export const CharacterAnimationsProvider = (props) => {
  const [animationIndex, setAnimationIndex] = useState(0);
  const [animations, setAnimations] = useState([]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [CIsListening, setCIsListening] = useState(false);
  const [isDoneThinking, setIsDoneThinking] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isEndingSequence, setIsEndingSequence] = useState(false);
  const timeoutRef = useRef(null);
  const idleIntervalRef = useRef(null);
  const lastIndexesRef = useRef([]);
  const listeningSequenceRef = useRef(null);
  const [isEndingListening, setIsEndingListening] = useState(false);
  let currentAudio = null;

  const entranceTimeoutRef = useRef(null);
  const initialAnimationPlayed = useRef(false);
  const [hasPlayedEntrance, setHasPlayedEntrance] = useState(false);
  const [isFirstLoad, setIsFirstLoad] = useState(true);

  const idleAnimations = [3, 4, 9];
  const thinkingAnimations = [
    { index: 1, audio: '../../sounds/uhuk2.mp3' },
    { index: 7, audio: '../../sounds/hemm2.mp3' },
    { index: 8, audio: '../../sounds/hoo2.mp3' },
  ];
  const speakWait = [12, 13];


  // const cancelScheduledAnimation = () => {
  //   [timeoutRef, idleIntervalRef, listeningSequenceRef].forEach(ref => {
  //     if (ref.current) {
  //       clearTimeout(ref.current);
  //       clearInterval(ref.current);
  //       ref.current = null;
  //     }
  //   });
  // };

  // useEffect(() => {
  //   if (!initialAnimationPlayed.current) {
  //     initialAnimationPlayed.current = true;
  //     setAnimationIndex(0); // Set to entrance animation

  //     // Schedule transition to idle after entrance animation
  //     entranceTimeoutRef.current = setTimeout(() => {
  //       setAnimationIndex(3); // Switch to idle after entrance
  //       startIdleAnimations(); // Start idle animation cycle
  //     }, 3000); // Adjust timing based on entrance animation duration

  //     return () => {
  //       if (entranceTimeoutRef.current) {
  //         clearTimeout(entranceTimeoutRef.current);
  //       }
  //     };
  //   }
  // }, []);


  const startEntranceSequence = () => {
    // Cancel any existing animations
    cancelScheduledAnimation();
    
    // Set to entrance animation (index 0)
    setAnimationIndex(0);
    
    // Play entrance audio
    const entranceAudio = new Audio('/audio/entrance.mp3');
    entranceAudio.play().catch(error => {
      console.log('Failed to play entrance audio:', error);
    });
    
    // First timeout: Wait for entrance animation to complete
    entranceTimeoutRef.current = setTimeout(() => {
      // Set transition state
      setAnimationIndex(0); // Keep entrance animation during transition
      
      // Second timeout: Transition to idle
      setTimeout(() => {
        setHasPlayedEntrance(true);
        setAnimationIndex(3); // Switch to idle
        startIdleAnimations(); // Start idle cycle
      }, ANIMATION_DURATIONS.ENTRANCE_TO_IDLE);
      
    }, ANIMATION_DURATIONS.ENTRANCE);
  };

  const startListeningSequence = () => {
    setAnimationIndex(6); // Start MendengarR
    console.log('Starting MendengarR sequence');

    listeningSequenceRef.current = setTimeout(() => {
      if (CIsListening) { // Check if still listening
        setAnimationIndex(16); // Switch to loop
        console.log('Switching to MendengarLoop');
      }
    }, LISTENING_CONFIG.START_DURATION);
  };

  // Di CharacterAnimationsContext:

  const endListeningSequence = () => {
    // Hanya set flag dan animationIndex
    setAnimationIndex(6);
    // Schedule return to idle
    listeningSequenceRef.current = setTimeout(() => {
      setIsEndingListening(false);
      setCIsListening(false);
      setAnimationIndex(3);  // Return to idle
      startIdleAnimations();
    }, LISTENING_CONFIG.END_DURATION); // Gunakan waktu tetap untuk transisi
  };

  useEffect(() => {
    if (CIsListening) {
      stopIdleAnimations();
      if (!isEndingListening) {
        startListeningSequence();
      }
    }
  }, [CIsListening, isEndingListening]);

  const startThinkingAnimations = async () => {
    // Clear any existing interval and audio
    cancelScheduledAnimation();
    stopCurrentAudio();

    // Randomly select animation and audio
    const selectedSpeakWait = speakWait[Math.floor(Math.random() * speakWait.length)];
    const selectedAudio = SPEAK_WAIT_AUDIO[Math.floor(Math.random() * SPEAK_WAIT_AUDIO.length)];

    setAnimationIndex(selectedSpeakWait);

    // Tambahkan delay untuk memulai suara setelah animasi
    const audioDelay = 300; // Delay dalam milidetik (1 detik)
    await new Promise((resolve) => setTimeout(resolve, audioDelay));
    // Create and setup audio
    const audio = new Audio(selectedAudio);
    currentAudioRef.current = audio;

    // Promise that resolves when audio ends
    const audioPromise = new Promise((resolve) => {
      audio.addEventListener('ended', resolve);
    });

    audio.play().catch(console.error);

    try {
      // Wait for audio to complete
      await audioPromise;

      idleIntervalRef.current = setInterval(() => {

        if (isLoading || isSpeaking || isEndingSequence || isDoneThinking ) {
          stopCurrentAudio();
          return;
        }
        // Pilih animasi berikutnya secara acak
        const nextAnimation = thinkingAnimations[Math.floor(Math.random() * thinkingAnimations.length)];

        // Hentikan audio sebelumnya jika ada
        if (currentAudio) {
          currentAudio.pause();
          currentAudio.currentTime = 0; // Reset audio ke awal
        }

        // Set animasi berdasarkan indeks
        setAnimationIndex(nextAnimation.index);

        // Mainkan audio yang sesuai dengan animasi
        currentAudio = new Audio(nextAnimation.audio);
        currentAudio.volume = 0.2;
        currentAudio.play().catch((error) => {
          console.error(`Error playing audio for animation ${nextAnimation.index}:`, error);
        });
      }, 3000 + Math.random() * 1000);
    } catch (error) {
      console.error('Error during animation sequence:', error);
    }
  };

  let currentAudioRef = useRef(null);

  const stopCurrentAudio = () => {
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
      currentAudio = null;
    }
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current.currentTime = 0;
      currentAudioRef.current = null;
    }
  };
  

  // Add cleanup to useEffect
  useEffect(() => {
    return () => {
      stopCurrentAudio();
      cancelScheduledAnimation();
    };
  }, []);

  // Modify cancelScheduledAnimation to include audio cleanup
  const cancelScheduledAnimation = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (idleIntervalRef.current) {
      clearInterval(idleIntervalRef.current);
      idleIntervalRef.current = null;
    }
    stopCurrentAudio();
  };

  // Optional: Add preloading for audio files
  useEffect(() => {
    SPEAK_WAIT_AUDIO.forEach(audioSrc => {
      const audio = new Audio();
      audio.preload = 'auto';
      audio.src = audioSrc;
    });
  }, []);

  const startIdleAnimations = () => {
    if (!hasPlayedEntrance) return;
    
    cancelScheduledAnimation();

    // Add initial delay before starting idle animations
    setTimeout(() => {
      idleIntervalRef.current = setInterval(() => {
        if (!CIsListening && !isEndingSequence && !isSpeaking && !isLoading) {
          const availableAnimations = idleAnimations.filter(
            index => index !== animationIndex && !lastIndexesRef.current.includes(index)
          );

          let nextIndex;
          if (availableAnimations.length === 0) {
            lastIndexesRef.current = [animationIndex];
            nextIndex = idleAnimations.find(index => index !== animationIndex);
          } else {
            nextIndex = availableAnimations[Math.floor(Math.random() * availableAnimations.length)];
          }

          // Add fade transition between idle animations
          const currentIndex = animationIndex;
          setTimeout(() => {
            if (currentIndex === animationIndex) { // Only update if no other animation has taken over
              setAnimationIndex(nextIndex);
              lastIndexesRef.current.push(nextIndex);
              if (lastIndexesRef.current.length > 2) {
                lastIndexesRef.current.shift();
              }
            }
          }, ANIMATION_DURATIONS.TRANSITION);

        }
      }, ANIMATION_DURATIONS.IDLE_INTERVAL);
    }, ANIMATION_DURATIONS.TRANSITION);
  };

  const stopIdleAnimations = () => {
    cancelScheduledAnimation();
  };

  useEffect(() => {
    if (!hasPlayedEntrance) {
      startEntranceSequence();
    }
    
    return () => {
      cancelScheduledAnimation();
    };
  }, []);

  useEffect(() => {
    if (isSpeaking || CIsListening || isLoading || isProcessing) {
      cancelScheduledAnimation();
    } else if (hasPlayedEntrance) {
      startIdleAnimations();
    }
  }, [isSpeaking, CIsListening, isLoading, isProcessing, hasPlayedEntrance]);

  // Schedule next animation if in idle state
  const scheduleNextAnimation = useCallback((currentAnimationDuration = 3000) => {
    if (!isSpeaking && !CIsListening && !isLoading) {
      const availableAnimations = idleAnimations.filter(
        index => index !== animationIndex && !lastIndexesRef.current.includes(index)
      );

      let nextIndex;
      if (availableAnimations.length === 0) {
        lastIndexesRef.current = [animationIndex];
        nextIndex = idleAnimations.find(index => index !== animationIndex);
      } else {
        nextIndex = availableAnimations[Math.floor(Math.random() * availableAnimations.length)];
      }

      cancelScheduledAnimation();

      timeoutRef.current = setTimeout(() => {
        if (!isSpeaking && !CIsListening && !isLoading) {
          setAnimationIndex(nextIndex);
          lastIndexesRef.current.push(nextIndex);
          if (lastIndexesRef.current.length > 2) {
            lastIndexesRef.current.shift();
          }
        }
      }, currentAnimationDuration);
    }
  }, [isSpeaking, CIsListening, isLoading, animationIndex]);

  // Handle speaking state
  useEffect(() => {
    if (isSpeaking) {
      stopCurrentAudio();
      stopIdleAnimations();
      setAnimationIndex(15);
      lastIndexesRef.current = [];
    } else if (!CIsListening && !isLoading && initialAnimationPlayed.current) {
      setAnimationIndex(3);
      startIdleAnimations();
    }
  }, [isSpeaking]);

  useEffect(() => {
    if (isDoneThinking) {
      stopCurrentAudio();
      stopIdleAnimations();
      cancelScheduledAnimation();
      playWithAnimation(5, '../../sounds/aha4.mp3', () => {
        console.log('Animation 5 completed');
      });
    } else if (!isSpeaking && !CIsListening && !isLoading) {
      setAnimationIndex(3); // Return to default idle
      startIdleAnimations();
    }
  }, [isDoneThinking]);

  const playWithAnimation = async (animationIndex, audioFile, callback) => {
    const audio = new Audio(audioFile);
    try {
      await audio.play();
    } catch (error) {
      console.error('Error playing audio:', error);
    }
    setAnimationIndex(animationIndex);


    await new Promise((resolve) => setTimeout(resolve, 3000));


    if (callback) callback();

    setIsDoneThinking(false);
  };




  useEffect(() => {
    if (isLoading) {
      stopIdleAnimations();
      setAnimationIndex(10);
      lastIndexesRef.current = [];
    } else if (!CIsListening && !isSpeaking && initialAnimationPlayed.current) {
      setAnimationIndex(3);
      startIdleAnimations();
    }
  }, [isLoading]);

  useEffect(() => {
    if (isProcessing) {
      startThinkingAnimations();
    } else if (!isSpeaking && !CIsListening && !isLoading && initialAnimationPlayed.current) {
      setAnimationIndex(3);
      startIdleAnimations();
    }
  }, [isProcessing, isSpeaking, CIsListening, isLoading]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cancelScheduledAnimation();
    };
  }, []);

  useEffect(() => {
    if (CIsListening) {
      stopIdleAnimations();
      if (!isEndingListening) {
        startListeningSequence();
      } else {
        endListeningSequence();
      }
    }
  }, [CIsListening, isEndingListening]);

  return (
    <CharacterAnimationsContext.Provider
      value={{
        animationIndex,
        setAnimationIndex,
        animations,
        setAnimations,
        isSpeaking,
        setIsSpeaking,
        CIsListening,
        setCIsListening,
        isLoading,
        setIsLoading,
        isEndingListening,
        setIsEndingListening,
        isProcessing,
        isDoneThinking,
        setIsDoneThinking,
        setIsProcessing,
        playWithAnimation,
        
        scheduleNextAnimation,
        hasPlayedEntrance, // Added to provider value
        startEntranceSequence 
      }}
    >
      {props.children}
    </CharacterAnimationsContext.Provider>
  );
};

export const useCharacterAnimations = () => {
  return useContext(CharacterAnimationsContext);
};