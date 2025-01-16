import React, { useState, useEffect, useMemo } from "react";
import { useCharacterAnimations } from '../contexts/CharacterAnimations';
import ReactMarkdown from 'react-markdown';
import { Maximize2, Minimize2 } from 'lucide-react';

const Chatbot = ({ isDarkMode, toggleTheme }) => {
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


  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768); // 768px is typical md breakpoint
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const toggleFullscreen = () => {
    if (isMobile) {
      setIsFullscreen(!isFullscreen);
    }
  };

  const recognition = useMemo(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recog = new SpeechRecognition();
      recog.lang = "id-ID";
      recog.continuous = false; 

      recog.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map((result) => result[0].transcript)
          .join("");
        setInputText(transcript);
      };

      recog.onend = () => {
        setIsListening(false); 
      };

      recog.onerror = (error) => {
        console.error('Speech Recognition error:', error);
        setErrorMessage('Speech recognition failed.');
        setIsListening(false);
      };

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
        setInputText(transcript);
      };

      recognition.onend = () => {
        if (isListening) recognition.start();
      };
    }
  }, [recognition, isListening]);

  const handleMicToggle = () => {
    if (recognition) {
      if (isListening) {
        recognition.stop();
        setIsListening(false);
        if (inputText.trim()) {
          handleSend(inputText);
          setInputText("");
        }
      } else {
        recognition.start();
        setIsListening(true);
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

  const handleShortcut = (text) => {
    handleSend(text);
  };

  const handleSend = async (textOverride) => {
    const messageText = textOverride || inputText;
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
  
      setIsDoneThinking(true);
      await new Promise((resolve) => setTimeout(resolve, 3000)); // Adjust duration if necessary

      setResponses((prev) => [
        ...prev,
        {
          input: messageText,
          reply: data.response.text.formatted,
          voice: data.response.voice,
          timestamp: new Date().toLocaleString(),
        },
      ]);
  
      // Play audio after animation and response update
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
  

  const handleReset = () => {
    setResponses([]);
    if (audioElement) {
      audioElement.pause();
      audioElement.currentTime = 0;
    }
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text)
      .then(() => alert("Response copied to clipboard!"))
      .catch(() => alert("Failed to copy response."));
  };

  const replayVoice = (voiceData) => {
    playAudio(voiceData);
  };

  const handleStopVoice = () => {
    if (audioElement) {
      audioElement.pause();
      audioElement.currentTime = 0;
    }
    setAudioElement(null);
    setIsSpeaking(false);
  };

  return (
    <div className={`${isMobile && isFullscreen ? 'fixed inset-0 z-50' : 'h-full'
      } flex flex-col bg-white dark:bg-gray-900 transition-colors`}>
      {/* Header */}
      <div className="px-4 sm:px-6 py-4 bg-orange-50 dark:bg-gray-800 border-b border-orange-100 dark:border-gray-700">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-orange-500 dark:bg-orange-600 rounded-xl p-3 text-white shadow-sm">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-full w-full" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white">Chat dengan Yucca</h1>
              <p className="text-orange-600 dark:text-orange-400">Asisten UC yang ramah</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {/* Only show fullscreen toggle on mobile */}
            {isMobile && (
              <button
                onClick={toggleFullscreen}
                className="flex-1 sm:flex-none py-2 px-3 rounded-xl bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-medium text-sm flex items-center justify-center gap-2 transition-colors"
              >
                {isFullscreen ? (
                  <>
                    <Minimize2 className="w-4 h-4" />
                    <span className="sr-only">Exit Fullscreen</span>
                  </>
                ) : (
                  <>
                    <Maximize2 className="w-4 h-4" />
                    <span className="sr-only">Fullscreen</span>
                  </>
                )}
              </button>
            )}

            <button
              onClick={toggleTheme}
              className="flex-1 sm:flex-none py-2 px-3 sm:px-4 rounded-xl bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-medium text-sm flex items-center justify-center gap-2 transition-colors"
            >
              <span className="text-lg">{isDarkMode ? '🌞' : '🌙'}</span>
              <span className="hidden sm:inline">{isDarkMode ? 'Light Mode' : 'Dark Mode'}</span>
            </button>

            <button
              onClick={handleStopVoice}
              className="flex-1 sm:flex-none py-2 px-3 sm:px-4 rounded-xl bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-medium text-sm flex items-center justify-center gap-2 transition-colors"
            >
              <span className="text-lg">🔇</span>
              <span className="hidden sm:inline">Stop Suara</span>
            </button>

            <button
              onClick={handleReset}
              className="flex-1 sm:flex-none py-2 px-3 sm:px-4 rounded-xl bg-red-50 dark:bg-red-900/30 hover:bg-red-100 dark:hover:bg-red-900/50 text-red-600 dark:text-red-400 font-medium text-sm flex items-center justify-center gap-2 transition-colors"
            >
              <span className="text-lg">🗑️</span>
              <span className="hidden sm:inline">Reset Chat</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content - Scrollable */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4">
        {responses.length === 0 ? (
          <div className="h-full">
            <div className="w-full py-4">
              {/* Welcome content remains the same */}
              <div className="text-center space-y-3 w-full">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white">Selamat datang di UC!</h2>
                <p className="text-gray-600 dark:text-gray-300">
                  Hai! Saya di sini untuk membantu Anda mempelajari tentang Universitas Ciputra.</p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 mt-6">
                <QuickActionButton
                  onClick={() => handleShortcut("Bagaimana proses pendaftaran UC?")}
                  disabled={isLoading}
                  icon="📝"
                  title="Panduan Pendaftaran"
                  description="Pelajari tentang langkah-langkah pendaftaran"
                />
                <QuickActionButton
                  onClick={() => handleShortcut("Beasiswa yang ada di UC ada apa saja?")}
                  disabled={isLoading}
                  icon="🎓"
                  title="Info Beasiswa"
                  description="Jelajahi dukungan biaya kuliah"
                />
                <QuickActionButton
                  onClick={() => handleShortcut("Bagaimana Academic Guideline yang ada di UC?")}
                  disabled={isLoading}
                  icon="📚"
                  title="Panduan Akademik"
                  description="Memahami kebijakan dan pedoman akademik UC"
                />
                <QuickActionButton
                  onClick={() => handleShortcut("Berikan Saran Jurusan apa yang bagus untuk saya?")}
                  disabled={isLoading}
                  icon="🎯"
                  title="Program Studi"
                  description="Temukan program studi yang tepat berdasarkan minat Anda"
                />
                <QuickActionButton
                  onClick={() => handleShortcut("Apa saja organisasi kemahasiswaan yang ada di UC?")}
                  disabled={isLoading}
                  icon="🤝"
                  title="Organisasi Kemahasiswaan"
                  description="Jelajahi organisasi kemahasiswaan dan kegiatan kampus"
                />
                <QuickActionButton
                  onClick={() => handleShortcut("Apa saja Prestasi Mahasiswa UC?")}
                  disabled={isLoading}
                  icon="🏆"
                  title="Prestasi Mahasiswa UC"
                  description="Prestasi yang di peroleh dari mahasiswa uc"
                />
              </div>
              <div className="grid grid-cols-2 md:grid-cols-2 gap-3 sm:gap-4 mt-4">
                <QuickActionButton
                  onClick={() => handleShortcut("Apa saja makanan dan tempat tinggal yang ada di Sekitar UC")}
                  disabled={isLoading}
                  icon="🏠"
                  title="Kehidupan Kampus"
                  description="Temukan pilihan akomodasi dan kuliner di sekitar UC"
                />
                <QuickActionButton
                  onClick={() => handleShortcut("Apa program yang ada di UC?")}
                  disabled={isLoading}
                  icon="🌟"
                  title="Program UC"
                  description="Program khusus yang ada di UC"
                />
              </div>

              <div className="mt-8 bg-orange-50 dark:bg-gray-800 rounded-xl p-4 border border-orange-100 dark:border-gray-700">
                <div className="flex gap-3">
                  <div className="text-orange-500">💡</div>
                  <div>
                    <h3 className="font-medium text-gray-800 dark:text-white">Pro Tip</h3>
                    <p className="text-gray-600 dark:text-gray-300 text-sm mt-1">
                      Jangan ragu untuk bertanya tentang program, kehidupan kampus, atau apa pun tentang UC!
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {responses.map((res, index) => (
              <ChatMessage
                key={index}
                response={res}
                onCopy={handleCopy}
                onReplay={replayVoice}
              />
            ))}
          </div>
        )}
      </div>

      {/* Input Section */}
      <div className="p-3 sm:p-4 border-t border-orange-100 dark:border-gray-700 bg-orange-50 dark:bg-gray-800">
        <div className="max-w-4xl mx-auto space-y-3 sm:space-y-4">
          <div className="relative">
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Tanyakan apa pun tentang UC!"
              rows="2"
              className="w-full px-3 sm:px-4 py-2 sm:py-3 rounded-xl border border-orange-200 dark:border-gray-600 focus:border-orange-400 dark:focus:border-orange-500 focus:ring focus:ring-orange-100 dark:focus:ring-orange-500/20 resize-none bg-white dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 text-sm sm:text-base"
            />

            {errorMessage && (
              <p className="absolute -top-6 left-0 text-red-500 text-sm bg-red-50 dark:bg-red-900/30 px-3 py-1 rounded-lg">
                {errorMessage}
              </p>
            )}
          </div>

          <div className="flex gap-2 sm:gap-3">
            <button
              onClick={handleMicToggle}
              className={`flex-1 py-2 sm:py-2.5 px-3 sm:px-4 rounded-xl font-medium text-sm flex items-center justify-center gap-2 ${isListening
                ? "bg-orange-100 dark:bg-orange-900/50 text-orange-600 dark:text-orange-400 border-2 border-orange-400 dark:border-orange-500"
                : "bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 border border-orange-200 dark:border-gray-600 hover:border-orange-400 dark:hover:border-orange-500 hover:text-orange-600 dark:hover:text-orange-400"
                }`}
            >
              {isListening ? (
                <>
                  <span className="w-2 h-2 bg-orange-500 dark:bg-orange-400 rounded-full animate-pulse"></span>
                  <span className="text-xs sm:text-sm">Recording...</span>
                </>
              ) : (
                <>
                  <span className="text-base sm:text-lg">🎤</span>
                  <span className="text-xs sm:text-sm">Voice Message</span>
                </>
              )}
            </button>

            <button
              onClick={() => handleSend()}
              disabled={isLoading}
              className={`flex-1 py-2 sm:py-2.5 px-3 sm:px-4 rounded-xl bg-orange-500 dark:bg-orange-600 hover:bg-orange-600 dark:hover:bg-orange-700 text-white font-medium text-sm flex items-center justify-center gap-2 ${isLoading ? "opacity-75 cursor-not-allowed" : ""
                }`}
            >
              {isLoading ? (
                <>
                  <span className="w-2 h-2 bg-white rounded-full animate-bounce"></span>
                  <span className="text-xs sm:text-sm">Processing...</span>
                </>
              ) : (
                <>
                  <span className="text-xs sm:text-sm">Send Message</span>
                  <span className="text-base sm:text-lg">✨</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const QuickActionButton = ({ onClick, disabled, icon, title, description }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className="w-full p-3 sm:p-4 bg-white dark:bg-gray-800 rounded-xl border border-orange-100 dark:border-gray-700 hover:border-orange-200 dark:hover:border-orange-600 hover:shadow-md text-left transition-all duration-300"
  >
    <div className="flex gap-3">
      <span className="text-xl sm:text-sm flex-shrink-0">{icon}</span>
      <div className="min-w-0">
        <h3 className="text-sm sm:text-sm text-gray-800 dark:text-white font-medium truncate">{title}</h3>
        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-2">{description}</p>
      </div>
    </div>
  </button>
);

const ChatMessage = ({ response, onCopy, onReplay }) => (
  <div className="space-y-2">
    <div className="flex justify-end">
      <div className="bg-orange-500 dark:bg-orange-600 text-white rounded-2xl rounded-tr-none px-4 py-2 max-w-[80%] shadow-sm">
        <p>{response.input}</p>
      </div>
    </div>

    <div className="flex justify-start">
      <div className="bg-orange-50 dark:bg-gray-800 rounded-2xl rounded-tl-none px-4 py-2 max-w-[80%] shadow-sm group">
        <div className="prose dark:prose-invert max-w-none text-gray-800 dark:text-gray-200">
          <ReactMarkdown
            components={{
              h3: ({ children }) => (
                <h3 className="text-lg font-bold mt-4 mb-2">{children}</h3>
              ),
              p: ({ children }) => (
                <p className="mb-2 last:mb-0">{children}</p>
              ),
              ul: ({ children }) => (
                <ul className="list-disc pl-4 mb-2">{children}</ul>
              ),
              ol: ({ children }) => (
                <ol className="list-decimal pl-4 mb-2">{children}</ol>
              ),
              li: ({ children }) => (
                <li className="mb-1 pl-1">{children}</li>
              ),
              strong: ({ children }) => (
                <strong className="font-bold">{children}</strong>
              ),
              a: ({ href, children }) => (
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-orange-500 hover:text-orange-600 dark:text-orange-400 dark:hover:text-orange-500 underline"
                >
                  {children}
                </a>
              ),
            }}
          >
            {response.reply}
          </ReactMarkdown>
        </div>

        <div className="flex justify-end gap-2 mt-2 pt-2 border-t border-orange-100 dark:border-gray-700">
          <ActionButton onClick={() => onCopy(response.reply)} title="Copy">
            📋
          </ActionButton>
          <ActionButton onClick={() => onReplay(response.voice)} title="Play">
            🔊
          </ActionButton>
        </div>
      </div>
    </div>

    <div className="text-xs text-gray-400 dark:text-gray-500 px-4">
      {response.timestamp}
    </div>
  </div>
);

const ActionButton = ({ onClick, children, title }) => (
  <button
    onClick={onClick}
    title={title}
    className="p-1 rounded hover:bg-orange-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 transition-colors"
  >
    {children}
  </button>
);

export default Chatbot;