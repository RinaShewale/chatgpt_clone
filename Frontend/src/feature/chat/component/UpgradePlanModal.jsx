import React from "react";
import { X, Check, Sparkles } from "lucide-react";

const UpgradePlanModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="bg-[#212121] w-full max-w-[720px] rounded-2xl border border-white/10 shadow-2xl overflow-hidden z-10 animate-in fade-in zoom-in duration-200">
        <div className="p-4 flex justify-end border-b border-white/5">
          <button onClick={onClose} className="text-gray-400 hover:text-white"><X size={20} /></button>
        </div>
        <div className="p-8 grid md:grid-cols-2 gap-8">
          {/* Free Plan */}
          <div className="flex flex-col h-full">
            <h3 className="text-xl font-bold mb-2">Free</h3>
            <p className="text-gray-400 text-sm mb-6">Explore how AI can help you with everyday tasks</p>
            <button disabled className="w-full py-2.5 rounded-lg bg-[#2f2f2f] text-gray-400 font-medium mb-6 cursor-not-allowed">Your current plan</button>
            <ul className="space-y-3 text-sm flex-1">
              {["Access to GPT-4o mini", "Standard response speed", "Limited access to data analysis"].map((item, i) => (
                <li key={i} className="flex items-start gap-3"><Check size={16} className="text-gray-500 mt-0.5" /> {item}</li>
              ))}
            </ul>
          </div>
          {/* Plus Plan */}
          <div className="flex flex-col h-full p-6 rounded-2xl bg-white/5 border border-white/10">
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-xl font-bold">Plus</h3>
              <span className="text-sm font-bold">$20/mo</span>
            </div>
            <p className="text-gray-400 text-sm mb-6">Boost your productivity with expanded access</p>
            <button className="w-full py-2.5 rounded-lg bg-[#10a37f] hover:bg-[#1a7f64] text-white font-medium mb-6 transition">Upgrade to Plus</button>
            <ul className="space-y-3 text-sm flex-1">
              <li className="flex items-start gap-3 font-semibold"><Sparkles size={16} className="text-[#10a37f] mt-0.5" /> Everything in Free, and:</li>
              {["Early access to new features", "Access to GPT-4, GPT-4o", "Up to 5x more messages", "DALL·E image generation"].map((item, i) => (
                <li key={i} className="flex items-start gap-3"><Check size={16} className="text-[#10a37f] mt-0.5" /> {item}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpgradePlanModal;