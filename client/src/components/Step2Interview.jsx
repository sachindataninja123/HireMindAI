import React from "react";
import maleVideo from "../assets/Videos/male-ai.mp4";
import femaleVideo from "../assets/videos/female-ai.mp4";
import Timer from "./Timer";
import { motion } from "motion/react";
import { FaMicrophone, FaMicrophoneSlash } from "react-icons/fa";
import { useState } from "react";
import { useRef } from "react";
import { useEffect } from "react";
import axios from "axios";
import { ServerURL } from "../App";
import { BsArrowRight } from "react-icons/bs";

const Step2Interview = ({ interViewData, onFinish }) => {
  const { InterviewId, questions, userName } = interViewData;

  const [isIntroPhase, setIsIntroPhase] = useState(true);

  const [isMicOn, setIsMicOn] = useState(true);
  const recognitionRef = useRef(null);
  const [isAIPlaying, setIsAIPlaying] = useState(false);
  const isMicOnRef = useRef(true);

  const [currentIdx, setCurrentIdx] = useState(0);
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState("");
  const [timeLeft, setTimeLeft] = useState(questions[0]?.timeLimit || 60);

  const [selectedVoice, setSelectedVoice] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [voiceGender, setVoiceGender] = useState("female");
  const [subTitle, setSubTitle] = useState("");

  const videoRef = useRef(null);

  const currentQuestion = questions[currentIdx];

  useEffect(() => {
    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      if (!voices.length) return;

      // Try known female voices first
      const femaleVoice = voices.find(
        (v) =>
          v.name.toLowerCase().includes("zira") ||
          v.name.toLowerCase().includes("samantha") ||
          v.name.toLowerCase().includes("female"),
      );

      if (femaleVoice) {
        setSelectedVoice(femaleVoice);
        setVoiceGender("female");
        return;
      }

      // Try known male voices
      const maleVoice = voices.find(
        (v) =>
          v.name.toLowerCase().includes("david") ||
          v.name.toLowerCase().includes("mark") ||
          v.name.toLowerCase().includes("male"),
      );

      if (maleVoice) {
        setSelectedVoice(maleVoice);
        setVoiceGender("male");
        return;
      }

      //fallback : first voice (assume female)
      setSelectedVoice(voices[0]);
      setVoiceGender("female");
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
  }, []);

  const videoSource = voiceGender === "male" ? maleVideo : femaleVideo;

  // speak function
  // const speakText = (text) => {
  //   return new Promise((resolve) => {
  //     if (!window.speechSynthesis || !selectedVoice) {
  //       resolve();
  //       return;
  //     }

  //     window.speechSynthesis.cancel();

  //     //add natural pauses after commas and periods
  //     const humanText = text.replace(/ , /g, ", ...").replace(/\./g, ". ... ");

  //     const utterance = new SpeechSynthesisUtterance(humanText);

  //     utterance.voice = selectedVoice;

  //     //Human-like pacing
  //     utterance.rate = 0.92;
  //     utterance.pitch = 1.05;
  //     utterance.volume = 1;

  //     utterance.onstart = () => {
  //       setIsAIPlaying(true);
  //       stopMic();
  //       videoRef.current?.play();
  //     };

  //     utterance.onend = () => {
  //       videoRef.current?.pause();
  //       videoRef.current.currentTime = 0;
  //       setIsAIPlaying(false);

  //       if (isMicOnRef.current) {
  //         startMic();
  //       }

  //       setTimeout(() => {
  //         setSubTitle("");
  //         resolve();
  //       }, 300);
  //     };

  //     setSubTitle(text);

  //     window.speechSynthesis.speak(utterance);
  //   });
  // };
  const speakText = (text) => {
    return new Promise((resolve) => {
      if (!window.speechSynthesis || !selectedVoice) {
        resolve();
        return;
      }

      window.speechSynthesis.cancel();

      // 🧠 Natural pauses
      const humanText = text
        .replace(/,/g, ", ...")
        .replace(/\./g, ". ...")
        .replace(/\?/g, "? ...");

      const utterance = new SpeechSynthesisUtterance(humanText);

      utterance.voice = selectedVoice;

      // 🎯 Natural voice tuning
      utterance.rate = 0.85;
      utterance.pitch = voiceGender === "female" ? 1.1 : 0.9;
      utterance.volume = 1;

      utterance.onstart = () => {
        setIsAIPlaying(true);
        stopMic();
        videoRef.current?.play();
      };

      utterance.onend = () => {
        videoRef.current?.pause();
        videoRef.current.currentTime = 0;

        setIsAIPlaying(false);

        if (isMicOnRef.current) {
          startMic(); // ✅ resume listening
        }

        setTimeout(() => {
          setSubTitle("");
          resolve();
        }, 300);
      };

      setSubTitle(text);

      // 🧠 Thinking delay (real feel)
      setTimeout(
        () => {
          window.speechSynthesis.speak(utterance);
        },
        600 + Math.random() * 500,
      );
    });
  };

  useEffect(() => {
    if (!selectedVoice) {
      return;
    }

    const runIntro = async () => {
      if (isIntroPhase) {
        await speakText(
          `Hi ${userName}, it's great to meet you today. I hope you're feeling confident and ready.`,
        );

        await speakText(
          "I'll ask you a few questions. Just answer naturally, and take your time. Let's begin.",
        );

        setIsIntroPhase(false);
      } else if (currentQuestion) {
        await new Promise((r) => setTimeout(r, 800));

        //if last question (hard level)
        if (currentIdx === questions.length - 2) {
          await speakText(
            "Alright , this one might be a bit more challenging.",
          );
        }

        await speakText(currentQuestion.question);

        if (!isMicOn) {
          startMic();
        }
      }
    };

    runIntro();
  }, [selectedVoice, isIntroPhase, currentIdx]);

  useEffect(() => {
    if (isIntroPhase) return;
    if (!currentQuestion) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isIntroPhase, currentIdx]);

  useEffect(() => {
    if (!isIntroPhase && currentQuestion) {
      setTimeLeft(currentQuestion.timeLimit || 60);
    }
  }, [currentIdx]);

  // useEffect(() => {
  //   if (!("webkitSpeechRecognition" in window)) return;

  //   const recognition = new window.webkitSpeechRecognition();
  //   recognition.lang = "en-US";
  //   recognition.continuous = true;
  //   recognition.interimResults = false;

  //   recognition.onresult = (event) => {
  //     const transcript = event.results[event.results.length - 1][0].transcript;

  //     setAnswer((prev) => prev + " " + transcript);
  //   };

  //   recognitionRef.current = recognition;
  // }, []);

  // ===============================
  // 🎤 SPEECH RECOGNITION SETUP
  // ===============================
  useEffect(() => {
    if (!("webkitSpeechRecognition" in window)) {
      alert("Speech Recognition not supported in this browser");
      return;
    }

    const recognition = new window.webkitSpeechRecognition();

    recognition.lang = "en-US";
    recognition.continuous = true;
    recognition.interimResults = true; // ✅ LIVE TYPING

    let silenceTimer;

    recognition.onresult = (event) => {
      let finalTranscript = "";
      let interimTranscript = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;

        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }

      // update answer (final only)
      if (finalTranscript) {
        setAnswer((prev) => prev + " " + finalTranscript);
      }

      // 🧠 AUTO STOP AFTER SILENCE
      clearTimeout(silenceTimer);
      silenceTimer = setTimeout(() => {
        stopMic();
      }, 2000);
    };

    recognition.onerror = (event) => {
      console.log("Mic Error:", event.error);

      if (event.error === "not-allowed") {
        alert("Please allow microphone access");
      }
    };

    recognitionRef.current = recognition;
  }, []);



  const startMic = async () => {
    try {
      await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      if (recognitionRef.current && !isAIPlaying) {
        recognitionRef.current.start();
      }
    } catch (err) {
      console.log("Mic Permission Error:", err);
    }
  };

  const stopMic = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  };

  const toggleMic = () => {
    if (isMicOn) {
      stopMic();
    } else {
      startMic();
    }

    setIsMicOn(!isMicOn);
    isMicOnRef.current = !isMicOn;
  };

  const submitAnswer = async () => {
    if (isSubmitting) return;
    stopMic();
    setIsSubmitting(true);

    try {
      const result = await axios.post(
        ServerURL + "/api/interview/submit-answer",
        {
          interviewId: InterviewId,
          questionIndex: currentIdx,
          answer,
          timeTaken: currentQuestion.timeLimit - timeLeft,
        },
        { withCredentials: true },
      );
      setFeedback(result.data.feedback);
      speakText(result.data.feedback);
      setIsSubmitting(false);
    } catch (error) {
      console.log(error);
      setIsSubmitting(false);
    }
  };

  const handleNext = async () => {
    setAnswer("");
    setFeedback("");

    if (currentIdx + 1 >= questions.length) {
      finishInterview();
      return;
    }

    await speakText("Alright , let's move to the next question.");

    setCurrentIdx(currentIdx + 1);
    setTimeout(() => {
      if (isMicOn) startMic();
    }, 500);
  };

  const finishInterview = async () => {
    stopMic();
    setIsMicOn(false);
    try {
      const result = await axios.post(
        ServerURL + "/api/interview/finish",
        { interviewId: InterviewId },
        { withCredentials: true },
      );

      console.log(result.data);
      onFinish(result.data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (isIntroPhase) return;
    if (!currentQuestion) return;

    if (timeLeft === 0 && !isSubmitting && !feedback) {
      submitAnswer();
    }
  }, [timeLeft]);

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
        recognitionRef.current.abort();
      }
      window.speechSynthesis.cancel();
    };
  }, []);

  return (
    <div className="min-h-screen bg-linear-to-br from bg-emerald-50 via-white to-teal-100 flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-338 min-h-[80vh] bg-white rounded-3xl shadow-2xl border border-gray-200 flex flex-col lg:flex-row overflow-hidden">
        {/* LEFT - VIDEO SECTION */}
        <div className="w-full lg:w-[35%] bg-white flex flex-col items-center p-6 space-y-6 border-r border-gray-200">
          {/* Video */}
          <div className="w-full max-w-md rounded-2xl overflow-hidden shadow-xl">
            <video
              src={videoSource}
              key={videoSource}
              ref={videoRef}
              muted
              playsInline
              preload="auto"
              className="w-full h-auto object-cover"
            />
          </div>

          {/* subtitle area */}
          {subTitle && (
            <div className="w-full max-w-md bg-gray-50 border border-gray-200 rounded-xl p-4 shadow-sm">
              <p className="text-gray-700 text-sm sm:text-base font-medium text-center leading-relaxed">
                {subTitle}
              </p>
            </div>
          )}

          {/* Timer Card */}
          <div className="w-full max-w-md bg-white border border-gray-200 rounded-2xl shadow-md p-6 space-y-6">
            {/* Status */}
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">Interview Status</span>
              {isAIPlaying && (
                <span className="text-sm font-semibold text-emerald-600">
                  {isAIPlaying ? "AI Speaking" : ""}
                </span>
              )}
            </div>

            <div className="h-px bg-gray-200"></div>

            {/* Timer */}
            <div className="flex justify-center">
              <Timer
                timeLeft={timeLeft}
                totalTime={currentQuestion?.timeLimit}
              />
            </div>

            <div className="h-px bg-gray-200"></div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-6 text-center">
              <div>
                <p className="text-2xl font-bold text-emerald-600">
                  {currentIdx + 1}
                </p>
                <p className="text-xs text-gray-400">Current Question</p>
              </div>

              <div>
                <p className="text-2xl font-bold text-emerald-600">
                  {questions.length}
                </p>
                <p className="text-xs text-gray-400">Total Questions</p>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT - TEXT SECTION */}
        <div className="flex-1 flex flex-col p-4 sm:p-6 md:p-8">
          {/* Header */}
          <h2 className="text-xl sm:text-2xl font-bold text-emerald-600 mb-6">
            AI Smart Interview
          </h2>

          {/* Question Card */}
          {!isIntroPhase && (
            <div className="bg-gray-50 p-4 sm:p-6 rounded-2xl border border-gray-200 shadow-sm mb-6">
              <p className="text-xs sm:text-sm text-gray-400 mb-2">
                Question {currentIdx + 1} of {questions.length}
              </p>

              <p className="text-base sm:text-lg font-semibold text-gray-800 leading-relaxed">
                {currentQuestion?.question}
              </p>
            </div>
          )}

          {/* Placeholder (space for answer UI later) */}
          <textarea
            onChange={(e) => setAnswer(e.target.value)}
            value={answer}
            placeholder="Type your answer here..."
            className="flex-1 bg-gray-100 p-2 sm:p-6 rounded-2xl resize-none outline-none border border-gray-200 focus:ring-2 focus:ring-emerald-500 transition text-gray-800"
          />

          {!feedback ? (
            // <div className="flex items-center gap-4 mt-6">
            //   <motion.button
            //     onClick={toggleMic}
            //     whileTap={{ scale: 0.9 }}
            //     className="w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center rounded-full bg-black text-white shadow-lg"
            //   >
            //     {isMicOn ? (
            //       <FaMicrophone size={20} />
            //     ) : (
            //       <FaMicrophoneSlash size={20} />
            //     )}
            //   </motion.button>

            //   <motion.button
            //     onClick={submitAnswer}
            //     disabled={isSubmitting}
            //     whileTap={{ scale: 0.95 }}
            //     className="flex-1 bg-linear-to-r from-emerald-600 to-teal-500 text-white py-3 sm:py-4 rounded-2xl shadow-lg hover:opacity-90 transition font-semibold disabled:bg-gray-500"
            //   >
            //     {isSubmitting ? "Submitting..." : "Submit Answer"}
            //   </motion.button>
            // </div>

            <div className="flex items-center gap-4 mt-6">
              {/* 🎤 MIC BUTTON */}
              <motion.button
                onClick={toggleMic}
                whileTap={{ scale: 0.9 }}
                className={`w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center rounded-full shadow-lg transition ${
                  isMicOn
                    ? "bg-emerald-600 hover:bg-emerald-700"
                    : "bg-gray-400 hover:bg-gray-500"
                } text-white`}
              >
                {isMicOn ? (
                  <FaMicrophone size={20} />
                ) : (
                  <FaMicrophoneSlash size={20} />
                )}
              </motion.button>

              {/* 🟢 MIC STATUS */}
              <div className="flex items-center gap-2 min-w-27.5">
                <div
                  className={`w-3 h-3 rounded-full ${
                    isMicOn ? "bg-emerald-500 animate-pulse" : "bg-gray-400"
                  }`}
                />
                <span className="text-sm text-gray-500">
                  {isMicOn ? "Listening..." : "Mic Off"}
                </span>
              </div>

              {/* 🚀 SUBMIT BUTTON */}
              <motion.button
                onClick={submitAnswer}
                disabled={isSubmitting}
                whileTap={{ scale: 0.95 }}
                className="flex-1 bg-linear-to-r from-emerald-600 to-teal-500 text-white py-3 sm:py-4 rounded-2xl shadow-lg hover:opacity-90 transition font-semibold disabled:bg-gray-500 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Submitting..." : "Submit Answer"}
              </motion.button>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-6 bg-emerald-50 border border-emerald-200 p-5 rounded-2xl shadow-sm"
            >
              <p className="text-emerald-700 font-medium mb-4">{feedback}</p>
              <button
                onClick={handleNext}
                className="w-full bg-linear-to-r from-emerald-600 to-teal-500 text-white py-3 rounded-xl shadow-md hover:opacity-90 transition flex items-center justify-center gap-1"
              >
                Next Question <BsArrowRight size={18} />
              </button>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Step2Interview;
