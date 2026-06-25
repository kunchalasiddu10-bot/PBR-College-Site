import React, { useState, useEffect, useRef } from 'react';
import { Send, Paperclip, Search, Plus, MessageSquare, User, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { api } from '../services/api';

interface IUser {
  _id: string;
  name: string;
  email: string;
  role: string;
  profileImage?: string;
  department?: string;
}

interface IMessage {
  _id: string;
  chat: string;
  sender: {
    _id: string;
    name: string;
    profileImage?: string;
    role: string;
  };
  text: string;
  attachments: string[];
  readBy: string[];
  createdAt: string;
}

interface IConversation {
  _id: string;
  participants: IUser[];
  type: string;
  name?: string;
  unreadCount: number;
  lastMessage?: IMessage;
  updatedAt: string;
}

export const ChatModule: React.FC = () => {
  const { user } = useAuth();
  const { socket } = useSocket();

  const [conversations, setConversations] = useState<IConversation[]>([]);
  const [activeChat, setActiveChat] = useState<IConversation | null>(null);
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [text, setText] = useState('');
  const [attachments, setAttachments] = useState<string[]>([]);
  const [attachmentUrlInput, setAttachmentUrlInput] = useState('');
  const [showAttachmentInput, setShowAttachmentInput] = useState(false);

  // User search/New Chat state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<IUser[]>([]);
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [userSearchText, setUserSearchText] = useState('');

  // Typing status states
  const [typingUsers, setTypingUsers] = useState<{ [userId: string]: string }>({});
  const [isLocalTyping, setIsLocalTyping] = useState(false);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load conversations list
  const loadConversations = async () => {
    try {
      const res = await api.get('/chats/conversations');
      setConversations(res.data.data.conversations);
    } catch (err) {
      console.error('Failed to load conversations:', err);
    }
  };

  // Load messages for the selected chat
  const loadMessages = async (chatId: string) => {
    try {
      const res = await api.get(`/chats/conversations/${chatId}/messages`);
      setMessages(res.data.data.messages);
      
      // Update local conversation item to clear unreadCount
      setConversations((prev) =>
        prev.map((c) => (c._id === chatId ? { ...c, unreadCount: 0 } : c))
      );
    } catch (err) {
      console.error('Failed to load messages:', err);
    }
  };

  useEffect(() => {
    loadConversations();
  }, []);

  // Scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typingUsers]);

  // Real-time socket events listeners
  useEffect(() => {
    if (!socket) return;

    // Handle new message arrival
    const handleChatMessage = (message: IMessage) => {
      // 1. If message belongs to the current active chat thread
      if (activeChat && message.chat === activeChat._id) {
        setMessages((prev) => [...prev, message]);
        // Call mark-read on backend
        api.get(`/chats/conversations/${activeChat._id}/messages`).catch(() => {});
      } else {
        // Increment unread count for the thread
        setConversations((prev) =>
          prev.map((c) =>
            c._id === message.chat
              ? { ...c, unreadCount: c.unreadCount + 1, lastMessage: message }
              : c
          )
        );
      }
      
      // 2. Move conversation to the top
      setConversations((prev) => {
        const index = prev.findIndex((c) => c._id === message.chat);
        if (index === -1) {
          // If conversation isn't in our list (e.g. first message in new thread)
          loadConversations();
          return prev;
        }
        const updated = [...prev];
        const [target] = updated.splice(index, 1);
        target.lastMessage = message;
        return [target, ...updated];
      });
    };

    // Handle new chat created involving this user
    const handleNewChat = (newChat: IConversation) => {
      setConversations((prev) => [newChat, ...prev]);
    };

    // Handle typing flags
    const handleUserTyping = (data: { userId: string; name: string; isTyping: boolean; chatId: string }) => {
      if (activeChat && data.chatId === activeChat._id) {
        setTypingUsers((prev) => {
          const updated = { ...prev };
          if (data.isTyping) {
            updated[data.userId] = data.name;
          } else {
            delete updated[data.userId];
          }
          return updated;
        });
      }
    };

    // Handle read receipts
    const handleChatRead = (data: { userId: string; chatId: string }) => {
      if (activeChat && data.chatId === activeChat._id) {
        setMessages((prev) =>
          prev.map((m) => {
            if (!m.readBy.includes(data.userId)) {
              return { ...m, readBy: [...m.readBy, data.userId] };
            }
            return m;
          })
        );
      }
    };

    socket.on('chat:message', handleChatMessage);
    socket.on('chat:new', handleNewChat);
    
    // Custom socket listeners formatted in socketService/controllers
    // Notice in controller we did: io.to(`user:${pId}`).emit(`chat:${chatId}:read`, { userId })
    // and broadcast `chat:${data.chatId}:typing`
    if (activeChat) {
      socket.on(`chat:${activeChat._id}:typing`, (data: any) => {
        handleUserTyping({ ...data, chatId: activeChat._id });
      });
      socket.on(`chat:${activeChat._id}:read`, (data: any) => {
        handleChatRead({ ...data, chatId: activeChat._id });
      });
    }

    return () => {
      socket.off('chat:message', handleChatMessage);
      socket.off('chat:new', handleNewChat);
      if (activeChat) {
        socket.off(`chat:${activeChat._id}:typing`);
        socket.off(`chat:${activeChat._id}:read`);
      }
    };
  }, [socket, activeChat]);

  // Handle active chat changes
  const handleSelectChat = (chat: IConversation) => {
    setActiveChat(chat);
    setTypingUsers({});
    loadMessages(chat._id);
  };

  // Search users directory to create new chat
  useEffect(() => {
    if (userSearchText.trim() === '') {
      setSearchResults([]);
      return;
    }

    const delayDebounce = setTimeout(async () => {
      try {
        const res = await api.get(`/chats/users/search?search=${userSearchText}`);
        setSearchResults(res.data.data.users);
      } catch (err) {
        console.error(err);
      }
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [userSearchText]);

  // Emit typing status
  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setText(e.target.value);

    if (!socket || !activeChat) return;

    if (!isLocalTyping) {
      setIsLocalTyping(true);
      socket.emit('chat:typing', { chatId: activeChat._id, isTyping: true });
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      setIsLocalTyping(false);
      socket.emit('chat:typing', { chatId: activeChat._id, isTyping: false });
    }, 2000);
  };

  // Send message submit
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() && attachments.length === 0) return;
    if (!activeChat) return;

    try {
      await api.post(`/chats/conversations/${activeChat._id}/messages`, {
        text,
        attachments,
      });

      setText('');
      setAttachments([]);
      setShowAttachmentInput(false);

      if (socket) {
        socket.emit('chat:typing', { chatId: activeChat._id, isTyping: false });
      }
      setIsLocalTyping(false);
    } catch (err) {
      console.error('Failed to send message:', err);
    }
  };

  const handleStartChatWithUser = async (targetUser: IUser) => {
    try {
      const res = await api.post('/chats/conversations', {
        type: 'private',
        recipientId: targetUser._id,
      });
      const chat = res.data.data.chat;
      
      // Update local state
      setConversations((prev) => {
        if (prev.some((c) => c._id === chat._id)) return prev;
        return [chat, ...prev];
      });

      setShowNewChatModal(false);
      setUserSearchText('');
      handleSelectChat(chat);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddAttachment = () => {
    if (attachmentUrlInput.trim()) {
      setAttachments((prev) => [...prev, attachmentUrlInput.trim()]);
      setAttachmentUrlInput('');
    }
  };

  // Helpers to get conversational descriptions
  const getChatTitle = (chat: IConversation) => {
    if (chat.type === 'private') {
      const other = chat.participants.find((p) => p._id !== user?.id);
      return other ? other.name : 'Unknown User';
    }
    return chat.name || 'Group Chat';
  };

  const getChatSubtitle = (chat: IConversation) => {
    if (chat.type === 'private') {
      const other = chat.participants.find((p) => p._id !== user?.id);
      return other ? `${other.role} ${other.department ? `| ${other.department}` : ''}` : '';
    }
    return `${chat.participants.length} participants`;
  };

  const getChatAvatar = (chat: IConversation) => {
    if (chat.type === 'private') {
      const other = chat.participants.find((p) => p._id !== user?.id);
      return other?.profileImage;
    }
    return undefined;
  };

  const getChatAvatarInitials = (chat: IConversation) => {
    const title = getChatTitle(chat);
    return title.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase();
  };

  const filteredConversations = conversations.filter((c) =>
    getChatTitle(c).toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="h-[calc(100vh-10rem)] flex rounded-2xl border border-slate-200/60 dark:border-slate-800/60 overflow-hidden bg-white/70 dark:bg-slate-900/60 backdrop-blur-md shadow-xl">
      
      {/* 1. Left Sidebar - Chat Channels List */}
      <aside className="w-80 border-r border-slate-200/60 dark:border-slate-800/60 flex flex-col bg-white/50 dark:bg-slate-900/40 shrink-0">
        <div className="p-4 border-b border-slate-200/60 dark:border-slate-800/60 flex flex-col gap-3">
          <div className="flex justify-between items-center">
            <h2 className="font-extrabold text-lg text-slate-800 dark:text-slate-100">Messages</h2>
            <button
              onClick={() => setShowNewChatModal(true)}
              className="p-2 rounded-xl bg-primary-500 hover:bg-primary-600 text-white shadow-md shadow-primary-500/20 transition-all duration-200"
              title="Start New Chat"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search chats..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 focus:outline-none border-none text-slate-800 dark:text-slate-100 placeholder-slate-400"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-2 flex flex-col gap-1">
          {filteredConversations.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              <MessageSquare className="h-8 w-8 text-slate-300 dark:text-slate-700 mx-auto stroke-1 mb-2" />
              <p className="text-xs font-semibold">No chats found</p>
            </div>
          ) : (
            filteredConversations.map((chat) => {
              const isActive = activeChat?._id === chat._id;
              const avatar = getChatAvatar(chat);
              const initials = getChatAvatarInitials(chat);
              return (
                <div
                  key={chat._id}
                  onClick={() => handleSelectChat(chat)}
                  className={`p-3 rounded-xl flex gap-3 cursor-pointer transition-all ${
                    isActive
                      ? 'bg-primary-500 text-white shadow-md shadow-primary-500/10'
                      : 'hover:bg-slate-100 dark:hover:bg-slate-850 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <div className={`h-10 w-10 rounded-full shrink-0 flex items-center justify-center text-xs font-bold border overflow-hidden ${
                    isActive
                      ? 'bg-white/20 border-white/30 text-white'
                      : 'bg-primary-500/10 border-primary-500/20 text-primary-500'
                  }`}>
                    {avatar ? (
                      <img src={avatar} alt="" className="h-full w-full object-cover" />
                    ) : (
                      initials
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline">
                      <p className={`text-xs font-bold truncate ${isActive ? 'text-white' : 'text-slate-800 dark:text-slate-200'}`}>
                        {getChatTitle(chat)}
                      </p>
                      {chat.lastMessage && (
                        <span className={`text-[9px] font-semibold ${isActive ? 'text-white/70' : 'text-slate-400'}`}>
                          {new Date(chat.lastMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      )}
                    </div>
                    <p className={`text-[10px] truncate mt-0.5 ${isActive ? 'text-white/80' : 'text-slate-400'}`}>
                      {chat.lastMessage ? chat.lastMessage.text : getChatSubtitle(chat)}
                    </p>
                  </div>
                  {chat.unreadCount > 0 && !isActive && (
                    <span className="h-5 min-w-5 px-1.5 rounded-full bg-rose-500 text-white text-[10px] font-extrabold flex items-center justify-center self-center shrink-0">
                      {chat.unreadCount}
                    </span>
                  )}
                </div>
              );
            })
          )}
        </div>
      </aside>

      {/* 2. Right Pane - Active Conversation */}
      <main className="flex-1 flex flex-col bg-white/20 dark:bg-slate-900/10 relative">
        {activeChat ? (
          <>
            {/* Active Chat Header */}
            <header className="h-16 px-6 border-b border-slate-200/60 dark:border-slate-800/60 flex justify-between items-center bg-white/60 dark:bg-slate-900/40">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-full bg-primary-500/10 border border-primary-500/20 text-primary-500 flex items-center justify-center text-xs font-bold overflow-hidden">
                  {getChatAvatar(activeChat) ? (
                    <img src={getChatAvatar(activeChat)} alt="" className="h-full w-full object-cover" />
                  ) : (
                    getChatAvatarInitials(activeChat)
                  )}
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-850 dark:text-slate-100">
                    {getChatTitle(activeChat)}
                  </h3>
                  <span className="text-[9px] font-semibold text-slate-400">
                    {getChatSubtitle(activeChat)}
                  </span>
                </div>
              </div>
            </header>

            {/* Chat Messages Log */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {messages.map((msg) => {
                const isMine = msg.sender._id === user?.id;
                return (
                  <div key={msg._id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                    <div className="flex gap-2 max-w-[70%] items-end">
                      {!isMine && (
                        <div className="h-6 w-6 rounded-full bg-primary-500/10 text-primary-500 text-[10px] font-bold flex items-center justify-center overflow-hidden shrink-0">
                          {msg.sender.profileImage ? (
                            <img src={msg.sender.profileImage} alt="" className="h-full w-full object-cover" />
                          ) : (
                            msg.sender.name[0].toUpperCase()
                          )}
                        </div>
                      )}
                      <div className="flex flex-col">
                        {!isMine && (
                          <span className="text-[9px] font-semibold text-slate-400 mb-0.5 pl-2">
                            {msg.sender.name} ({msg.sender.role})
                          </span>
                        )}
                        <div className={`p-3 rounded-2xl text-xs font-semibold ${
                          isMine
                            ? 'bg-primary-500 text-white rounded-br-none shadow-md shadow-primary-500/10'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-bl-none'
                        }`}>
                          <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                          {msg.attachments && msg.attachments.length > 0 && (
                            <div className="mt-2 flex flex-col gap-1 border-t border-white/20 pt-2">
                              {msg.attachments.map((url, idx) => (
                                <a
                                  key={idx}
                                  href={url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-[10px] underline flex items-center gap-1 font-bold truncate opacity-90 hover:opacity-100"
                                >
                                  <Paperclip className="h-3 w-3 shrink-0" /> Attachment {idx + 1}
                                </a>
                              ))}
                            </div>
                          )}
                          <span className={`block text-[8px] mt-1.5 text-right font-medium opacity-70`}>
                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Typing indicators */}
              {Object.keys(typingUsers).length > 0 && (
                <div className="flex justify-start">
                  <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800/60 p-2 px-3 rounded-xl text-[10px] font-bold text-slate-400">
                    <span className="flex gap-0.5">
                      <span className="h-1.5 w-1.5 bg-slate-400 rounded-full animate-bounce" />
                      <span className="h-1.5 w-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                      <span className="h-1.5 w-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.4s]" />
                    </span>
                    <span>
                      {Object.values(typingUsers).join(', ')} is typing...
                    </span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Text Form */}
            <form onSubmit={handleSendMessage} className="p-4 border-t border-slate-200/60 dark:border-slate-800/60 bg-white/60 dark:bg-slate-900/40">
              {attachments.length > 0 && (
                <div className="mb-2 flex flex-wrap gap-1.5">
                  {attachments.map((url, idx) => (
                    <div key={idx} className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-[10px] font-bold border border-slate-200/40 dark:border-slate-700/40">
                      <Paperclip className="h-3 w-3 text-slate-400" />
                      <span className="truncate max-w-[8rem]">{url}</span>
                      <button
                        type="button"
                        onClick={() => setAttachments((prev) => prev.filter((_, i) => i !== idx))}
                        className="text-slate-400 hover:text-rose-500"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {showAttachmentInput && (
                <div className="mb-3 flex gap-2">
                  <input
                    type="text"
                    placeholder="Paste attachment image/file URL..."
                    value={attachmentUrlInput}
                    onChange={(e) => setAttachmentUrlInput(e.target.value)}
                    className="flex-1 px-3 py-1.5 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 focus:outline-none border-none text-slate-850 dark:text-slate-150"
                  />
                  <button
                    type="button"
                    onClick={handleAddAttachment}
                    className="px-4 py-1.5 bg-primary-500 hover:bg-primary-600 text-white rounded-xl text-xs font-bold transition-all"
                  >
                    Add
                  </button>
                </div>
              )}

              <div className="flex gap-2 items-center">
                <button
                  type="button"
                  onClick={() => setShowAttachmentInput(!showAttachmentInput)}
                  className={`p-2.5 rounded-xl border transition-colors ${
                    showAttachmentInput
                      ? 'border-primary-500 bg-primary-500/5 text-primary-500'
                      : 'border-slate-200 dark:border-slate-850 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                  }`}
                  title="Attach file link"
                >
                  <Paperclip className="h-4 w-4" />
                </button>
                
                <input
                  type="text"
                  placeholder="Type a message..."
                  value={text}
                  onChange={handleTextChange}
                  className="flex-1 px-4 py-2.5 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 focus:outline-none border-none text-slate-850 dark:text-slate-150"
                />

                <button
                  type="submit"
                  disabled={!text.trim() && attachments.length === 0}
                  className="p-2.5 rounded-xl bg-primary-500 hover:bg-primary-600 text-white disabled:opacity-50 disabled:hover:bg-primary-500 transition-colors shadow-md shadow-primary-500/10"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-6">
            <MessageSquare className="h-16 w-16 text-slate-200 dark:text-slate-800 stroke-1 mb-4" />
            <h3 className="font-extrabold text-sm text-slate-800 dark:text-slate-200">No chat selected</h3>
            <p className="text-[11px] text-slate-400 mt-1 max-w-xs text-center">
              Select an existing chat from the left panel or search the directory to start a conversation thread.
            </p>
            <button
              onClick={() => setShowNewChatModal(true)}
              className="mt-4 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center gap-2"
            >
              <Plus className="h-4 w-4" /> Open Directory
            </button>
          </div>
        )}
      </main>

      {/* 3. User Discovery Directory Modal */}
      {showNewChatModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 rounded-2xl shadow-2xl p-5 overflow-hidden flex flex-col max-h-[80vh]">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-extrabold text-sm flex items-center gap-2">
                <User className="h-4 w-4 text-primary-500" /> Start New Chat
              </h3>
              <button
                onClick={() => setShowNewChatModal(false)}
                className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <input
              type="text"
              placeholder="Search user name or email..."
              value={userSearchText}
              onChange={(e) => setUserSearchText(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 focus:outline-none border-none text-slate-850 dark:text-slate-150 mb-3"
            />

            <div className="flex-1 overflow-y-auto flex flex-col gap-1.5 pr-1">
              {searchResults.length === 0 ? (
                <div className="py-8 text-center text-slate-400">
                  <p className="text-xs font-semibold">
                    {userSearchText ? 'No matching users found' : 'Type to search directory'}
                  </p>
                </div>
              ) : (
                searchResults.map((targetUser) => (
                  <div
                    key={targetUser._id}
                    onClick={() => handleStartChatWithUser(targetUser)}
                    className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 hover:border-primary-500/30 dark:hover:border-primary-500/20 hover:bg-primary-500/[0.02] flex justify-between items-center cursor-pointer transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-primary-500/10 text-primary-500 flex items-center justify-center text-xs font-bold overflow-hidden">
                        {targetUser.profileImage ? (
                          <img src={targetUser.profileImage} alt="" className="h-full w-full object-cover" />
                        ) : (
                          targetUser.name[0].toUpperCase()
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">{targetUser.name}</p>
                        <p className="text-[10px] text-slate-400 truncate">{targetUser.email}</p>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[8px] font-extrabold uppercase bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                      {targetUser.role}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default ChatModule;
