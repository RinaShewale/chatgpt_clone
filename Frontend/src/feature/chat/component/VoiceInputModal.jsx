import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, X, Loader2, Sparkles, Volume2 } from "lucide-react";

const VoiceInputModal = ({ isOpen, onClose, onRecordComplete }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [status, setStatus] = useState("Ready to record");

  useEffect(() => {
    if (isOpen) {
      startRecording();
    }
  }, [isOpen]);

  const startRecording = () => {
    try {
      window.speechSynthesis.cancel();
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

      if (!SpeechRecognition) {
        setStatus("Speech Recognition not supported");
        return;
      }

      const recognition = new SpeechRecognition();
      recognition.lang = "en-US";
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      setIsRecording(true);
      setStatus("Listening...");

      recognition.onresult = async (event) => {
        const transcript = event.results[0][0].transcript;
        setIsRecording(false);
        setIsProcessing(true);
        setStatus("Analyzing Waves...");
        try {
          await onRecordComplete(transcript);
        } catch (err) {
          console.error("Voice send error:", err);
        }
        setIsProcessing(false);
        onClose();
      };

      recognition.onerror = (event) => {
        setStatus("System Error");
        setIsRecording(false);
      };

      recognition.onend = () => setIsRecording(false);
      recognition.start();
    } catch (err) {
      setStatus("Access Denied");
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center p-4 overflow-hidden"
      >
        {/* Futuristic Background Blur */}
        <div className="absolute inset-0 bg-black/40 backdrop-blur-xl" onClick={onClose} />
        
        {/* Floating Ambient Glows */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-purple-500/20 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200px] h-[200px] bg-cyan-500/20 rounded-full blur-[100px] pointer-events-none" />

        <motion.div
          initial={{ scale: 0.9, y: 30, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.9, y: 30, opacity: 0 }}
          transition={{ type: "spring", damping: 20, stiffness: 300 }}
          className="relative w-full max-w-sm overflow-hidden rounded-[2.5rem] border border-white/20 bg-white/5 p-8 shadow-[0_8px_32px_0_rgba(0,0,0,0.8)] backdrop-blur-2xl"
        >
          {/* Decorative Corner Light */}
          <div className="absolute -top-10 -left-10 w-32 h-32 bg-white/5 rounded-full blur-2xl" />

          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-6 right-6 z-20 rounded-full p-2 text-white/40 hover:text-white hover:bg-white/10 transition-all"
          >
            <X size={20} />
          </button>

          {/* Header */}
          <div className="relative z-10 mb-12 text-center">
            <motion.div 
              animate={{ opacity: [0.5, 1, 0.5] }} 
              transition={{ repeat: Infinity, duration: 3 }}
              className="flex justify-center mb-3"
            >
              <div className="px-3 py-1 rounded-full border border-cyan-500/30 bg-cyan-500/10 text-[10px] uppercase tracking-[0.2em] text-cyan-400 font-bold">
                AI Neural Link
              </div>
            </motion.div>
            <h2 className="text-2xl font-light tracking-tight text-white flex items-center justify-center gap-2">
              How can I <span className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">help?</span>
            </h2>
            <p className={`mt-2 text-sm transition-colors duration-500 ${isRecording ? "text-cyan-400" : "text-white/40"}`}>
              {status}
            </p>
          </div>

          {/* Central Visualizer */}
          <div className="relative flex items-center justify-center h-48">
            <AnimatePresence>
              {isRecording && (
                <>
                  {/* Rotating Rings */}
                  {[1, 2, 3].map((i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ 
                        opacity: [0, 0.3, 0], 
                        scale: [0.8, 1.8],
                        rotate: i * 120 
                      }}
                      exit={{ opacity: 0 }}
                      transition={{ 
                        repeat: Infinity, 
                        duration: 3, 
                        delay: i * 0.4,
                        ease: "easeOut" 
                      }}
                      className="absolute inset-0 border border-cyan-400/50 rounded-full"
                    />
                  ))}
                  
                  {/* Pulse Waves */}
                  <motion.div
                    animate={{ scale: [1, 1.1, 1], opacity: [0.2, 0.5, 0.2] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                    className="absolute w-40 h-40 bg-gradient-to-tr from-purple-500/20 to-cyan-500/20 rounded-full blur-xl"
                  />
                </>
              )}
            </AnimatePresence>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={isProcessing}
              className={`relative z-10 w-24 h-24 rounded-full flex items-center justify-center transition-all duration-700 shadow-inner group ${
                isRecording 
                ? "bg-white/10 shadow-[0_0_50px_rgba(34,211,238,0.3)] border border-cyan-400/50" 
                : "bg-white/5 border border-white/10 hover:border-white/30"
              }`}
            >
              <div className="absolute inset-0 rounded-full bg-gradient-to-b from-white/10 to-transparent opacity-50" />
              
              {isProcessing ? (
                <Loader2 className="animate-spin text-cyan-400" size={32} />
              ) : (
                <div className="relative">
                   <Mic 
                    className={`transition-colors duration-500 ${isRecording ? "text-cyan-400" : "text-white"}`} 
                    size={32} 
                  />
                  {isRecording && (
                    <motion.div 
                      layoutId="glow"
                      className="absolute inset-0 blur-md text-cyan-400"
                    >
                      <Mic size={32} />
                    </motion.div>
                  )}
                </div>
              )}
            </motion.button>
          </div>

          {/* Footer Metrics */}
          <div className="mt-10 flex flex-col items-center gap-6">
            <div className="flex gap-1 h-4 items-center">
                {[...Array(12)].map((_, i) => (
                    <motion.div
                        key={i}
                        animate={isRecording ? {
                            height: [4, Math.random() * 16 + 4, 4]
                        } : { height: 4 }}
                        transition={{ repeat: Infinity, duration: 0.5, delay: i * 0.05 }}
                        className={`w-[2px] rounded-full ${isRecording ? 'bg-cyan-400' : 'bg-white/20'}`}
                    />
                ))}
            </div>
            
            <p className="text-[10px] font-bold text-white/30 uppercase tracking-[0.3em]">
              {isProcessing ? "Processing Signal" : isRecording ? "Live Capture" : "Standby Mode"}
            </p>
          </div>

          {/* Bottom Glass Shine */}
          <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 w-48 h-24 bg-cyan-500/10 blur-3xl rounded-full" />
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default VoiceInputModal;