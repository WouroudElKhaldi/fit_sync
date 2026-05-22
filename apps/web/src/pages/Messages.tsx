import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import messagesData from "../data/messages.json";
import NotificationModal from "../components/NotificationModal";

type Message = {
  id: string;
  senderId: string;
  text: string;
  time: string;
  isRead: boolean;
  type?: 'text' | 'file' | 'workout';
  attachment?: {
    type: string;
    title: string;
    subtitle: string;
    icon: string;
  };
};

type Chat = {
  chatId: string;
  clientId: string;
  clientName: string;
  clientAvatar: string | null;
  lastMessage: string;
  lastMessageTime: string;
  unread: boolean;
  tags: string[];
  messages: Message[];
};

const Messages: React.FC = () => {
  const navigate = useNavigate();
  const [chats, setChats] = useState<Chat[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [inputText, setInputText] = useState("");
  const [filter, setFilter] = useState<"all" | "unread" | "clients">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Modal State
  const [modalConfig, setModalConfig] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type: 'info' | 'danger' | 'warning' | 'success';
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    type: 'info',
    onConfirm: () => {},
  });

  const closeModal = () => setModalConfig(prev => ({ ...prev, isOpen: false }));

  useEffect(() => {
    setChats(messagesData as Chat[]);
    if (messagesData.length > 0) {
      setActiveChatId(messagesData[0].chatId);
    }
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chats, activeChatId]);

  const activeChat = chats.find((c) => c.chatId === activeChatId);

  const filteredChats = chats.filter((chat) => {
    if (filter === "unread" && !chat.unread) return false;
    if (filter === "clients" && chat.tags.length === 0) return false;
    if (searchQuery && !chat.clientName.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const handleSendMessage = (textOverride?: string, type: 'text' | 'file' = 'text') => {
    const textToSend = textOverride || inputText;
    if (!textToSend.trim() || !activeChatId) return;

    const newMessage: Message = {
      id: `m-${Date.now()}`,
      senderId: "u-trainer-1",
      text: textToSend.trim(),
      type,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      isRead: true,
    };

    setChats((prev) =>
      prev.map((chat) => {
        if (chat.chatId === activeChatId) {
          return {
            ...chat,
            messages: [...chat.messages, newMessage],
            lastMessage: newMessage.text,
            lastMessageTime: newMessage.time,
          };
        }
        return chat;
      })
    );
    setInputText("");
    setShowEmojiPicker(false);

    if (type === 'file') {
      setModalConfig({
        isOpen: true,
        title: 'Transmission Secure',
        message: 'The file has been uploaded and synchronized with the athlete\'s private terminal.',
        type: 'success',
        onConfirm: closeModal
      });
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleSendMessage(`Sent a tactical file: ${file.name}`, 'file');
    }
  };

  const addEmoji = (emoji: string) => {
    setInputText(prev => prev + emoji);
  };

  return (
    <div className="w-full flex h-[calc(100vh-140px)] overflow-hidden rounded-[var(--radius-xl)] border border-secondary-container/10 bg-surface-container-low shadow-2xl relative">
      {/* Left Panel: Chat List */}
      <aside className="w-full md:w-64 lg:w-[350px] border-r border-secondary-container/10 flex flex-col shrink-0 bg-surface-container-low/50 backdrop-blur-3xl">
        <div className="p-6 border-b border-secondary-container/10 bg-surface-container-high/20">
          <h3 className="text-xl font-black text-on-surface mb-6 uppercase tracking-tighter leading-none">Comms Hub</h3>
          <div className="relative w-full mb-6">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant/40 text-[20px]">hub</span>
            <input
              type="text"
              className="w-full bg-surface-container-low border border-secondary-container/20 text-xs rounded-xl pl-12 pr-4 py-3 focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none transition-all placeholder:text-on-surface-variant/30 font-black shadow-inner"
              placeholder="Search frequencies..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-1.5">
            {["all", "unread", "clients"].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f as any)}
                className={`px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${
                  filter === f ? "bg-primary text-on-primary shadow-2xl shadow-primary/30" : "bg-surface-container-high/40 text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-all"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto no-scrollbar">
          {filteredChats.map((chat) => (
            <div
              key={chat.chatId}
              onClick={() => setActiveChatId(chat.chatId)}
              className={`flex items-center gap-6 p-8 border-b border-secondary-container/5 transition-all group relative cursor-pointer ${
                activeChatId === chat.chatId ? "bg-primary/[0.03] shadow-inner" : "hover:bg-surface-container-highest/20"
              }`}
            >
              <div className="relative shrink-0">
                <div className="w-16 h-16 rounded-[24px] border-2 border-secondary-container/10 group-hover:border-primary transition-all overflow-hidden shadow-xl">
                   <img src={chat.clientAvatar || ''} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" alt="" />
                </div>
                {chat.unread && activeChatId !== chat.chatId && (
                  <div className="absolute -top-2 -right-2 w-5 h-5 bg-primary rounded-full border-4 border-surface-container-low shadow-2xl animate-pulse"></div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center mb-1">
                  <h4 className="text-base font-black text-on-surface uppercase tracking-tight truncate leading-none">{chat.clientName}</h4>
                  <span className="text-[10px] font-black text-on-surface-variant/20 uppercase tracking-widest">{chat.lastMessageTime}</span>
                </div>
                <p className={`text-xs truncate italic ${chat.unread && activeChatId !== chat.chatId ? "text-primary font-black opacity-100" : "text-on-surface-variant/40 font-medium"}`}>
                  {chat.lastMessage}
                </p>
              </div>
              {activeChatId === chat.chatId && <div className="absolute left-0 top-4 bottom-4 w-1.5 bg-primary rounded-r-full shadow-[0_0_20px_rgba(208,188,255,1)]"></div>}
            </div>
          ))}
        </div>
      </aside>

      {/* Main Panel: Active Chat Window */}
      {activeChat ? (
        <section className="flex-1 flex flex-col bg-surface-container-high/10 relative">
          <header className="flex justify-between items-center p-6 border-b border-secondary-container/10 bg-surface-container-low/30 backdrop-blur-3xl z-20">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl border border-primary/20 shadow-2xl overflow-hidden">
                 <img src={activeChat.clientAvatar || ''} className="w-full h-full object-cover" alt="" />
              </div>
              <div>
                <h2 className="text-xl font-black text-on-surface uppercase tracking-tighter leading-none mb-0.5">{activeChat.clientName}</h2>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)] animate-pulse"></div>
                  <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest opacity-80">Synchronized</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button 
                onClick={() => navigate(`/clients/${activeChat.clientId}`)}
                className="px-6 py-2.5 bg-primary text-on-primary text-[9px] font-black uppercase tracking-[0.2em] rounded-xl hover:brightness-110 transition-all shadow-2xl shadow-primary/30 active:scale-95 flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-[16px]">person_search</span>
                Intel
              </button>
              <button className="w-10 h-10 rounded-xl bg-surface-container-high/60 border border-secondary-container/10 flex items-center justify-center text-on-surface-variant hover:text-on-surface transition-all shadow-xl active:scale-90">
                <span className="material-symbols-outlined text-[20px]">settings_input_component</span>
              </button>
            </div>
          </header>

          <div className="flex-1 overflow-y-auto p-12 space-y-10 no-scrollbar relative">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(208,188,255,0.02),transparent)] pointer-events-none"></div>
            {activeChat.messages.map((msg) => {
              const isTrainer = msg.senderId === "u-trainer-1";
              return (
                <div key={msg.id} className={`flex flex-col gap-3 max-w-[70%] animate-in fade-in slide-in-from-bottom-4 duration-500 ${isTrainer ? "items-end self-end" : "items-start self-start"}`}>
                  <div className={`px-8 py-5 rounded-[32px] text-sm font-black shadow-2xl leading-relaxed relative group/msg ${
                    isTrainer ? "bg-primary text-on-primary rounded-tr-none shadow-primary/20" : "bg-surface-container-high border border-secondary-container/10 text-on-surface rounded-tl-none shadow-black/20"
                  }`}>
                    {msg.text}
                    {msg.type === 'file' && (
                       <div className="mt-4 flex items-center gap-4 p-4 bg-black/20 rounded-2xl border border-white/5 backdrop-blur-md">
                          <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                             <span className="material-symbols-outlined text-white">description</span>
                          </div>
                          <div>
                             <span className="text-[10px] uppercase font-black tracking-widest text-white/40 block mb-0.5">Tactical Doc</span>
                             <span className="text-xs font-black text-white">DATA_ENCRYPTED_LINK.pdf</span>
                          </div>
                       </div>
                    )}
                    <div className={`absolute top-0 ${isTrainer ? '-left-12' : '-right-12'} opacity-0 group-hover/msg:opacity-100 transition-opacity`}>
                       <button className="w-8 h-8 rounded-lg bg-surface-container-highest text-on-surface-variant hover:text-primary transition-all flex items-center justify-center">
                          <span className="material-symbols-outlined text-[18px]">reply</span>
                       </button>
                    </div>
                  </div>
                  <div className={`flex items-center gap-2 px-4 ${isTrainer ? "flex-row-reverse" : "flex-row"}`}>
                     <span className="text-[10px] font-black text-on-surface-variant/20 uppercase tracking-[0.2em]">{msg.time}</span>
                     {isTrainer && <span className="material-symbols-outlined text-[14px] text-emerald-500">done_all</span>}
                  </div>
                </div>
              );
            })}
            <div ref={chatEndRef} />
          </div>

          {/* Emoji Picker Popover */}
          {showEmojiPicker && (
            <div className="absolute bottom-40 left-12 p-6 bg-surface-container-low border border-secondary-container/20 rounded-[32px] shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex gap-4 animate-in fade-in slide-in-from-bottom-8 backdrop-blur-3xl z-50">
              {['🔥', '💪', '⚡', '🥗', '🎯', '💯', '🦾', '🏆'].map(e => (
                <button key={e} onClick={() => addEmoji(e)} className="text-3xl hover:scale-150 transition-all duration-300 transform-gpu">{e}</button>
              ))}
            </div>
          )}

          <div className="p-10 border-t border-secondary-container/10 bg-surface-container-low/50 backdrop-blur-3xl">
            <div className="flex items-end gap-6 bg-surface-container-high/40 border-2 border-secondary-container/10 rounded-[40px] p-4 focus-within:border-primary focus-within:ring-8 focus-within:ring-primary/5 transition-all shadow-2xl relative">
              <div className="flex gap-2 pb-2">
                <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileUpload} />
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="w-14 h-14 rounded-2xl text-on-surface-variant hover:text-primary hover:bg-primary/10 transition-all flex items-center justify-center group shadow-md"
                >
                  <span className="material-symbols-outlined text-[28px] group-hover:rotate-45 transition-transform">attachment</span>
                </button>
                <button 
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  className={`w-14 h-14 rounded-2xl transition-all flex items-center justify-center shadow-md ${showEmojiPicker ? 'bg-primary text-on-primary' : 'text-on-surface-variant hover:text-primary hover:bg-primary/10'}`}
                >
                  <span className="material-symbols-outlined text-[28px]">face</span>
                </button>
              </div>
              <textarea
                className="flex-1 bg-transparent border-none text-on-surface text-base font-bold py-5 px-4 focus:ring-0 placeholder:text-on-surface-variant/20 min-h-[64px] max-h-[200px] outline-none no-scrollbar leading-relaxed"
                placeholder="Synchronize tactical orders..."
                rows={1}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), handleSendMessage())}
              />
              <div className="pb-2">
                <button
                  onClick={() => handleSendMessage()}
                  className="w-16 h-16 bg-primary text-on-primary rounded-3xl flex items-center justify-center hover:brightness-110 shadow-2xl shadow-primary/30 transition-all active:scale-90 group"
                >
                  <span className="material-symbols-outlined text-[32px] fill group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform">send</span>
                </button>
              </div>
            </div>
          </div>
        </section>
      ) : (
        <section className="flex-1 flex flex-col bg-surface items-center justify-center text-on-surface-variant/10 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(208,188,255,0.05),transparent)]"></div>
          <div className="relative flex flex-col items-center">
             <div className="w-32 h-32 rounded-[40px] bg-surface-container flex items-center justify-center mb-8 shadow-inner border border-secondary-container/10">
                <span className="material-symbols-outlined text-[64px] opacity-20">sensors</span>
             </div>
             <span className="text-2xl font-black uppercase tracking-[0.5em] opacity-10">Sync Required</span>
             <p className="mt-4 text-[10px] font-black uppercase tracking-[0.2em] opacity-20">Initialize frequency for subject interaction</p>
          </div>
        </section>
      )}

      <NotificationModal
        isOpen={modalConfig.isOpen}
        title={modalConfig.title}
        message={modalConfig.message}
        type={modalConfig.type}
        onConfirm={modalConfig.onConfirm}
        onCancel={closeModal}
        confirmLabel="Acknowledge"
      />
    </div>
  );
};

export default Messages;
