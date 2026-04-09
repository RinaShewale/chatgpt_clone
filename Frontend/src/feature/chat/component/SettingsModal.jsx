import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { 
  X, Settings, Bell, Zap, LayoutGrid, Database, 
  Shield, Baby, CircleUser, Lock, ChevronDown, 
  Globe, LogOut, Trash2, Smartphone, Key, ShieldCheck,
  ChevronLeft, Loader2, Eye, EyeOff, Cloud, ShieldAlert
} from "lucide-react";

import { useAuth } from "../../auth/hooks/useauth"; 

const SettingsModal = ({ isOpen, onClose }) => {
  const { handleLogout, handleUpdatePassword } = useAuth(); 
  const { user } = useSelector((state) => state.auth);
  
  const [activeTab, setActiveTab] = useState("General");
  const [isMenuVisible, setIsMenuVisible] = useState(true); // मोबाईल नेव्हिगेशनसाठी

  // --- TOGGLE STATES ---
  const [chatHistory, setChatHistory] = useState(true);
  const [emailNotif, setEmailNotif] = useState(true);
  const [pushNotif, setPushNotif] = useState(false);
  const [memoryEnabled, setMemoryEnabled] = useState(true);
  const [familyMode, setFamilyMode] = useState(false);
  const [contentFilter, setContentFilter] = useState(true);
  
  const [connectedApps, setConnectedApps] = useState({ google: false, microsoft: false });

  // --- PERSONALIZATION STATE ---
  const [customInstructions, setCustomInstructions] = useState({
    aboutUser: "",
    responseStyle: ""
  });

  // --- PASSWORD UPDATE STATE ---
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passData, setPassData] = useState({ oldPassword: "", newPassword: "", confirmPassword: "" });
  const [passStatus, setPassStatus] = useState({ loading: false, error: null, success: null });
  const [showPasswords, setShowPasswords] = useState({ old: false, new: false, confirm: false });

  
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) setIsMenuVisible(true);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (!isOpen) return null;

  const username = user?.username || "User";
  const email = user?.email || "No email provided";
  const userId = user?._id || user?.id || "unknown_id";

  const settingsTabs = [
    { id: "General", icon: <Settings size={18} /> },
    { id: "Notifications", icon: <Bell size={18} /> },
    { id: "Personalization", icon: <Zap size={18} /> },
    { id: "Apps", icon: <LayoutGrid size={18} /> },
    { id: "Data controls", icon: <Database size={18} /> },
    { id: "Security", icon: <Shield size={18} /> },
    { id: "Parental controls", icon: <Baby size={18} /> },
    { id: "Account", icon: <CircleUser size={18} /> },
  ];

  // Helper Toggle Component
  const Toggle = ({ enabled, setEnabled }) => (
    <button 
      onClick={() => setEnabled(!enabled)}
      className={`w-10 h-5 rounded-full transition-all relative shrink-0 ${enabled ? 'bg-[#10a37f]' : 'bg-[#2f2f2f]'}`}
    >
      <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all ${enabled ? 'right-0.5' : 'left-0.5'}`} />
    </button>
  );

  const onPasswordSubmit = async (e) => {
    e.preventDefault();
    setPassStatus({ loading: true, error: null, success: null });
    if (passData.newPassword !== passData.confirmPassword) {
        return setPassStatus({ loading: false, error: "Passwords do not match", success: null });
    }
    const result = await handleUpdatePassword({ oldPassword: passData.oldPassword, newPassword: passData.newPassword });
    if (result.success) {
        setPassStatus({ loading: false, error: null, success: "Password updated!" });
        setPassData({ oldPassword: "", newPassword: "", confirmPassword: "" });
        setTimeout(() => setIsChangingPassword(false), 2000);
    } else {
        setPassStatus({ loading: false, error: result.error, success: null });
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case "General":
        return (
          <div className="space-y-6">
            <div className="divide-y divide-white/5">
              <div className="py-4 flex items-center justify-between gap-4">
                <span className="text-[15px] text-white">Appearance</span>
                <button className="flex items-center gap-2 text-sm text-gray-300 bg-white/5 px-3 py-1.5 rounded-lg border border-white/10 whitespace-nowrap">System <ChevronDown size={14} /></button>
              </div>
              <div className="py-4 flex items-center justify-between gap-4">
                <span className="text-[15px] text-white">Language</span>
                <button className="flex items-center gap-2 text-sm text-gray-300 bg-white/5 px-3 py-1.5 rounded-lg border border-white/10 whitespace-nowrap">English <ChevronDown size={14} /></button>
              </div>
            </div>
          </div>
        );

      case "Notifications":
        return (
          <div className="space-y-6">
            <div className="divide-y divide-white/5">
              <div className="py-4 flex items-center justify-between gap-4">
                <div><h4 className="text-white text-sm font-medium">Email Notifications</h4><p className="text-xs text-gray-500">Receive product and security updates.</p></div>
                <Toggle enabled={emailNotif} setEnabled={setEmailNotif} />
              </div>
              <div className="py-4 flex items-center justify-between gap-4">
                <div><h4 className="text-white text-sm font-medium">Push Notifications</h4><p className="text-xs text-gray-500">Alerts when AI finishes responding.</p></div>
                <Toggle enabled={pushNotif} setEnabled={setPushNotif} />
              </div>
            </div>
          </div>
        );

      case "Personalization":
        return (
          <div className="space-y-6">
             <div className="flex items-center justify-between">
                <div><h4 className="text-white text-sm font-medium">Memory</h4><p className="text-xs text-gray-500">ChatGPT learns from your conversations.</p></div>
                <Toggle enabled={memoryEnabled} setEnabled={setMemoryEnabled} />
              </div>
              <div className="space-y-4 pt-2">
                <div className="space-y-2">
                  <label className="text-xs text-gray-400">What should ChatGPT know about you?</label>
                  <textarea value={customInstructions.aboutUser} onChange={(e)=>setCustomInstructions({...customInstructions, aboutUser: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white h-24 outline-none focus:border-[#10a37f] resize-none" placeholder="e.g. I work in tech..." />
                </div>
                <div className="space-y-2">
                  <label className="text-xs text-gray-400">How should it respond?</label>
                  <textarea value={customInstructions.responseStyle} onChange={(e)=>setCustomInstructions({...customInstructions, responseStyle: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white h-24 outline-none focus:border-[#10a37f] resize-none" placeholder="e.g. Be formal..." />
                </div>
              </div>
          </div>
        );

      case "Apps":
        return (
          <div className="space-y-4">
            {[{ id: 'google', name: 'Google Drive' }, { id: 'microsoft', name: 'OneDrive' }].map((app) => (
              <div key={app.id} className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-xl">
                <div className="flex items-center gap-3"><Cloud size={18} className="text-blue-400" /><span className="text-sm font-medium text-white">{app.name}</span></div>
                <button onClick={() => setConnectedApps(prev => ({...prev, [app.id]: !prev[app.id]}))} className={`text-xs px-4 py-1.5 rounded-lg font-bold transition ${connectedApps[app.id] ? 'bg-red-500/10 text-red-500' : 'bg-white text-black'}`}>{connectedApps[app.id] ? 'Disconnect' : 'Connect'}</button>
              </div>
            ))}
          </div>
        );

      case "Data controls":
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div><h4 className="text-white text-sm font-medium">Chat History & Training</h4><p className="text-xs text-gray-500">Improve models with your data.</p></div>
              <Toggle enabled={chatHistory} setEnabled={setChatHistory} />
            </div>
            <div className="pt-4 border-t border-white/5 space-y-3">
              <button className="w-full flex justify-between p-4 bg-white/5 rounded-xl border border-white/5 text-sm text-white items-center">Export Data <ChevronDown size={14} className="-rotate-90" /></button>
              <button className="w-full flex justify-between p-4 bg-red-500/5 rounded-xl border border-red-500/10 text-sm text-red-500 items-center">Delete Account <ShieldAlert size={16} /></button>
            </div>
          </div>
        );

      case "Security":
        return (
          <div className="space-y-6">
            {isChangingPassword ? (
              <div className="space-y-4">
                <button onClick={() => setIsChangingPassword(false)} className="flex items-center gap-2 text-gray-400 hover:text-white transition text-sm mb-4"><ChevronLeft size={16} /> Back</button>
                <form onSubmit={onPasswordSubmit} className="space-y-4">
                  {[{ l: 'Current Password', k: 'old', n: 'oldPassword' }, { l: 'New Password', k: 'new', n: 'newPassword' }, { l: 'Confirm Password', k: 'confirm', n: 'confirmPassword' }].map((f) => (
                    <div key={f.k} className="relative">
                      <label className="text-xs text-gray-400 block mb-1.5">{f.l}</label>
                      <input required type={showPasswords[f.k] ? "text" : "password"} value={passData[f.n]} onChange={(e) => setPassData({...passData, [f.n]: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#10a37f] text-white pr-10" />
                      <button type="button" onClick={() => setShowPasswords(p => ({...p, [f.k]: !p[f.k]}))} className="absolute right-3 top-[34px] text-gray-500">{showPasswords[f.k] ? <EyeOff size={16} /> : <Eye size={16} />}</button>
                    </div>
                  ))}
                  {passStatus.error && <p className="text-xs text-red-400">{passStatus.error}</p>}
                  <button disabled={passStatus.loading} className="w-full bg-[#10a37f] text-white py-2.5 rounded-xl font-bold text-sm flex justify-center items-center">{passStatus.loading ? <Loader2 className="animate-spin" size={18} /> : "Update Password"}</button>
                </form>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-4 bg-white/5 border border-white/10 rounded-xl flex gap-3"><ShieldCheck className="text-[#10a37f]" size={20} /><div><h4 className="text-sm font-bold text-white">Security Check</h4><p className="text-xs text-gray-400">Account protection is active.</p></div></div>
                <button onClick={() => setIsChangingPassword(true)} className="w-full flex justify-between p-4 bg-white/5 rounded-xl text-sm border border-white/5 items-center">Change Password <Key size={16} /></button>
                <button onClick={() => { onClose(); handleLogout(); }} className="w-full flex justify-between p-4 bg-red-500/5 text-red-500 rounded-xl text-sm border border-red-500/10 items-center">Log out all devices <LogOut size={16} /></button>
              </div>
            )}
          </div>
        );

      case "Parental controls":
        return (
          <div className="space-y-6">
            <div className="p-4 bg-white/5 border border-white/10 rounded-xl flex gap-3"><Baby className="text-[#10a37f]" size={20} /><div><h4 className="text-sm font-bold text-white">Family Safe Mode</h4><p className="text-xs text-gray-400">Filter explicit content.</p></div></div>
            <div className="divide-y divide-white/5">
               <div className="py-4 flex justify-between items-center"><span>Safe Search</span><Toggle enabled={contentFilter} setEnabled={setContentFilter} /></div>
               <div className="py-4 flex justify-between items-center"><span>Shared PIN</span><button className="text-xs bg-white text-black px-3 py-1 rounded-md font-bold">Set PIN</button></div>
            </div>
          </div>
        );

      case "Account":
        return (
          <div className="space-y-6">
            <div className="p-5 rounded-xl bg-white/5 border border-white/10">
              <div className="flex justify-between mb-4"><span className="text-sm font-bold text-white">Plan</span><span className="text-[10px] bg-white/10 px-2 py-0.5 rounded text-gray-300">FREE</span></div>
              <button className="w-full py-2 bg-white text-black text-sm font-bold rounded-lg hover:bg-gray-200 transition">Upgrade</button>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between text-sm"><span className="text-gray-400">Email</span><span className="text-white truncate max-w-[180px]">{email}</span></div>
              <button onClick={() => { onClose(); handleLogout(); }} className="w-full mt-4 flex items-center justify-center gap-2 py-3 rounded-xl border border-red-500/20 text-red-500 hover:bg-red-500/10 transition text-sm font-medium"><LogOut size={16} /> Log out</button>
            </div>
          </div>
        );

      default: return null;
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center md:p-4">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      
      <div className="bg-[#212121] w-full h-full md:max-w-[880px] md:h-[640px] md:rounded-2xl border border-white/10 shadow-2xl flex flex-col md:flex-row overflow-hidden z-10 animate-in fade-in zoom-in duration-200">
        
        {/* Sidebar / Menu */}
        <div className={`${isMenuVisible ? 'flex' : 'hidden'} md:flex w-full h-full md:w-[280px] bg-[#171717] p-4 flex-col border-r border-white/5 shrink-0`}>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-white md:hidden">Settings</h2>
            <button onClick={onClose} className="p-2 text-gray-400 hover:text-white transition"><X size={20} /></button>
          </div>
          <div className="space-y-1 overflow-y-auto custom-scrollbar">
            {settingsTabs.map((tab) => (
              <button 
                key={tab.id}
                onClick={() => { setActiveTab(tab.id); setIsMenuVisible(false); setIsChangingPassword(false); }}
                className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg text-sm transition-all ${activeTab === tab.id ? "bg-[#2f2f2f] text-white" : "text-gray-400 hover:bg-white/5"}`}
              >
                {tab.icon} {tab.id}
              </button>
            ))}
          </div>
        </div>

        {/* Content Area */}
        <div className={`${!isMenuVisible ? 'flex' : 'hidden'} md:flex flex-1 flex-col h-full bg-[#212121] overflow-hidden`}>
          {/* Mobile Header */}
          <div className="flex items-center gap-3 p-4 border-b border-white/5 md:hidden">
            <button onClick={() => setIsMenuVisible(true)} className="p-1 text-gray-400"><ChevronLeft size={24} /></button>
            <h2 className="text-white font-bold">{activeTab}</h2>
          </div>

          <div className="flex-1 p-6 md:p-8 overflow-y-auto custom-scrollbar">
            <h2 className="hidden md:block text-xl font-bold text-white mb-6">{isChangingPassword ? "Update Password" : activeTab}</h2>
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;