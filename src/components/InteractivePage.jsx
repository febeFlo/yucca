import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Canvas } from "@react-three/fiber";
import Experience from './Experience';
import { MantineProvider } from "@mantine/core";
import { useCharacterAnimations } from '../contexts/CharacterAnimations';


export const InteractivePage = ({ isDarkMode }) => {
  const [isListening, setIsListening] = useState(false);
  const [inputText, setInputText] = useState("");
  const [responses, setResponses] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [audioElement, setAudioElement] = useState(null);
  const { setIsSpeaking } = useCharacterAnimations();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const { setAnimationIndex } = useCharacterAnimations();
  const { setCIsListening, setIsProcessing, setIsEndingListening, setIsDoneThinking, playWithAnimation } = useCharacterAnimations();


  const recognition = useMemo(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recog = new SpeechRecognition();
      recog.lang = "id-ID";
      recog.continuous = false; // Ubah ke false agar berhenti setelah jeda
      recog.interimResults = false;
      return recog;
    }
    return null;
  }, []);

  useEffect(() => {
    if (recognition) {
      recognition.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map((result) => result[0].transcript)
          .join("");
        // Langsung handle send saat mendapat hasil
        handleSend(transcript);
      };
  
      recognition.onend = () => {
        setIsListening(false);
        setCIsListening(false);
      };
  
      recognition.onerror = (error) => {
        console.error('Speech Recognition error:', error);
        setErrorMessage('Speech recognition failed.');
        setIsListening(false);
        setCIsListening(false);
      };
    }
  }, [recognition]);

  const handleMicToggle = () => {
    if (recognition) {
      if (isListening) {
        recognition.stop();
        setIsListening(false);
        setCIsListening(false);
        setIsEndingListening(true);
      } else {
        recognition.start();
        setIsListening(true);
        setCIsListening(true);
        setErrorMessage("");
      }
    } else {
      setErrorMessage("Pengenalan suara tidak didukung di browser Anda.");
    }
  };

  const playAudio = (base64Audio) => {
    if (audioElement) {
      audioElement.pause();
      audioElement.currentTime = 0;
    }

    const audio = new Audio(`data:audio/mp3;base64,${base64Audio}`);
    setAudioElement(audio);
    setIsSpeaking(true);

    audio.play().catch(error => {
      console.error('Error playing audio:', error);
      setErrorMessage('Failed to play audio response');
      setIsSpeaking(false);
    });

    audio.addEventListener('ended', () => {
      setIsSpeaking(false);
    });
  };

  const handleSend = async (textOverride) => {
    const messageText = textOverride;
    if (!messageText.trim()) {
      setErrorMessage("Input cannot be empty!");
      return;
    }
  
    setErrorMessage("");
    setIsLoading(true);
    setIsProcessing(true);
  
    try {
      const response = await fetch("http://localhost:3000/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: messageText }),
      });
  
      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }
  
      const data = await response.json();
  
      if (!data.response || !data.response.text || !data.response.voice) {
        throw new Error("Invalid response format from server");
      }
  
      setIsProcessing(false);
      setIsDoneThinking(true);
      await new Promise((resolve) => setTimeout(resolve, 3000)); // Adjust duration if necessary

      playAudio(data.response.voice);
      if (!textOverride) {
        setInputText("");
      }
    } catch (error) {
      setErrorMessage(`Failed to send request: ${error.message}`);
    } finally {
      setIsLoading(false);
      setIsProcessing(false);
    }
  };

  return (
    <div className="h-screen bg-orange-50 dark:bg-gray-900 transition-colors relative">
      {/* 3D Model */}
      <div className="h-screen relative">
        <div className={`absolute inset-0 ${
          isDarkMode 
            ? 'bg-gradient-to-br from-gray-900 via-gray-800/50 to-gray-900' 
            : 'bg-gradient-to-br from-orange-50 via-orange-100/50 to-orange-50'
        } transition-colors`}>
          <MantineProvider>
            <Canvas 
              camera={{ position: [3, 0, 0], fov: 50 }} 
              shadows
            >
              <color attach="background" args={[isDarkMode ? '#1a1b1e' : '#fff7ed']} />
              <Experience />
            </Canvas>
          </MantineProvider>
        </div>
      </div>

      {/* Voice Button */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
        <button
          onClick={handleMicToggle}
          className={`py-4 px-6 rounded-full font-medium text-lg flex items-center justify-center gap-3 shadow-lg transition-all ${
            isListening
              ? "bg-orange-100 dark:bg-orange-900/50 text-orange-600 dark:text-orange-400 border-2 border-orange-400 dark:border-orange-500"
              : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-orange-50 dark:hover:bg-gray-700"
          }`}
        >
          {isListening ? (
            <>
              <span className="w-3 h-3 bg-orange-500 dark:bg-orange-400 rounded-full animate-pulse"></span>
              <span>Recording...</span>
            </>
          ) : (
            <>
              <span className="text-2xl">🎤</span>
              <span>Start Speaking</span>
            </>
          )}
        </button>
      </div>

      {/* Back Button */}
      <Link 
        to="/"
        className="absolute top-4 left-4 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-3 shadow-lg transition-all duration-300 hover:-translate-y-1 text-gray-600 dark:text-gray-300"
      >
        ← Back
      </Link>

      {errorMessage && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-400 px-4 py-2 rounded-lg">
          {errorMessage}
        </div>
      )}

    </div>
  );
};