import { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";

const CharacterAnimationsContext = createContext({});

export const CharacterAnimationsProvider = (props) => {
  const [animationIndex, setAnimationIndex] = useState(3);
  const [animations, setAnimations] = useState([]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [CIsListening, setCIsListening] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const timeoutRef = useRef(null);
  const idleIntervalRef = useRef(null);
  const lastIndexesRef = useRef([]);
  
  const idleAnimations = [3, 4, 9];
  const thinkingAnimations = [1, 7, 8];

  // Cancel any scheduled animation
  const cancelScheduledAnimation = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null; 
    }
    if (idleIntervalRef.current) {
      clearInterval(idleIntervalRef.current);
      idleIntervalRef.current = null;
    }
  };

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
    // Clear any existing interval
    if (idleIntervalRef.current) {
      clearInterval(idleIntervalRef.current);
    }

    // Start new interval for idle animations
    idleIntervalRef.current = setInterval(() => {
      const availableAnimations = idleAnimations.filter(
        index => index !== animationIndex && !lastIndexesRef.current.includes(index)
      );
      
      let nextIndex;
      if (availableAnimations.length === 0) {
        // Reset history if all animations have been used
        lastIndexesRef.current = [animationIndex];
        nextIndex = idleAnimations.find(index => index !== animationIndex);
      } else {
        nextIndex = availableAnimations[Math.floor(Math.random() * availableAnimations.length)];
      }

      // Update history
      lastIndexesRef.current.push(nextIndex);
      if (lastIndexesRef.current.length > 2) {
        lastIndexesRef.current.shift();
      }

      setAnimationIndex(nextIndex);
    }, 3000);
  };

  const stopIdleAnimations = () => {
    cancelScheduledAnimation();
  };

  // Only schedule next animation if in idle state
  const scheduleNextAnimation = useCallback((currentAnimationDuration = 3000) => {
    // Only schedule if not in any special state
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
        // Double check state before changing animation
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

  // Handle listening state
  useEffect(() => {
    if (CIsListening) {
      stopIdleAnimations();
      setAnimationIndex(6); // Set to listening animation
      lastIndexesRef.current = [];
    } else if (!isSpeaking && !isLoading) {
      // Only return to idle if no other state is active
      setAnimationIndex(3); // Return to default idle
      startIdleAnimations();
    }
  }, [CIsListening, isSpeaking, isLoading]);

  // Handle speaking state
  useEffect(() => {
    if (isSpeaking) {
      stopIdleAnimations();
      setAnimationIndex(15);
      lastIndexesRef.current = [];
    } else if (!CIsListening && !isLoading) {
      // Only return to idle if no other state is active
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
      // Only return to idle if no other state is active
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