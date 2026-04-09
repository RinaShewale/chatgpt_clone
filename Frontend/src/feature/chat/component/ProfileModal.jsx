import React, { useState, useEffect } from "react";
import { X, Camera, Mail, AtSign, Loader2 } from "lucide-react";
import { useAuth } from "../../auth/hooks/useauth"; // Import your hook

const ProfileModal = ({ isOpen, onClose, user }) => {
  // 1. Get the update function and loading state from your hook
  const { handleUpdateProfile, loading } = useAuth();

  // 2. Define local state for the username
  const [username, setUsername] = useState("");

  // 3. Sync local state with current user data when modal opens
  useEffect(() => {
    if (isOpen && user) {
      setUsername(user.username || "");
    }
  }, [user, isOpen]);

  if (!isOpen) return null;

  // 4. Handle the update logic
  const onUpdate = async () => {
    if (!username.trim()) return; // Prevent empty updates

    // Calling your hook logic
    const result = await handleUpdateProfile({ 
        username: username.trim() 
    });

    // Close the modal if the update was successful
    if (result?.success !== false) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      {/* Backdrop (Dark overlay) */}
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={onClose} />
      
      {/* Modal Container */}
      <div className="bg-[#212121] w-full max-w-[440px] rounded-[28px] border border-white/10 shadow-2xl z-10 animate-in fade-in zoom-in duration-200 overflow-hidden">
        
        {/* Header */}
        <div className="p-6 flex items-center justify-between border-b border-white/5">
          <h2 className="text-lg font-bold text-white">Edit Profile</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors p-1">
            <X size={20} />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-8 flex flex-col items-center">
          
          {/* Avatar Section */}
          <div className="relative group cursor-pointer mb-8">
            <div className="w-24 h-24 rounded-full bg-[#676767] flex items-center justify-center text-3xl font-bold uppercase text-white shadow-xl group-hover:opacity-80 transition-all border border-white/10 ring-4 ring-white/5">
              {/* Shows the first letter of the username as you type */}
              {username.charAt(0) || "U"}
            </div>
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <Camera size={24} className="text-white drop-shadow-md" />
            </div>
          </div>

          <div className="w-full space-y-5">
            {/* Username Input Field */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-gray-500 uppercase px-1 tracking-widest">Username</label>
              <div className="flex items-center gap-3 bg-[#0d0d0d] p-3.5 rounded-2xl border border-white/10 focus-within:border-white/30 focus-within:ring-2 ring-white/5 transition-all">
                <AtSign size={18} className="text-gray-500" />
                <input 
                  autoFocus
                  className="bg-transparent outline-none flex-1 text-sm text-white font-medium" 
                  value={username} 
                  onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/\s/g, ''))}
                  placeholder="new_username"
                />
              </div>
              <p className="text-[11px] text-gray-500 px-1">This is how you will appear in chats.</p>
            </div>

            {/* Email Address (Read Only - Non Editable) */}
            <div className="space-y-1.5 opacity-60">
              <label className="text-[11px] font-bold text-gray-500 uppercase px-1 tracking-widest">Email Address</label>
              <div className="flex items-center gap-3 bg-[#0d0d0d] p-3.5 rounded-2xl border border-white/5 cursor-not-allowed">
                <Mail size={18} className="text-gray-500" />
                <input 
                  className="bg-transparent outline-none flex-1 text-sm text-gray-400 cursor-not-allowed" 
                  disabled 
                  value={user?.email || ""} 
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="w-full mt-10 flex gap-3">
            <button 
              onClick={onClose}
              className="flex-1 py-3 rounded-2xl border border-white/10 text-white font-semibold hover:bg-white/5 transition-all active:scale-[0.98]"
            >
              Cancel
            </button>
            <button 
              onClick={onUpdate}
              disabled={loading || !username.trim() || username === user?.username}
              className="flex-1 py-3 rounded-2xl bg-white text-black font-bold hover:bg-gray-200 transition-all active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-white/5"
            >
              {loading ? (
                <><Loader2 size={18} className="animate-spin" /> Saving...</>
              ) : (
                "Save Changes"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileModal;