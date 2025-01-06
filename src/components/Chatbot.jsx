import React, { useState, useEffect, useMemo } from "react";
import copyIcon from '../assets/icons/copy.png';
import resetIcon from '../assets/icons/reset.png';

const Chatbot = () => {
  const [isListening, setIsListening] = useState(false);
  const [inputText, setInputText] = useState("");
  const [responses, setResponses] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

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

  const synth = window.speechSynthesis;

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
      recognition.stop();
      setIsListening(false);
    } else {
      recognition.start();
      setIsListening(true);
    }
  };


  const handleShortcut = (text) => {
    handleSend1(text); 
  };

   const handleSend = async () => {
    if (!inputText.trim()) {
      setErrorMessage("Input cannot be empty!");
      return;
    }

    setErrorMessage(""); 
    setIsLoading(true);  
    try {
      const response = await fetch("http://localhost:3000/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: inputText }),
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const data = await response.json();
      if (!data.response || !data.response.trim) {
        throw new Error("Invalid response from server");
      }

      const botReply = data.response.trim;

      setResponses((prev) => [
        ...prev,
        {
          input: inputText,
          reply: botReply,
          timestamp: new Date().toLocaleString(),
        },
      ]);

      const utterance = new SpeechSynthesisUtterance(botReply);
      utterance.lang = "id-ID";
      synth.speak(utterance);

      setInputText("");
    } catch (error) {
      setErrorMessage(`Failed to send request: ${error.message}`);
    } finally {
      setIsLoading(false); 
    }
  };
  
  const handleSend1 = async (text) => {
    if (!text.trim()) {
      setErrorMessage("Input cannot be empty!");
      return;
    }
  
    setErrorMessage(""); 
    setIsLoading(true);  
    try {
      const response = await fetch("http://localhost:3000/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),  
      });
  
      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }
  
      const data = await response.json();
      if (!data.response || !data.response.trim) {
        throw new Error("Invalid response from server");
      }
  
      const botReply = data.response.trim;
  
      setResponses((prev) => [
        ...prev,
        {
          input: text, 
          reply: botReply,
          timestamp: new Date().toLocaleString(),
        },
      ]);
  
      const utterance = new SpeechSynthesisUtterance(botReply);
      utterance.lang = "id-ID";
      synth.speak(utterance);
  
    } catch (error) {
      setErrorMessage(`Failed to send request: ${error.message}`);
    } finally {
      setIsLoading(false); 
    }
  };
  

  const handleReset = () => {
    setResponses([]);
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      alert("Response copied to clipboard!");
    }).catch(() => {
      alert("Failed to copy response.");
    });
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
                <img src={resetIcon} alt="Deskripsi gambar" className="h-4" />
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
                  <p className="text-sm md:text-base">
                    <strong className="text-orange-700 ">Yucca:</strong> {res.reply}
                    <button
                      onClick={() => handleCopy(res.reply)}
                      className="ml-2 text-blue-500 hover:text-blue-700 underline text-sm"
                    >
                      <img src={copyIcon} alt="Deskripsi gambar" className="h-4" />
                    </button>
                  </p>
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
              className="px-4 py-2 rounded-full border border-orange-500 bg-orange-5 hover:bg-orange-600  text-orange-600 hover:text-white text-sm md:text-base"
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
              className={`px-6 py-2 rounded-lg font-semibold text-sm md:text-base ${isListening
                ? "bg-orange-700 text-white"
                : "bg-orange-500 text-white hover:bg-orange-600"
                }`}
            >
              {isListening ? "Stop Mic" : "Start Mic"}
            </button>

            <button
              onClick={handleSend}
              className={`text-sm md:text-base px-6 py-2 rounded-lg font-semibold bg-orange-500 text-white hover:bg-orange-600 ${isLoading && "opacity-50 cursor-not-allowed"
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
