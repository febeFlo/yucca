import React, { useState, useEffect, useMemo } from "react";
import copyIcon from '../assets/icons/copy.png';
import resetIcon from '../assets/icons/reset.png';

const Chatbot = () => {
  const [isListening, setIsListening] = useState(false);
  const [inputText, setInputText] = useState("");
  const [responses, setResponses] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [audioElement, setAudioElement] = useState(null);

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
    // Stop any currently playing audio
    if (audioElement) {
      audioElement.pause();
      audioElement.currentTime = 0;
    }

    // Create a new audio element
    const audio = new Audio(`data:audio/mp3;base64,${base64Audio}`);
    setAudioElement(audio);
    
    // Play the new audio
    audio.play().catch(error => {
      console.error('Error playing audio:', error);
      setErrorMessage('Failed to play audio response');
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

      // Play the voice response
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

  return (
    <div className="flex items-center md:w-11/12 p-6 bg-orange-50 rounded-lg">
      <div className="w-full">
        <h1 className="md:text-2xl text-lg font-bold text-orange-600 mb-2 text-start animate-wobble">
          Hello, I'm Yucca Ready to Help You
        </h1>

        {responses.length > 0 && (
          <div>
            <div className="flex justify-between items-center mb-2">
              <h2 className="md:text-lg text-md font-bold text-orange-600">Responses:</h2>
              <button
                onClick={handleReset}
                className="text-red-500 hover:text-red-700 font-semibold"
              >
                <img src={resetIcon} alt="Reset" className="h-4" />
              </button>
            </div>
            <div className="md:h-96 h-32 overflow-y-auto border border-orange-300 rounded-lg p-4 bg-white">
              {responses.map((res, index) => (
                <div key={index} className="mb-4">
                  <p className="text-gray-500 text-xs">
                    <em>{res.timestamp}</em>
                  </p>
                  <p className="text-sm md:text-base">
                    <strong className="text-orange-500">You:</strong> {res.input}
                  </p>
                  <div className="flex items-start gap-2">
                    <div className="text-sm md:text-base flex-grow prose prose-orange max-w-none">
                      <strong className="text-orange-700">Yucca:</strong>{' '}
                      <div className="mt-2">
                        {res.reply.split('\n').map((line, i) => {
                          // Handle numbered list with bold headers
                          const numberedHeaderMatch = line.match(/^(\d+)\.\*\*(.*?)\*\*$/);
                          if (numberedHeaderMatch) {
                            return (
                              <div key={i} className="flex items-start my-1">
                                <span className="mr-2 font-bold min-w-[25px]">{numberedHeaderMatch[1]}.</span>
                                <span className="font-bold">{numberedHeaderMatch[2]}</span>
                              </div>
                            );
                          }

                          // Regular numbered list
                          const numberedMatch = line.match(/^(\d+)\.\s*(.+)/);
                          if (numberedMatch) {
                            return (
                              <div key={i} className="flex items-start my-1">
                                <span className="mr-2 min-w-[25px]">{numberedMatch[1]}.</span>
                                <span>{processMarkdown(numberedMatch[2])}</span>
                              </div>
                            );
                          }

                          // Process regular text with markdown
                          function processMarkdown(text) {
                            // Handle bold and italic
                            text = text.replace(/\*\*\*(.*?)\*\*\*/g, '<strong><em>$1</em></strong>');
                            text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
                            text = text.replace(/\*(.*?)\*/g, '<em>$1</em>');
                            text = text.replace(/~~(.*?)~~/g, '<del>$1</del>');
                            
                            // Handle links
                            text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-orange-600 hover:text-orange-800">$1</a>');
                            
                            return <span dangerouslySetInnerHTML={{ __html: text }} />;
                          }

                          // Regular paragraph
                          return line.trim() ? (
                            <p key={i} className="my-1">
                              {processMarkdown(line)}
                            </p>
                          ) : <br key={i} />;
                        })}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleCopy(res.reply)}
                        className="text-blue-500 hover:text-blue-700"
                      >
                        <img src={copyIcon} alt="Copy" className="h-4" />
                      </button>
                      <button
                        onClick={() => replayVoice(res.voice)}
                        className="text-orange-500 hover:text-orange-700"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  {index < responses.length - 1 && <hr className="my-2" />}
                </div>
              ))}
            </div>
          </div>
        )}

        {responses.length === 0 && (
          <div className="flex gap-2 mb-4 pt-2">
            <button
              onClick={() => handleShortcut("Bagaimana proses pendaftaran UC?")}
              className="px-4 py-2 rounded-full border border-orange-500 bg-orange-50 hover:bg-orange-600 text-orange-600 hover:text-white text-sm md:text-base"
              disabled={isLoading}
            >
              Info Pendaftaran UC
            </button>
            <button
              onClick={() => handleShortcut("Beasiswa yang ada di UC ada apa saja?")}
              className="px-4 py-2 rounded-full border border-orange-500 bg-orange-50 hover:bg-orange-600 text-orange-600 hover:text-white text-sm md:text-base"
              disabled={isLoading}
            >
              Info Beasiswa UC
            </button>
          </div>
        )}

        <div className="pt-4">
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            rows="1"
            placeholder="Start talking or type here to ask about UC..."
            className="w-full text-sm md:text-base p-4 rounded-lg border border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-500 mb-4"
          />

          {errorMessage && (
            <div className="text-red-600 mb-4 text-sm font-semibold">
              {errorMessage}
            </div>
          )}

          <div className="flex justify-between mb-4">
            <button
              onClick={handleMicToggle}
              className={`px-6 py-2 rounded-lg font-semibold text-sm md:text-base ${
                isListening
                  ? "bg-orange-700 text-white"
                  : "bg-orange-500 text-white hover:bg-orange-600"
              }`}
            >
              {isListening ? "Stop Mic" : "Start Mic"}
            </button>

            <button
              onClick={() => handleSend()}
              className={`text-sm md:text-base px-6 py-2 rounded-lg font-semibold bg-orange-500 text-white hover:bg-orange-600 ${
                isLoading && "opacity-50 cursor-not-allowed"
              }`}
              disabled={isLoading}
            >
              {isLoading ? "Waiting for Response..." : "Send Chat"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chatbot;