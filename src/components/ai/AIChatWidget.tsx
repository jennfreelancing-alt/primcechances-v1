import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Bot, User, Sparkles, Mic, Volume2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useAIChat } from '@/hooks/useAIChat';
import { ExpandableChat } from '@/components/ui/expandable-chat';
import { VoiceInterface, speakText } from '@/components/ai/VoiceInterface';

const AIChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [showVoiceInterface, setShowVoiceInterface] = useState(true); // Start with voice interface visible
  const { currentSession, loading, startNewSession, sendMessage } = useAIChat();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [currentSession?.messages]);

  // Speak AI responses when they arrive
  useEffect(() => {
    if (currentSession?.messages && currentSession.messages.length > 0) {
      const lastMessage = currentSession.messages[currentSession.messages.length - 1];
      if (lastMessage.message_type === 'assistant' && lastMessage.content) {
        speakText(lastMessage.content);
      }
    }
  }, [currentSession?.messages]);

  const handleStartChat = () => {
    if (!currentSession) {
      startNewSession();
    }
    setIsOpen(true);
  };

  const handleSendMessage = async () => {
    if (!message.trim() || loading) return;

    const messageToSend = message;
    setMessage('');
    await sendMessage(messageToSend);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleVoiceTranscription = (text: string) => {
    // Auto-send the transcribed message
    if (text.trim()) {
      setTimeout(() => {
        sendMessage(text);
      }, 500);
    }
  };

  const quickActions = [
    { text: "Find job opportunities", icon: "💼" },
    { text: "Review my resume", icon: "📄" },
    { text: "Interview tips", icon: "🎯" },
    { text: "Career guidance", icon: "🚀" }
  ];

  return (
    <>
      {/* Chat Toggle Button with Voice Indicator */}
      <motion.div
        className="fixed bottom-6 right-6 z-50"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 1, type: "spring", stiffness: 200 }}
      >
        <Button
          onClick={handleStartChat}
          className="h-14 w-14 rounded-full bg-[#008000] hover:bg-[#218c1b] shadow-lg hover:shadow-xl transition-all duration-300 group relative"
          size="icon"
        >
          <motion.div
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.3 }}
          >
            {isOpen ? (
              <X className="h-6 w-6 text-white" />
            ) : (
              <MessageCircle className="h-6 w-6 text-white group-hover:scale-110 transition-transform" />
            )}
          </motion.div>
          {/* Voice indicator */}
          <motion.div
            className="absolute -top-1 -right-1 h-4 w-4 bg-green-500 rounded-full flex items-center justify-center"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
          >
            <Volume2 className="h-2 w-2 text-white" />
          </motion.div>
        </Button>
      </motion.div>

      {/* Enhanced Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.95 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="fixed bottom-24 right-6 z-50 w-96 max-w-[calc(100vw-2rem)]"
          >
            <ExpandableChat>
              {/* Header */}
              <div className="flex items-center gap-3 p-4 border-b border-[#e6f5ec]/30 bg-[#008000]/10">
                <div className="relative">
                  <div className="w-10 h-10 bg-[#008000] rounded-full flex items-center justify-center">
                    <Bot className="w-5 h-5 text-white" />
                  </div>
                  <motion.div
                    className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                  />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-[#384040]">AI Career Assistant</h3>
                  <p className="text-sm text-gray-600">Voice-enabled assistant</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="bg-[#e6f5ec]/50 text-[#384040]">
                    <Sparkles className="w-3 h-3 mr-1" />
                    Voice ON
                  </Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowVoiceInterface(!showVoiceInterface)}
                    className={`hover:bg-[#008000]/10 rounded-full ${showVoiceInterface ? 'bg-[#008000]/20' : ''}`}
                    title="Toggle voice interface"
                  >
                    <Mic className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsOpen(false)}
                    className="hover:bg-[#008000]/10 rounded-full"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Voice Interface - Always visible when showVoiceInterface is true */}
              <AnimatePresence>
                {showVoiceInterface && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="border-b border-[#e6f5ec]/30 bg-gradient-to-r from-[#e6f5ec]/5 to-white/5"
                  >
                    <VoiceInterface
                      onTranscription={handleVoiceTranscription}
                      className="border-0 shadow-none bg-transparent"
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-80 bg-gradient-to-b from-white to-[#e6f5ec]/5">
                {!currentSession?.messages.length ? (
                  <div className="text-center py-8">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="w-16 h-16 bg-gradient-to-br from-[#008000]/20 to-[#e6f5ec]/20 rounded-full flex items-center justify-center mx-auto mb-4"
                    >
                      <Bot className="w-8 h-8 text-[#008000]" />
                    </motion.div>
                    <h4 className="font-medium text-[#384040] mb-2">Welcome to AI Career Assistant!</h4>
                    <p className="text-sm text-gray-600 mb-2">🎤 Voice-enabled • Click mic to talk</p>
                    <p className="text-xs text-gray-500 mb-4">I'll read responses aloud automatically</p>

                    {/* Quick Actions */}
                    <div className="grid grid-cols-2 gap-2">
                      {quickActions.map((action, index) => (
                        <motion.button
                          key={index}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          onClick={async () => {
                            await sendMessage(action.text);
                          }}
                          className="p-2 text-xs bg-[#e6f5ec]/30 hover:bg-[#e6f5ec]/50 rounded-lg transition-colors text-left"
                        >
                          <span className="block mb-1">{action.icon}</span>
                          <span className="text-[#384040]">{action.text}</span>
                        </motion.button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <>
                    {currentSession.messages.map((msg, index) => (
                      <motion.div
                        key={msg.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className={`flex gap-3 ${msg.message_type === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        {msg.message_type === 'assistant' && (
                          <div className="w-8 h-8 bg-gradient-to-br from-[#008000] to-[#008000]/80 rounded-full flex items-center justify-center flex-shrink-0">
                            <Bot className="w-4 h-4 text-white" />
                          </div>
                        )}
                        <div
                          className={`max-w-[80%] p-3 rounded-2xl ${msg.message_type === 'user'
                              ? 'bg-[#008000] text-white ml-12'
                              : 'bg-[#e6f5ec]/30 text-[#384040]'
                            }`}
                        >
                          <p className="text-sm leading-relaxed">{msg.content}</p>
                          <p className="text-xs opacity-70 mt-1">
                            {new Date(msg.created_at).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                        {msg.message_type === 'user' && (
                          <div className="w-8 h-8 bg-gradient-to-br from-[#384040] to-[#1b1c1c] rounded-full flex items-center justify-center flex-shrink-0">
                            <User className="w-4 h-4 text-white" />
                          </div>
                        )}
                      </motion.div>
                    ))}
                    {loading && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex gap-3 justify-start"
                      >
                        <div className="w-8 h-8 bg-gradient-to-br from-[#008000] to-[#008000]/80 rounded-full flex items-center justify-center">
                          <Bot className="w-4 h-4 text-white" />
                        </div>
                        <div className="bg-[#e6f5ec]/30 p-3 rounded-2xl">
                          <div className="flex space-x-1">
                            {[0, 1, 2].map((i) => (
                              <motion.div
                                key={i}
                                className="w-2 h-2 bg-[#008000] rounded-full"
                                animate={{ scale: [1, 1.5, 1] }}
                                transition={{
                                  repeat: Infinity,
                                  duration: 1,
                                  delay: i * 0.2
                                }}
                              />
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    )}
                    <div ref={messagesEndRef} />
                  </>
                )}
              </div>

              {/* Input Area */}
              <div className="p-4 border-t border-[#e6f5ec]/30 bg-gradient-to-r from-white to-[#e6f5ec]/5">
                <div className="flex gap-2">
                  <Input
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type your message or use voice..."
                    disabled={loading}
                    className="flex-1 border-[#e6f5ec]/50 focus:border-[#008000] focus:ring-[#008000]/20 rounded-xl"
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={!message.trim() || loading}
                    className="bg-[#008000] hover:bg-[#008000]/90 text-white rounded-xl px-4"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
                <p className="text-xs text-gray-500 mt-2 text-center">
                  🎤 Voice responses enabled • AI responses are read aloud
                </p>
              </div>
            </ExpandableChat>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AIChatWidget;
