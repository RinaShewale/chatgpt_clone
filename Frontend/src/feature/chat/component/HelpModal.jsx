import React from "react";
import { X, LifeBuoy, BookOpen, MessageSquare, Globe } from "lucide-react";

const HelpModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const links = [
    { name: "Help Center", icon: <LifeBuoy size={18} /> },
    { name: "Release Notes", icon: <BookOpen size={18} /> },
    { name: "Ask the Community", icon: <MessageSquare size={18} /> },
    { name: "Social Media", icon: <Globe size={18} /> }, // Changed from Twitter to Globe
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="bg-[#212121] w-full max-w-[400px] rounded-2xl border border-white/10 shadow-2xl z-10 animate-in fade-in zoom-in duration-200 py-2">
        <div className="px-4 py-2 flex justify-between items-center border-b border-white/5 mb-2">
          <span className="font-bold text-white">Help & Support</span>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition">
            <X size={18} />
          </button>
        </div>
        {links.map((link, i) => (
          <button key={i} className="w-full flex items-center gap-4 px-4 py-3 text-sm hover:bg-white/5 transition text-gray-200 text-left">
            <span className="text-gray-400">{link.icon}</span>
            {link.name}
          </button>
        ))}
      </div>
    </div>
  );
};

export default HelpModal;