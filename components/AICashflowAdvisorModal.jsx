"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import CartoonAIEyes from "@/components/CartoonAIEyes";
import { 
  Bot, 
  Send, 
  X, 
  Sparkles, 
  Loader2, 
  MessageSquare,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Radio,
  Trash2,
  Info,
  CheckCircle2,
  TrendingUp,
  ArrowRight,
  ShieldCheck,
  Zap,
  Cpu
} from "lucide-react";

const QUICK_PROMPTS = [
  "What is my safe spending pace today?",
  "I spent ₹450 on petrol for my bike",
  "Today I earned ₹1,200 from Swiggy delivery",
  "Can I afford a ₹3,500 dinner this weekend?",
  "Remind me to pay wifi bill ₹999 next week"
];

// Helper to strip markdown formatting so Text-To-Speech sounds like a real person
function stripMarkdownForSpeech(text) {
  if (!text) return "";
  return text
    .replace(/```[\s\S]*?```/g, "") // remove code blocks
    .replace(/`([^`]+)`/g, "$1") // inline code
    .replace(/\*\*([^*]+)\*\*/g, "$1") // bold
    .replace(/\*([^*]+)\*/g, "$1") // italic
    .replace(/#+\s+(.*)/g, "$1.") // headers
    .replace(/^\s*[-*+]\s+/gm, "") // list bullets
    .replace(/₹/g, "rupees ") // rupee symbol to words
    .replace(/\n+/g, " ") // linebreaks to space
    .trim();
}

export default function AICashflowAdvisorModal({ isOpen, onClose }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState("");
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [showArchInfo, setShowArchInfo] = useState(false);
  const [livePaceTelemetry, setLivePaceTelemetry] = useState(null);

  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);
  const synthRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Load chat memory from PostgreSQL on open
  const loadChatHistory = useCallback(async () => {
    try {
      const res = await fetch("/api/ai/chat", { cache: "no-store" });
      if (res.ok) {
        const json = await res.json();
        if (json.messages && json.messages.length > 0) {
          setMessages(json.messages);
        } else {
          setMessages([
            {
              role: "assistant",
              content: "Hello! I'm **Pace**, your autonomous financial advisor. I have full memory of our discussions and can instantly log expenses, record part-time gig earnings, or speak your daily cashflow status aloud. How can I help you today?"
            }
          ]);
        }
      }
    } catch (e) {
      console.warn("Could not load chat memory:", e);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      loadChatHistory();
    } else {
      stopVoiceLoop();
    }
  }, [isOpen, loadChatHistory]);

  useEffect(() => {
    if (isOpen && !isVoiceMode) {
      scrollToBottom();
    }
  }, [messages, isOpen, isVoiceMode]);

  // Setup Web Speech Recognition
  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = "en-IN";

        recognition.onstart = () => {
          setIsListening(true);
        };

        recognition.onresult = (event) => {
          let currentTranscript = "";
          for (let i = event.resultIndex; i < event.results.length; i++) {
            currentTranscript += event.results[i][0].transcript;
          }
          setVoiceTranscript(currentTranscript);

          if (event.results[0].isFinal) {
            handleFinalSpokenInput(currentTranscript);
          }
        };

        recognition.onerror = (event) => {
          console.warn("Speech recognition error:", event.error);
          setIsListening(false);
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current = recognition;
      }

      synthRef.current = window.speechSynthesis;
    }

    return () => {
      stopVoiceLoop();
    };
  }, []);

  // Text-to-Speech Speak function
  const speakText = useCallback((text, onComplete) => {
    if (!synthRef.current || !audioEnabled) {
      if (onComplete) onComplete();
      return;
    }

    synthRef.current.cancel(); // Stop any ongoing speech
    const cleanSpeech = stripMarkdownForSpeech(text);
    if (!cleanSpeech) {
      if (onComplete) onComplete();
      return;
    }

    const utterance = new SpeechSynthesisUtterance(cleanSpeech);
    utterance.rate = 1.05;
    utterance.pitch = 1.0;

    // Pick best English voice if available
    const voices = synthRef.current.getVoices();
    const naturalVoice = voices.find(v => 
      v.lang.startsWith("en-IN") || 
      v.name.includes("Natural") || 
      v.name.includes("Google") || 
      v.name.includes("Samantha")
    );
    if (naturalVoice) utterance.voice = naturalVoice;

    utterance.onstart = () => {
      setIsSpeaking(true);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      if (onComplete) onComplete();
    };

    utterance.onerror = () => {
      setIsSpeaking(false);
      if (onComplete) onComplete();
    };

    synthRef.current.speak(utterance);
  }, [audioEnabled]);

  const stopVoiceLoop = () => {
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch (e) {}
    }
    if (synthRef.current) {
      try { synthRef.current.cancel(); } catch (e) {}
    }
    setIsListening(false);
    setIsSpeaking(false);
    setVoiceTranscript("");
  };

  const startListening = async () => {
    if (!recognitionRef.current) {
      alert("Speech recognition is not supported in this browser or WebView. Please ensure Google Speech Services are enabled.");
      return;
    }
    if (synthRef.current) synthRef.current.cancel();
    setIsSpeaking(false);
    setVoiceTranscript("");

    // Proactively request microphone permission on mobile/Android WebView
    if (typeof navigator !== "undefined" && navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach(t => t.stop());
      } catch (e) {
        console.warn("Microphone permission check:", e);
      }
    }

    try {
      recognitionRef.current.start();
    } catch (e) {
      console.warn("Recognition already started or busy:", e);
    }
  };

  const handleFinalSpokenInput = (spokenText) => {
    if (!spokenText.trim()) return;
    handleSend(spokenText.trim(), true);
  };

  const handleSend = async (textToSend, fromVoice = false) => {
    const text = textToSend || input;
    if (!text.trim() || loading) return;

    const userMessage = { role: "user", content: text.trim() };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text.trim() })
      });

      const json = await res.json();
      if (res.ok && json.reply) {
        const assistantMessage = {
          role: "assistant",
          content: json.reply,
          actionData: json.actionExecuted
        };
        setMessages([...updatedMessages, assistantMessage]);

        if (json.telemetry) {
          setLivePaceTelemetry(json.telemetry);
        }

        // Vocalize response if in voice mode or audio enabled
        if (fromVoice || isVoiceMode || audioEnabled) {
          speakText(json.reply, () => {
            if (isVoiceMode) {
              // In live voice mode, auto-listen for conversational loop after Pace finishes speaking
              setTimeout(() => {
                startListening();
              }, 400);
            }
          });
        }
      } else {
        const errorMsg = { role: "assistant", content: "Pace encountered a brief connection lag. Your safe daily spend limit remains fully protected." };
        setMessages([...updatedMessages, errorMsg]);
      }
    } catch (e) {
      console.error("Chat send error:", e);
      const errorMsg = { role: "assistant", content: "Pace Financial Advisor is recalibrating telemetry. Please try again in a moment." };
      setMessages([...updatedMessages, errorMsg]);
    } finally {
      setLoading(false);
      setVoiceTranscript("");
    }
  };

  const clearChatMemory = async () => {
    if (!confirm("Clear all past chat memory with Pace? Pace will start with a fresh slate.")) return;
    try {
      await fetch("/api/ai/chat", { method: "DELETE" });
      setMessages([
        {
          role: "assistant",
          content: "Memory cleared. I'm ready for a fresh conversation! Ask me anything or tell me your spends and gig earnings."
        }
      ]);
    } catch (e) {
      console.error(e);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-md animate-in fade-in-50">
      <div 
        className="w-full max-w-2xl h-[650px] rounded-3xl bg-[#FFFFFF] dark:bg-[#0F1115] border border-black/10 dark:border-white/10 shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-black/5 dark:border-white/5 flex items-center justify-between bg-black/[0.02] dark:bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <CartoonAIEyes 
              size="md" 
              isThinking={loading} 
              isTalking={isSpeaking}
              isExcited={isListening}
            />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-black text-slate-900 dark:text-white">
                  Pace • AI Cashflow Copilot
                </h3>
                <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Live Memory & Voice
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Persistent all-time memory • Real-time database execution • Voice assistant
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 sm:gap-2">
            {/* Dual AI Engine Info Button */}
            <button
              onClick={() => setShowArchInfo(!showArchInfo)}
              title="Dual AI Architecture Pipeline"
              className="p-2 rounded-xl text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
            >
              <Cpu className="w-4 h-4" />
            </button>

            {/* Audio Voice Mode Toggle */}
            <button
              onClick={() => {
                if (isVoiceMode) {
                  stopVoiceLoop();
                  setIsVoiceMode(false);
                } else {
                  setIsVoiceMode(true);
                  startListening();
                }
              }}
              title={isVoiceMode ? "Switch to Text Chat" : "Switch to Gemini-style Live Voice Mode"}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                isVoiceMode 
                  ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/30 ring-2 ring-emerald-400 animate-pulse" 
                  : "bg-black/[0.04] dark:bg-white/[0.06] text-slate-700 dark:text-slate-200 hover:bg-emerald-500/10 hover:text-emerald-600"
              }`}
            >
              <Radio className={`w-3.5 h-3.5 ${isVoiceMode ? "animate-spin" : ""}`} />
              <span className="hidden sm:inline">{isVoiceMode ? "Live Voice ON" : "Live Voice"}</span>
            </button>

            {/* Audio Mute/Unmute */}
            <button
              onClick={() => {
                if (audioEnabled) {
                  if (synthRef.current) synthRef.current.cancel();
                  setIsSpeaking(false);
                }
                setAudioEnabled(!audioEnabled);
              }}
              title={audioEnabled ? "Voice Speech Enabled" : "Voice Speech Muted"}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
            >
              {audioEnabled ? <Volume2 className="w-4 h-4 text-emerald-500" /> : <VolumeX className="w-4 h-4" />}
            </button>

            {/* Clear History */}
            <button
              onClick={clearChatMemory}
              title="Clear all chat memory"
              className="p-2 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-500/10 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>

            {/* Close */}
            <button
              onClick={() => {
                stopVoiceLoop();
                onClose();
              }}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Dual Engine Info Modal Banner */}
        {showArchInfo && (
          <div className="p-4 border-b border-black/10 dark:border-white/10 bg-emerald-500/[0.04] dark:bg-emerald-500/[0.07] text-xs space-y-2 animate-in fade-in-50">
            <div className="flex items-center justify-between">
              <span className="font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-emerald-500" />
                How the SpendPace Dual-Model Engine Operates
              </span>
              <button onClick={() => setShowArchInfo(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1 text-[11px] text-slate-600 dark:text-slate-300">
              <div className="p-2.5 rounded-xl bg-white dark:bg-black/30 border border-black/5 dark:border-white/5">
                <p className="font-bold text-emerald-600 dark:text-emerald-400">1. Ultra-Fast Conversational LPU Core</p>
                <p className="mt-1 text-slate-500 dark:text-slate-400 leading-relaxed">
                  Powers instant sub-300ms conversational voice, all-time chat memory, and autonomous tool execution (logging ₹ spends & Swiggy gig delivery revenue directly to DB).
                </p>
              </div>
              <div className="p-2.5 rounded-xl bg-white dark:bg-black/30 border border-black/5 dark:border-white/5">
                <p className="font-bold text-teal-600 dark:text-teal-400">2. Deep Analytical & Multimodal Vision Core</p>
                <p className="mt-1 text-slate-500 dark:text-slate-400 leading-relaxed">
                  Powers multimodal crumpled receipt OCR and 6-month deep financial health forecasting, cash leaks, and trajectory algorithms cached in Upstash Redis.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* LIVE VOICE MODE INTERFACE */}
        {isVoiceMode ? (
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center bg-radial from-emerald-500/5 via-transparent to-transparent select-none animate-in zoom-in-95">
            {/* Center Visualizer & Cartoon Eyes */}
            <div className="relative mb-6">
              {/* Pulsing Aura Rings */}
              {isListening && (
                <div className="absolute -inset-6 rounded-full bg-emerald-500/20 blur-xl animate-ping pointer-events-none" />
              )}
              {isSpeaking && (
                <div className="absolute -inset-8 rounded-full bg-teal-500/30 blur-2xl animate-pulse pointer-events-none" />
              )}
              {loading && (
                <div className="absolute -inset-6 rounded-full bg-indigo-500/20 blur-xl animate-spin pointer-events-none" />
              )}

              <CartoonAIEyes 
                size="xl" 
                isThinking={loading} 
                isTalking={isSpeaking}
                isExcited={isListening}
              />
            </div>

            {/* Status Indicator */}
            <div className="mb-4">
              <span className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-black tracking-wide ${
                loading
                  ? "bg-indigo-500/10 text-indigo-500 border border-indigo-500/20"
                  : isSpeaking
                  ? "bg-teal-500/10 text-teal-500 border border-teal-500/20"
                  : isListening
                  ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 animate-pulse"
                  : "bg-slate-500/10 text-slate-400"
              }`}>
                <span className={`w-2 h-2 rounded-full ${
                  loading ? "bg-indigo-500 animate-spin" : isSpeaking ? "bg-teal-500 animate-bounce" : isListening ? "bg-emerald-500 animate-ping" : "bg-slate-400"
                }`} />
                {loading ? "Pace is thinking & updating DB..." : isSpeaking ? "Pace is speaking..." : isListening ? "Listening to you..." : "Tap microphone to speak"}
              </span>
            </div>

            {/* Real-time Oscillating Soundwave Bars */}
            <div className="flex items-center gap-1.5 h-8 mb-6">
              {[40, 75, 55, 90, 60, 80, 45, 95, 70, 50].map((h, i) => (
                <span
                  key={i}
                  style={{
                    height: (isListening || isSpeaking) ? `${Math.max(12, h * (isSpeaking ? 0.9 : 0.6))}px` : "6px",
                    transition: "height 0.15s ease-in-out"
                  }}
                  className={`w-1 rounded-full ${
                    isSpeaking 
                      ? "bg-teal-400" 
                      : isListening 
                      ? "bg-emerald-500" 
                      : "bg-black/10 dark:bg-white/10"
                  }`}
                />
              ))}
            </div>

            {/* Spoken Transcription Preview */}
            <div className="max-w-md min-h-[48px] px-4 py-2.5 rounded-2xl bg-black/[0.03] dark:bg-white/[0.04] border border-black/5 dark:border-white/5 text-xs text-slate-700 dark:text-slate-300 italic mb-6">
              {voiceTranscript ? (
                `"${voiceTranscript}"`
              ) : isSpeaking ? (
                "Listen to Pace..."
              ) : isListening ? (
                "Speak now... e.g. 'I spent 450 on fuel' or 'Earned 1200 on Swiggy today'"
              ) : (
                "Tap the large microphone button below to talk to Pace"
              )}
            </div>

            {/* Big Mic Control Button */}
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => {
                  if (isSpeaking) {
                    synthRef.current?.cancel();
                    setIsSpeaking(false);
                    startListening();
                  } else if (isListening) {
                    recognitionRef.current?.stop();
                    setIsListening(false);
                  } else {
                    startListening();
                  }
                }}
                className={`p-5 rounded-full transition-all shadow-xl ${
                  isListening
                    ? "bg-red-500 hover:bg-red-600 text-white shadow-red-500/30 scale-105"
                    : isSpeaking
                    ? "bg-teal-500 hover:bg-teal-600 text-white shadow-teal-500/30 animate-pulse"
                    : "bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/30 hover:scale-105"
                }`}
              >
                {isListening ? <MicOff className="w-7 h-7" /> : <Mic className="w-7 h-7" />}
              </button>
            </div>

            <p className="mt-3 text-[11px] text-slate-400">
              {isSpeaking ? "Tap to interrupt Pace" : isListening ? "Tap to stop listening" : "Tap to speak with Pace"}
            </p>
          </div>
        ) : (
          /* STANDARD CHAT THREAD VIEW */
          <>
            {/* Message Thread */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 text-xs leading-relaxed">
              {messages.map((m, idx) => (
                <div
                  key={idx}
                  className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[90%] sm:max-w-[85%] p-3.5 rounded-2xl ${
                      m.role === "user"
                        ? "bg-emerald-600 text-white font-medium rounded-br-xs shadow-md shadow-emerald-600/10 whitespace-pre-line"
                        : "bg-black/[0.03] dark:bg-white/[0.05] border border-black/5 dark:border-white/5 text-slate-800 dark:text-slate-200 rounded-bl-xs font-normal"
                    }`}
                  >
                    {m.role === "user" ? (
                      m.content
                    ) : (
                      <div className="space-y-2.5">
                        {/* Executed Action Badge */}
                        {m.actionData && (
                          <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-semibold text-[11px] flex items-center justify-between gap-2 shadow-xs">
                            <div className="flex items-center gap-1.5">
                              <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                              <span>
                                {m.actionData.type === "LOG_EXPENSE" && `Logged ₹${m.actionData.amount} under ${m.actionData.category}`}
                                {m.actionData.type === "LOG_PART_TIME_INCOME" && `+₹${m.actionData.amount} ${m.actionData.source || 'Gig'} Income Added`}
                                {m.actionData.type === "CREATE_PLANNER_TASK" && `Task Created: ${m.actionData.title}`}
                              </span>
                            </div>
                            <span className="text-[10px] uppercase tracking-wider font-black px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-800 dark:text-emerald-200">
                              DB Updated
                            </span>
                          </div>
                        )}

                        {/* Rich Markdown Assistant Output */}
                        <div className="leading-relaxed [&_p]:my-1.5 [&_ul]:my-1.5 [&_ul]:list-disc [&_ul]:pl-4 [&_ol]:my-1.5 [&_ol]:list-decimal [&_ol]:pl-4 [&_li]:my-0.5 [&_strong]:font-black [&_strong]:text-slate-900 dark:[&_strong]:text-white [&_table]:my-2 [&_table]:w-full [&_table]:border-collapse [&_th]:border [&_th]:border-black/10 dark:[&_th]:border-white/10 [&_th]:p-1.5 [&_th]:bg-black/5 dark:[&_th]:bg-white/5 [&_th]:text-left [&_th]:font-bold [&_td]:border [&_td]:border-black/10 dark:[&_td]:border-white/10 [&_td]:p-1.5 [&_h1]:text-sm [&_h1]:font-black [&_h2]:text-xs [&_h2]:font-bold [&_h3]:text-xs [&_h3]:font-bold">
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {m.content}
                          </ReactMarkdown>
                        </div>

                        {/* Hear Voice Button for this message */}
                        <div className="flex items-center justify-between pt-1 border-t border-black/5 dark:border-white/5 text-[10px] text-slate-400">
                          <span>Pace Cashflow Advisor</span>
                          <button
                            type="button"
                            onClick={() => speakText(m.content)}
                            className="flex items-center gap-1 hover:text-emerald-500 transition-colors"
                          >
                            <Volume2 className="w-3.5 h-3.5" />
                            <span>Listen</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {loading && (
                <div className="flex justify-start">
                  <div className="p-3.5 rounded-2xl bg-black/[0.03] dark:bg-white/[0.05] border border-black/5 dark:border-white/5 flex items-center gap-2 text-slate-400">
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-500" />
                    <span>Pace is calculating cashflow impact & executing actions...</span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Quick Prompt Chips */}
            <div className="px-4 py-2 border-t border-black/5 dark:border-white/5 bg-black/[0.01] dark:bg-white/[0.01] overflow-x-auto flex items-center gap-2 no-scrollbar">
              {QUICK_PROMPTS.map((prompt, idx) => (
                <button
                  key={idx}
                  type="button"
                  disabled={loading}
                  onClick={() => handleSend(prompt)}
                  className="text-[11px] font-semibold px-3 py-1.5 rounded-full bg-black/[0.04] dark:bg-white/[0.05] hover:bg-emerald-500/10 hover:text-emerald-600 text-slate-600 dark:text-slate-300 transition-colors whitespace-nowrap flex-shrink-0"
                >
                  {prompt}
                </button>
              ))}
            </div>

            {/* Input Bar */}
            <form 
              onSubmit={(e) => { e.preventDefault(); handleSend(); }}
              className="p-3 sm:p-4 border-t border-black/5 dark:border-white/5 flex items-center gap-2 bg-white dark:bg-[#0F1115]"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask Pace or say: 'Spent 450 petrol', 'Earned 1200 Swiggy'..."
                disabled={loading}
                className="flex-1 px-4 py-2.5 rounded-xl text-xs bg-black/[0.03] dark:bg-white/[0.05] border border-black/10 dark:border-white/10 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />

              {/* Dictate Button */}
              <button
                type="button"
                onClick={() => {
                  if (isListening) {
                    recognitionRef.current?.stop();
                  } else {
                    startListening();
                  }
                }}
                className={`p-2.5 rounded-xl transition-all ${
                  isListening 
                    ? "bg-red-500 text-white animate-pulse" 
                    : "bg-black/[0.04] dark:bg-white/[0.05] text-slate-600 dark:text-slate-300 hover:text-emerald-600"
                }`}
                title={isListening ? "Listening..." : "Dictate with Voice"}
              >
                <Mic className="w-4 h-4" />
              </button>

              <button
                type="submit"
                disabled={!input.trim() || loading}
                className="p-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white transition-all disabled:opacity-40"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
