import { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";

const CharacterAnimationsContext = createContext({});

// Konfigurasi waktu untuk animasi mendengar
const LISTENING_CONFIG = {
  START_DURATION: 3000,    // Durasi MendengarR awal (ms)
  END_DURATION: 3000,      // Durasi MendengarR akhir (ms)
  LOOP_DURATION: 3000      // Durasi satu cycle loop animation (ms)
};

export const CharacterAnimationsProvider = (props) => {
  const [animationIndex, setAnimationIndex] = useState(3);
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

  const idleAnimations = [3, 4, 9];
  const thinkingAnimations = [1, 7, 8];

  const cancelScheduledAnimation = () => {
    [timeoutRef, idleIntervalRef, listeningSequenceRef].forEach(ref => {
      if (ref.current) {
        clearTimeout(ref.current);
        clearInterval(ref.current);
        ref.current = null;
      }
    });
  };

  const startListeningSequence = () => {
    setAnimationIndex(6); // Start MendengarR
    console.log('Starting MendengarR sequence');

    listeningSequenceRef.current = setTimeout(() => {
      if (CIsListening) { // Check if still listening
        setAnimationIndex(14); // Switch to loop
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
    if (idleIntervalRef.current) {
      clearInterval(idleIntervalRef.current);
    }

    idleIntervalRef.current = setInterval(() => {
      if (!CIsListening && !isEndingSequence) {
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

        lastIndexesRef.current.push(nextIndex);
        if (lastIndexesRef.current.length > 2) {
          lastIndexesRef.current.shift();
        }

        setAnimationIndex(nextIndex);
      }
    }, 3000);
  };

  const stopIdleAnimations = () => {
    cancelScheduledAnimation();
  };

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
    } else if (!CIsListening && !isLoading) {
      setAnimationIndex(3);
      startIdleAnimations();
    }
  }, [isSpeaking]);

  // Handle loading state
  useEffect(() => {
    if (isLoading) {
      stopIdleAnimations();
      setAnimationIndex(10);
      lastIndexesRef.current = [];
    } else if (!CIsListening && !isSpeaking) {
      setAnimationIndex(3);
      startIdleAnimations();
    }
  }, [isLoading]);

  useEffect(() => {
    if (isProcessing) {
      startThinkingAnimations();
    } else if (!isSpeaking && !CIsListening && !isLoading) {
      setAnimationIndex(3); // Return to default idle
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
        scheduleNextAnimation
      }}
    >
      {props.children}
    </CharacterAnimationsContext.Provider>
  );
};

export const useCharacterAnimations = () => {
  return useContext(CharacterAnimationsContext);
};