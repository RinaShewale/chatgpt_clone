import React from "react";
import { X, Info } from "lucide-react";

const PersonalizationModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="bg-[#212121] w-full max-w-[600px] rounded-2xl border border-white/10 shadow-2xl z-10 animate-in fade-in zoom-in duration-200">
        <div className="p-6 flex items-center justify-between border-b border-white/5">
          <h2 className="text-lg font-bold">Custom instructions</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white"><X size={20} /></button>
        </div>
        <div className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">What would you like ChatGPT to know about you to provide better responses?</label>
            <textarea placeholder="e.g. Where are you based? What do you do for work?..." className="w-full h-32 bg-[#0d0d0d] border border-white/10 rounded-xl p-3 text-sm focus:border-white/20 outline-none resize-none custom-scrollbar" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">How would you like ChatGPT to respond?</label>
            <textarea placeholder="e.g. How formal or casual should ChatGPT be? How long should responses be?..." className="w-full h-32 bg-[#0d0d0d] border border-white/10 rounded-xl p-3 text-sm focus:border-white/20 outline-none resize-none custom-scrollbar" />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-400 flex items-center gap-2"><Info size={14} /> Enabled for new chats</span>
            <button className="px-6 py-2 rounded-full bg-white text-black font-medium hover:bg-gray-200 transition">Save</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PersonalizationModal;