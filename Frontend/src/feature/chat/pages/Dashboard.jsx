import React, { useEffect, useState, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useChat } from "../hooks/usechat";
import { useAuth } from "../../auth/hooks/useauth";
import { setCurrentChatId } from "../chat.slice";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";

import { logout } from "../../auth/auth.slice";

// IMPORT SEPARATE COMPONENTS
import SettingsModal from "../component/SettingsModal";
import UpgradePlanModal from "../component/UpgradePlanModal";
import PersonalizationModal from "../component/PersonalizationModal";
import HelpModal from "../component/HelpModal";
import ProfileModal from "../component/ProfileModal";
import VoiceInputModal from "../component/VoiceInputModal";
import UploadImage from "../component/UploadImage";

import {
  Plus, Brain, ArrowUp, ChevronDown, Paperclip, MoreHorizontal,
  Trash2, Pencil, Copy, Menu, X, Search, Check, SquarePen, Settings,
  Zap, CircleUser, LifeBuoy, LogOut, Sparkles, ChevronRight,
  Mic
} from "lucide-react";

// --- FIXED TYPEWRITER COMPONENT ---
const TypewriterMarkdown = ({ content, isLast, isStreaming, markdownComponents }) => {
  const [displayedContent, setDisplayedContent] = useState(content);
  const [isTyping, setIsTyping] = useState(false);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    if (!isLast || !isStreaming || hasAnimated) {
      setDisplayedContent(content);
      setIsTyping(false);
      return;
    }

    let index = 0;
    setDisplayedContent("");
    setIsTyping(true);

    const interval = setInterval(() => {
      if (index < content.length) {
        setDisplayedContent(content.slice(0, index + 1));
        index++;
      } else {
        setIsTyping(false);
        setHasAnimated(true);
        clearInterval(interval);
      }
    }, 5);

    return () => clearInterval(interval);
  }, [content, isLast, isStreaming, hasAnimated]);

  return (
    <div className="relative">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
        {displayedContent}
      </ReactMarkdown>
      {isTyping && (
        <span className="inline-block w-2 h-5 ml-1 bg-white animate-pulse align-middle" />
      )}
    </div>
  );
};

const Dashboard = () => {
  const dispatch = useDispatch();

  const {
    handleGetChats, handleOpenChat, handleDeleteChat,
    handleSendMessage, handleDeleteMessage, handleEditMessage,
    handleRenameChat, handleVoiceInteraction, loading
  } = useChat();

  const { handleLogout } = useAuth();

  const { chats, currentChatId } = useSelector((state) => state.chat);
  const { user } = useSelector((state) => state.auth);

  const [input, setInput] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [menuOpenId, setMenuOpenId] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

  const [isStreaming, setIsStreaming] = useState(false);

  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [isPersonalizationOpen, setIsPersonalizationOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);

  const [editingChatId, setEditingChatId] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editingMessageId, setEditingMessageId] = useState(null);
  const [editMessageContent, setEditMessageContent] = useState("");

  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);
  const menuRef = useRef(null);
  const profileMenuRef = useRef(null);

  const currentChat = chats?.[currentChatId] ?? { messages: [], title: "" };
  const displayName = user?.name || user?.username || user?.email?.split("@")[0] || "User";
  const userHandle = `@${user?.username || user?.email?.split("@")[0] || "user"}`;

  const cleanTitle = (title) => {
    if (!title) return "New Chat";
    return title.replace(/\*\*/g, "").replace(/"/g, "").trim();
  };

  const chatList = Object.values(chats || {})
    .sort((a, b) => new Date(b.lastUpdated) - new Date(a.lastUpdated))
    .filter((c) => cleanTitle(c.title).toLowerCase().includes(searchTerm.toLowerCase()));

  useEffect(() => { handleGetChats(); }, []);

  useEffect(() => {
    setIsStreaming(false);
  }, [currentChatId]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) setMenuOpenId(null);
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) setProfileMenuOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [currentChat?.messages, loading]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "inherit";
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 200) + "px";
    }
  }, [input]);

  const onSend = async () => {
    if ((!input.trim() && !selectedImage) || loading) return;
    const text = input;
    const image = selectedImage;

    setInput("");
    setSelectedImage(null);
    setIsStreaming(true);

    await handleSendMessage(text, image);
  };

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleRenameSubmit = async () => {
    if (!editTitle.trim() || !editingChatId) return;
    await handleRenameChat(editingChatId, editTitle);
    setEditingChatId(null);
  };

  const handleEditMessageSubmit = async (msgId) => {
    if (!editMessageContent.trim() || !currentChatId) return;
    await handleEditMessage(currentChatId, msgId, editMessageContent);
    setEditingMessageId(null);
  };

  const markdownComponents = {
    p: ({ children }) => <div className="mb-4 last:mb-0 leading-7 text-gray-200">{children}</div>,
    h1: ({ children }) => <h1 className="text-xl font-bold mt-6 mb-3 text-white">{children}</h1>,
    h2: ({ children }) => <h2 className="text-lg font-bold mt-5 mb-2 text-white">{children}</h2>,
    ul: ({ children }) => <ul className="list-disc ml-6 mb-4 space-y-2 text-gray-200">{children}</ul>,
    ol: ({ children }) => <ol className="list-decimal ml-6 mb-4 space-y-2 text-gray-200">{children}</ol>,
    li: ({ children }) => <li className="leading-7 text-gray-200">{children}</li>,
    table: ({ children }) => (
      <div className="overflow-x-auto my-5 w-full border border-white/10 rounded-lg">
        <table className="min-w-full divide-y divide-white/10 border-collapse text-left">{children}</table>
      </div>
    ),
    thead: ({ children }) => <thead className="bg-white/5">{children}</thead>,
    th: ({ children }) => <th className="px-4 py-2 text-left text-sm font-semibold border-b border-white/10 text-gray-300">{children}</th>,
    td: ({ children }) => <td className="px-4 py-2 text-sm border-b border-white/10 text-gray-300">{children}</td>,
    code({ node, inline, className, children, ...props }) {
      const match = /language-(\w+)/.exec(className || "");
      const codeContent = String(children).replace(/\n$/, "");
      if (inline) return <code className="bg-[#2f2f2f] px-1.5 py-0.5 rounded text-[#f87171] font-mono text-sm">{children}</code>;
      return (
        <div className="my-5 rounded-lg overflow-hidden border border-white/10 bg-[#282c34] w-full shadow-lg">
          <div className="flex items-center justify-between px-4 py-2 bg-[#21252b] text-xs text-gray-400 font-mono">
            <span>{match ? match[1] : "plaintext"}</span>
            <button onClick={() => copyToClipboard(codeContent, codeContent)} className="flex items-center gap-1 hover:text-white transition">
              {copiedId === codeContent ? <Check size={12} /> : <Copy size={12} />}
              {copiedId === codeContent ? "Copied" : "Copy"}
            </button>
          </div>
          <SyntaxHighlighter
            language={match ? match[1] : "javascript"}
            style={oneDark}
            customStyle={{ margin: 0, padding: '1rem', fontSize: '0.875rem', lineHeight: '1.5rem', background: 'transparent' }}
            codeTagProps={{ style: { fontFamily: '"Fira Code", monospace' } }}
          >
            {codeContent}
          </SyntaxHighlighter>
        </div>
      );
    },
  };

  return (
    <div className="flex h-screen bg-[#212121] text-[#ececec] overflow-hidden font-sans relative">
      {isSidebarOpen && <div className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-sm" onClick={() => setIsSidebarOpen(false)} />}

      <aside className={`fixed inset-y-0 left-0 z-50 w-[260px] bg-[#171717] flex flex-col h-full border-r border-white/5 transition-transform duration-300 md:relative md:translate-x-0 ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="p-3 flex-shrink-0">
          <div className="flex items-center justify-between mb-2">
            <button onClick={() => { dispatch(setCurrentChatId(null)); setIsSidebarOpen(false); }} className="flex-1 flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg hover:bg-[#2f2f2f] transition-all group border border-white/5">
              <div className="bg-white text-black p-0.5 rounded-sm flex-shrink-0"><Plus size={14} strokeWidth={3} /></div>
              <span className="text-white">New chat</span>
            </button>
            <button onClick={() => setIsSidebarOpen(false)} className="md:hidden p-2 text-gray-400"><X size={20} /></button>
          </div>
          <div className="relative mb-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={14} />
            <input type="text" placeholder="Search chats..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full bg-[#212121] text-[13px] pl-9 pr-3 py-2 rounded-lg border border-white/5 outline-none focus:border-white/20 transition-all text-white" />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar px-3 min-h-0 text-white">
          <div className="mb-2 text-[11px] text-gray-500 font-bold uppercase tracking-wider sticky top-0 bg-[#171717] py-2 z-10">Recent</div>
          <div className="space-y-0.5 pb-4">
            {chatList.map((c) => {
              const chatId = c?._id ?? c?.id;
              const isEditing = editingChatId === chatId;
              return (
                <div key={chatId} onClick={() => { if (!chatId || isEditing) return; handleOpenChat(chatId); dispatch(setCurrentChatId(chatId)); if (window.innerWidth < 768) setIsSidebarOpen(false); }} className={`group relative flex items-center justify-between p-2.5 rounded-lg cursor-pointer transition-all ${currentChatId === chatId ? "bg-[#2f2f2f]" : "hover:bg-[#2f2f2f]/50 text-gray-400 hover:text-gray-200"}`}>
                  {isEditing ? (
                    <input autoFocus className="bg-transparent outline-none text-[13px] w-full text-white border-b border-white/20" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} onBlur={handleRenameSubmit} onKeyDown={(e) => e.key === "Enter" && handleRenameSubmit()} />
                  ) : (
                    <>
                      <span className="truncate text-[13px] pr-2 flex-1">{cleanTitle(c.title)}</span>
                      <button onClick={(e) => { e.stopPropagation(); setMenuOpenId(menuOpenId === chatId ? null : chatId); }} className={`opacity-0 group-hover:opacity-100 p-1 ${menuOpenId === chatId ? "opacity-100" : ""}`}><MoreHorizontal size={14} /></button>
                    </>
                  )}
                  {menuOpenId === chatId && (
                    <div className="absolute right-2 top-10 w-32 bg-[#2f2f2f] border border-white/10 rounded-lg shadow-xl z-50 py-1 text-white" ref={menuRef}>
                      <button onClick={(e) => { e.stopPropagation(); setEditingChatId(chatId); setEditTitle(cleanTitle(c.title)); setMenuOpenId(null); }} className="w-full flex items-center gap-2 px-3 py-2 text-xs text-gray-200 hover:bg-white/5"><Pencil size={12} /> Rename</button>
                      <button onClick={(e) => { e.stopPropagation(); handleDeleteChat(chatId); }} className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-400 hover:bg-red-500/10"><Trash2 size={12} /> Delete</button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="p-3 flex-shrink-0 border-t border-white/5 relative" ref={profileMenuRef}>
          {profileMenuOpen && (
            <div className="absolute bottom-full left-3 mb-2 w-[240px] bg-[#2f2f2f] border border-white/10 rounded-2xl shadow-2xl z-[60] overflow-hidden py-1.5 animate-in fade-in slide-in-from-bottom-2 duration-200 text-white">
              <div className="px-3 py-2.5 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#676767] flex items-center justify-center text-[11px] font-bold text-white flex-shrink-0 uppercase">{displayName.charAt(0)}</div>
                <div className="flex flex-col">
                  <span className="text-sm font-medium leading-none">{displayName}</span>
                  <span className="text-xs text-gray-400 mt-1">{userHandle}</span>
                </div>
              </div>
              <div className="h-[1px] bg-white/5 my-1" />
              <button onClick={() => { setIsUpgradeModalOpen(true); setProfileMenuOpen(false); }} className="w-full flex items-center gap-3 px-3 py-2.5 text-sm hover:bg-white/5 transition text-gray-200"><Sparkles size={16} /> Upgrade plan</button>
              <button onClick={() => { setIsPersonalizationOpen(true); setProfileMenuOpen(false); }} className="w-full flex items-center gap-3 px-3 py-2.5 text-sm hover:bg-white/5 transition text-gray-200"><Zap size={16} /> Personalization</button>
              <button onClick={() => { setIsProfileOpen(true); setProfileMenuOpen(false); }} className="w-full flex items-center gap-3 px-3 py-2.5 text-sm hover:bg-white/5 transition text-gray-200"><CircleUser size={16} /> Profile</button>
              <button onClick={() => { setIsSettingsModalOpen(true); setProfileMenuOpen(false); }} className="w-full flex items-center gap-3 px-3 py-2.5 text-sm hover:bg-white/5 transition text-gray-200"><Settings size={16} /> Settings</button>
              <div className="h-[1px] bg-white/5 my-1" />
              <button onClick={() => { setIsHelpOpen(true); setProfileMenuOpen(false); }} className="w-full flex items-center justify-between px-3 py-2.5 text-sm hover:bg-white/5 transition text-gray-200 text-left">
                <div className="flex items-center gap-3"><LifeBuoy size={16} /> Help</div>
                <ChevronRight size={14} className="text-gray-500" />
              </button>
              <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2.5 text-sm hover:bg-white/5 transition text-gray-200"><LogOut size={16} /> Log out</button>
            </div>
          )}

          <button onClick={() => setProfileMenuOpen(!profileMenuOpen)} className={`w-full flex cursor-pointer items-center gap-3 p-2 rounded-xl transition-all group ${profileMenuOpen ? 'bg-[#2f2f2f]' : 'hover:bg-[#2f2f2f]'}`}>
            <div className="w-8 h-8 rounded-full bg-[#676767] flex items-center justify-center text-[11px] font-bold text-white uppercase border border-white/10 flex-shrink-0">{displayName.charAt(0)}</div>
            <div className="flex flex-col items-start overflow-hidden text-left">
              <span className="text-[13.5px] font-medium truncate w-full text-white leading-tight">{displayName}</span>
              <span className="text-[11px] text-gray-500 leading-tight mt-0.5">Free</span>
            </div>
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col relative w-full h-full overflow-hidden">
        <header className="p-3 md:p-4 flex items-center justify-between sticky top-0 z-30 bg-[#212121]/90 backdrop-blur-md">
          <div className="flex items-center gap-2">
            <button onClick={() => setIsSidebarOpen(true)} className="md:hidden  p-2 text-gray-400 hover:text-white transition"><Menu size={20} /></button>
            <div className="flex items-center gap-1 font-semibold text-base md:text-lg cursor-pointer hover:bg-white/5 px-2 py-1 rounded-lg transition text-white text-left">ChatGPT <ChevronDown size={16} className="text-gray-500" /></div>
          </div>
          <button onClick={() => dispatch(setCurrentChatId(null))} className="md:hidden cursor-pointer p-2 text-gray-400 hover:text-white transition"><SquarePen size={20} /></button>
        </header>

        <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col">
          {!currentChat?.messages?.length ? (
            <div className="flex-1 flex flex-col items-center justify-center space-y-4 px-6 text-center">
              <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10 mb-2 text-white"><Brain size={28} /></div>
              <h1 className="text-xl md:text-2xl font-semibold text-white">How can I help you, {displayName}?</h1>
            </div>
          ) : (
            <div className="w-full max-w-3xl mx-auto py-4 md:py-8 px-4 flex-1">
              {currentChat.messages.map((msg, i) => (
                <div key={msg._id || i} className={`flex w-full mb-6 md:mb-10 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  {msg.role === "user" ? (
                    <div className="group flex flex-col items-end max-w-[90%] md:max-w-[85%] w-full">
                      {editingMessageId === msg._id ? (
                        <div className="w-full bg-[#2f2f2f] rounded-2xl p-3 border border-white/20 shadow-lg text-white">
                          <textarea autoFocus className="w-full bg-transparent outline-none text-[15px] resize-none text-white" rows={3} value={editMessageContent} onChange={(e) => setEditMessageContent(e.target.value)} />
                          <div className="flex justify-end gap-2 mt-2">
                            <button onClick={() => setEditingMessageId(null)} className="px-3 py-1 text-xs rounded-full border border-white/10 hover:bg-white/5 transition text-white">Cancel</button>
                            <button onClick={() => handleEditMessageSubmit(msg._id)} className="px-3 py-1 text-xs rounded-full bg-white text-black font-medium active:scale-95 transition">Save</button>
                          </div>
                        </div>
                      ) : (
                        <>
                          {/* ✅ IMAGE RENDERING LOGIC FIXED BELOW */}
                          {msg.role === "user" && typeof msg.image === "string" && msg.image.trim() !== "" ? (
                            <div className="mb-3 w-full flex justify-end">
                              <img
                                src={
                                  msg.image.startsWith("data:")
                                    ? msg.image
                                    : msg.image.startsWith("http")
                                      ? msg.image
                                      : `data:image/png;base64,${msg.image}`
                                }
                                alt="User upload"
                                className="max-w-[300px] max-h-[300px] object-contain rounded-xl border border-white/10 shadow-lg bg-black/20"
                                onError={(e) => (e.currentTarget.style.display = "none")}
                              />
                            </div>
                          ) : null}
                          <div className="bg-[#2f2f2f] px-4 py-2 md:py-2.5 rounded-[20px] text-[15px] leading-relaxed shadow-sm break-words whitespace-pre-wrap text-white">
                            {msg.content}
                          </div>
                          <div className="flex gap-4 mt-2 px-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => copyToClipboard(msg.content, msg._id)} className="text-gray-500 hover:text-white transition"><Copy size={14} /></button>
                            <button onClick={() => { setEditingMessageId(msg._id); setEditMessageContent(msg.content); }} className="text-gray-500 hover:text-white transition"><Pencil size={14} /></button>
                            <button onClick={() => handleDeleteMessage(currentChatId, msg._id)} className="text-gray-500 hover:text-red-500 transition"><Trash2 size={14} /></button>
                          </div>
                        </>
                      )}
                    </div>
                  ) : (
                    <div className="flex gap-3 md:gap-5 items-start w-full group text-white">
                      <div className="w-8 h-8 rounded-full bg-[#19c37d] flex-shrink-0 flex items-center justify-center border border-white/10 mt-1"><Brain size={18} className="text-white" /></div>
                      <div className="flex-1 space-y-4 overflow-hidden">
                        <div className="prose-custom text-white">
                          <TypewriterMarkdown
                            key={msg._id}
                            content={msg.content}
                            isLast={i === currentChat.messages.length - 1}
                            isStreaming={isStreaming}
                            markdownComponents={markdownComponents}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
              <div ref={messagesEndRef} className="h-20 md:h-32" />
            </div>
          )}
        </div>

        <div className="w-full pb-4 md:pb-6 px-3 md:px-4 bg-[#212121]">
          <div className="max-w-3xl mx-auto relative">
            {selectedImage && (
              <div className="absolute bottom-full mb-3 flex items-center gap-2 p-2 bg-[#2f2f2f] border border-white/10 rounded-xl shadow-xl animate-in fade-in slide-in-from-bottom-2">
                <div className="relative group">
                  <img
                    src={URL.createObjectURL(selectedImage)}
                    alt="preview"
                    className="h-16 w-16 object-cover rounded-lg border border-white/10"
                  />
                  <button
                    onClick={() => setSelectedImage(null)}
                    className="absolute -top-2 -right-2 bg-black text-white rounded-full p-0.5 border border-white/20 hover:bg-red-500 transition shadow-lg"
                  >
                    <X size={12} />
                  </button>
                </div>
              </div>
            )}

            <div className="bg-[#2f2f2f] rounded-[26px] border border-white/10 p-2 shadow-2xl focus-within:border-white/20 transition-all text-white">
              <textarea ref={textareaRef} value={input} onChange={(e) => setInput(e.target.value)} placeholder="Message ChatGPT..." className="w-full bg-transparent outline-none text-white resize-none px-3 py-2.5 text-[15px] md:text-[16px] max-h-[200px] custom-scrollbar" rows={1} onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); onSend(); } }} />
              <div className="flex justify-between items-center px-1 md:px-2 pb-1">
                <div className="flex gap-0.5 md:gap-1">
                  <button className="p-2 text-gray-400 hover:bg-white/5 rounded-full cursor-pointer transition"><Paperclip size={18} /></button>
                  <UploadImage onImageSelect={(file) => setSelectedImage(file)} />
                  <button onClick={() => setIsVoiceModalOpen(true)} className="p-2 text-gray-400 hover:bg-white/5 rounded-full cursor-pointer transition"><Mic size={18} /></button>
                </div>
                <button
                  onClick={onSend}
                  disabled={(!input.trim() && !selectedImage) || loading}
                  className={`p-2 rounded-full cursor-pointer transition-all ${(input.trim() || selectedImage) && !loading ? "bg-white text-black" : "bg-[#676767] text-[#212121] opacity-50"}`}
                >
                  <ArrowUp size={20} strokeWidth={3} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      <VoiceInputModal isOpen={isVoiceModalOpen} onClose={() => setIsVoiceModalOpen(false)} onRecordComplete={handleVoiceInteraction} />
      <SettingsModal isOpen={isSettingsModalOpen} onClose={() => setIsSettingsModalOpen(false)} />
      <UpgradePlanModal isOpen={isUpgradeModalOpen} onClose={() => setIsUpgradeModalOpen(false)} />
      <PersonalizationModal isOpen={isPersonalizationOpen} onClose={() => setIsPersonalizationOpen(false)} />
      <ProfileModal isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} user={user} />
      <HelpModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; height: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #424242; border-radius: 10px; }
        .prose-custom table { width: 100%; border-collapse: collapse; margin-bottom: 1rem; }
        @keyframes fade-in { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
        .animate-in { animation: fade-in 0.15s ease-out; }
      `}</style>
    </div>
  );
};

export default Dashboard;