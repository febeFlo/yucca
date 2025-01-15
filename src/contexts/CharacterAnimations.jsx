import { createContext, useContext, useState, useEffect, useCallback } from "react";

const CharacterAnimationsContext = createContext({});

export const CharacterAnimationsProvider = (props) => {
  const [animationIndex, setAnimationIndex] = useState(0); 
  const [animations, setAnimations] = useState([]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const idleAnimations = [3, 4, 9];

  const startRandomAnimations = useCallback(() => {
    if (!isSpeaking && !isListening && !isLoading) {
      const randomIndex = idleAnimations[Math.floor(Math.random() * idleAnimations.length)];
      setAnimationIndex(randomIndex);
    }
  }, [isSpeaking, isListening, isLoading]);

  useEffect(() => {
    let intervalId;
    
    if (!isSpeaking && !isListening && !isLoading) {
      startRandomAnimations();
      
      intervalId = setInterval(() => {
        startRandomAnimations();
      }, Math.random() * 2000 + 3000); 
    }
    
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [isSpeaking, isListening, isLoading, startRandomAnimations]);

  useEffect(() => {
    if (isSpeaking) {
      setAnimationIndex(11);
    }
  }, [isSpeaking]);

  useEffect(() => {
    if (isListening) {
      setAnimationIndex(6);
    }
  }, [isListening]);

  useEffect(() => {
    if (isLoading) {
      setAnimationIndex(7);
    }
  }, [isLoading]);

  return (
    <CharacterAnimationsContext.Provider
      value={{
        animationIndex,
        setAnimationIndex,
        animations,
        setAnimations,
        isSpeaking,
        setIsSpeaking,
        isListening,
        setIsListening,
        isLoading,
        setIsLoading,
      }}
    >
      {props.children}
    </CharacterAnimationsContext.Provider>
  );
};

export const useCharacterAnimations = () => {
  return useContext(CharacterAnimationsContext);
};
