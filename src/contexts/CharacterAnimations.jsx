import { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";

const CharacterAnimationsContext = createContext({});

// Konfigurasi waktu untuk animasi mendengar
const LISTENING_CONFIG = {
  START_DURATION: 3000,    // Durasi MendengarR awal (ms)
  END_DURATION: 3000,      // Durasi MendengarR akhir (ms)
  LOOP_DURATION: 3000      // Durasi satu cycle loop animation (ms)
};

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
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isEndingSequence, setIsEndingSequence] = useState(false);
  const timeoutRef = useRef(null);
  const idleIntervalRef = useRef(null);
  const lastIndexesRef = useRef([]);
  const listeningSequenceRef = useRef(null);
  const [isEndingListening, setIsEndingListening] = useState(false);
  const entranceTimeoutRef = useRef(null);
  const initialAnimationPlayed = useRef(false);
  const [hasPlayedEntrance, setHasPlayedEntrance] = useState(false);
  const [isFirstLoad, setIsFirstLoad] = useState(true);

  const idleAnimations = [3, 4, 9];
  const thinkingAnimations = [1, 7, 8];

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

  const cancelScheduledAnimation = () => {
    [timeoutRef, idleIntervalRef, listeningSequenceRef, entranceTimeoutRef].forEach(ref => {
      if (ref.current) {
        clearTimeout(ref.current);
        clearInterval(ref.current);
        ref.current = null;
      }
    });
  };

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

  const startThinkingAnimations = () => {
    // Clear any existing interval
    cancelScheduledAnimation();

    // Randomly select from thinking animations every 2-3 seconds
    idleIntervalRef.current = setInterval(() => {
      const nextIndex = thinkingAnimations[Math.floor(Math.random() * thinkingAnimations.length)];
      setAnimationIndex(nextIndex);
    }, 2000 + Math.random() * 1000);
  };

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
      stopIdleAnimations();
      setAnimationIndex(15);
      lastIndexesRef.current = [];
    } else if (!CIsListening && !isLoading && initialAnimationPlayed.current) {
      setAnimationIndex(3);
      startIdleAnimations();
    }
  }, [isSpeaking]);

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
        setIsProcessing,
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