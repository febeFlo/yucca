import React, { useState, useEffect, useMemo } from "react";
import { useCharacterAnimations } from '../contexts/CharacterAnimations';
import ReactMarkdown from 'react-markdown';

const Chatbot = ({isDarkMode, toggleTheme}) => {
  const [isListening, setIsListening] = useState(false);
  const [inputText, setInputText] = useState("");
  const [responses, setResponses] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [audioElement, setAudioElement] = useState(null);
  const { setIsSpeaking } = useCharacterAnimations();


  const recognition = useMemo(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recog = new SpeechRecognition();
      recog.lang = "id-ID";
      recog.continuous = true;
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
    if (isListening) {
      recognition?.stop();
      setIsListening(false);
    } else {
      recognition?.start();
      setIsListening(true);
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

      setResponses((prev) => [
        ...prev,
        {
          input: messageText,
          reply: data.response.text.formatted,
          voice: data.response.voice,
          timestamp: new Date().toLocaleString(),
        },
      ]);

      playAudio(data.response.voice);

      if (!textOverride) {
        setInputText("");
      }
    } catch (error) {
      setErrorMessage(`Failed to send request: ${error.message}`);
    } finally {
      setIsLoading(false);
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
     <div className="h-full flex flex-col bg-white dark:bg-gray-900 transition-colors">
      {/* Header */}
      <div className="px-6 py-4 bg-orange-50 dark:bg-gray-800 border-b border-orange-100 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-orange-500 dark:bg-orange-600 rounded-xl p-3 text-white shadow-sm">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-full w-full" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Chat with Yucca</h1>
              <p className="text-orange-600 dark:text-orange-400">Your friendly UC assistant</p>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={toggleTheme}
              className="py-2 px-4 rounded-xl bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-medium text-sm flex items-center gap-2 transition-colors"
            >
              <span className="text-lg">{isDarkMode ? '🌞' : '🌙'}</span>
              {isDarkMode ? 'Light Mode' : 'Dark Mode'}
            </button>

            <button
              onClick={handleStopVoice}
              className="py-2 px-4 rounded-xl bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-medium text-sm flex items-center gap-2 transition-colors"
            >
              <span className="text-lg">🔇</span>
              Stop Voice
            </button>
            <button
              onClick={handleReset}
              className="py-2 px-4 rounded-xl bg-red-50 dark:bg-red-900/30 hover:bg-red-100 dark:hover:bg-red-900/50 text-red-600 dark:text-red-400 font-medium text-sm flex items-center gap-2 transition-colors"
            >
              <span className="text-lg">🗑️</span>
              Reset Chat
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden px-6 py-4">
        {responses.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center">
            <div className="max-w-lg w-full space-y-8">
              <div className="text-center space-y-3">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Welcome to UC!</h2>
                <p className="text-gray-600 dark:text-gray-300">
                  Hi there! I'm here to help you learn about Universitas Ciputra.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <QuickActionButton
                  onClick={() => handleShortcut("Bagaimana proses pendaftaran UC?")}
                  disabled={isLoading}
                  icon="📝"
                  title="Registration Guide"
                  description="Learn about admission steps"
                />
                <QuickActionButton
                  onClick={() => handleShortcut("Beasiswa yang ada di UC ada apa saja?")}
                  disabled={isLoading}
                  icon="🎓"
                  title="Scholarship Info"
                  description="Explore financial support"
                />
              </div>

              <div className="bg-orange-50 dark:bg-gray-800 rounded-xl p-4 border border-orange-100 dark:border-gray-700">
                <div className="flex gap-3">
                  <div className="text-orange-500">💡</div>
                  <div>
                    <h3 className="font-medium text-gray-800 dark:text-white">Pro Tip</h3>
                    <p className="text-gray-600 dark:text-gray-300 text-sm mt-1">
                      Feel free to ask about courses, campus life, or anything about UC!
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="h-full flex flex-col">
            <div className="flex-1 overflow-y-auto space-y-4 custom-scrollbar pr-4">
              {responses.map((res, index) => (
                <ChatMessage
                  key={index}
                  response={res}
                  onCopy={handleCopy}
                  onReplay={replayVoice}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Input Section */}
      <div className="p-4 border-t border-orange-100 dark:border-gray-700 bg-orange-50 dark:bg-gray-800">
        <div className="max-w-4xl mx-auto space-y-4">
          <div className="relative">
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Ask me anything about UC!"
              rows="3"
              className="w-full px-4 py-3 rounded-xl border border-orange-200 dark:border-gray-600 focus:border-orange-400 dark:focus:border-orange-500 focus:ring focus:ring-orange-100 dark:focus:ring-orange-500/20 resize-none bg-white dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
            />

            {errorMessage && (
              <p className="absolute -top-6 left-0 text-red-500 text-sm bg-red-50 dark:bg-red-900/30 px-3 py-1 rounded-lg">
                {errorMessage}
              </p>
            )}
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleMicToggle}
              className={`flex-1 py-2.5 px-4 rounded-xl font-medium text-sm flex items-center justify-center gap-2 ${
                isListening
                  ? "bg-orange-100 dark:bg-orange-900/50 text-orange-600 dark:text-orange-400 border-2 border-orange-400 dark:border-orange-500"
                  : "bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 border border-orange-200 dark:border-gray-600 hover:border-orange-400 dark:hover:border-orange-500 hover:text-orange-600 dark:hover:text-orange-400"
              }`}
            >
              {isListening ? (
                <>
                  <span className="w-2 h-2 bg-orange-500 dark:bg-orange-400 rounded-full animate-pulse"></span>
                  Recording...
                </>
              ) : (
                <>
                  <span className="text-lg">🎤</span>
                  Voice Message
                </>
              )}
            </button>

            <button
              onClick={() => handleSend()}
              disabled={isLoading}
              className={`flex-1 py-2.5 px-4 rounded-xl bg-orange-500 dark:bg-orange-600 hover:bg-orange-600 dark:hover:bg-orange-700 text-white font-medium text-sm flex items-center justify-center gap-2 ${
                isLoading ? "opacity-75 cursor-not-allowed" : ""
              }`}
            >
              {isLoading ? (
                <>
                  <span className="w-2 h-2 bg-white rounded-full animate-bounce"></span>
                  Processing...
                </>
              ) : (
                <>
                  Send Message
                  <span className="text-lg">✨</span>
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
    className="w-full p-4 bg-white dark:bg-gray-800 rounded-xl border border-orange-100 dark:border-gray-700 hover:border-orange-200 dark:hover:border-orange-600 hover:shadow-md text-left transition-all duration-300"
  >
    <div className="space-y-3">
      <span className="text-2xl">{icon}</span>
      <div>
        <h3 className="text-gray-800 dark:text-white font-medium">{title}</h3>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">{description}</p>
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