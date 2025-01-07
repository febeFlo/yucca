import { createContext, useContext, useState, useEffect, useCallback } from "react";

const CharacterAnimationsContext = createContext({});

export const CharacterAnimationsProvider = (props) => {
  const [animationIndex, setAnimationIndex] = useState(5); 
  const [animations, setAnimations] = useState([]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  
  const idleAnimations = [4, 5];
  
  const startRandomAnimations = useCallback(() => {
    if (!isSpeaking) {
      const randomIndex = idleAnimations[Math.floor(Math.random() * idleAnimations.length)];
      setAnimationIndex(randomIndex);
    }
  }, [isSpeaking]);

  useEffect(() => {
    let intervalId;
    
    if (!isSpeaking) {
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
  }, [isSpeaking, startRandomAnimations]);


  useEffect(() => {
    if (isSpeaking) {
      setAnimationIndex(1); 
    }
  }, [isSpeaking]);

  return (
    <CharacterAnimationsContext.Provider
      value={{
        animationIndex,
        setAnimationIndex,
        animations,
        setAnimations,
        isSpeaking,
        setIsSpeaking,
      }}
    >
      {props.children}
    </CharacterAnimationsContext.Provider>
  );
};

export const useCharacterAnimations = () => {
  return useContext(CharacterAnimationsContext);
};