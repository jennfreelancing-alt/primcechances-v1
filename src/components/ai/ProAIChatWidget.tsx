import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Bot, User, Sparkles, Mic, Volume2, Crown, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAIChat } from '@/hooks/useAIChat';
import { ExpandableChat } from '@/components/ui/expandable-chat';
import { VoiceInterface, speakText } from '@/components/ai/VoiceInterface';
import { useUserTier } from '@/hooks/useUserTier';
import { useFlutterwavePayment } from '@/hooks/useFlutterwavePayment';
import { toast } from 'sonner'; 
const ProAIChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [showVoiceInterface, setShowVoiceInterface] = useState(true);
  const { currentSession, loading, startNewSession, sendMessage } = useAIChat();
  const { hasProAccess, loading: tierLoading } = useUserTier();
  const { processPayment, isProcessing, proPrice, priceLoading } = useFlutterwavePayment();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [currentSession?.messages]);

  // Speak AI responses when they arrive (Pro feature)
  useEffect(() => {
    if (hasProAccess() && currentSession?.messages && currentSession.messages.length > 0) {
      const lastMessage = currentSession.messages[currentSession.messages.length - 1];
      if (lastMessage.message_type === 'assistant' && lastMessage.content) {
        speakText(lastMessage.content);
      }
    }
  }, [currentSession?.messages, hasProAccess]);

  const handleStartChat = () => {
    if (!hasProAccess()) {
      toast.error('AI Voice Chat is a Pro feature. Upgrade to access this functionality.');
      return;
    }

    if (!currentSession) {
      startNewSession();
    }
    setIsOpen(true);
  };

  const handleSendMessage = async () => {
    if (!hasProAccess()) {
      toast.error('AI Voice Chat is a Pro feature. Upgrade to access this functionality.');
      return;
    }

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
    if (!hasProAccess()) {
      toast.error('Voice input is a Pro feature. Upgrade to access this functionality.');
      return;
    }

    // Auto-send the transcribed message
    if (text.trim()) {
      setTimeout(() => {
        sendMessage(text);
      }, 500);
    }
  };

  const handleUpgrade = async () => {
    await processPayment('pro');
  };

  const quickActions = [
    { text: "Find job opportunities", icon: "💼" },
    { text: "Review my resume", icon: "📄" },
    { text: "Interview tips", icon: "🎯" },
    { text: "Career guidance", icon: "🚀" }
  ];

  return (
    <>
      {/* Chat Toggle Button with Pro Indicator */}
      <motion.div
        className="fixed bottom-6 right-6 z-50"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 1, type: "spring", stiffness: 200 }}
      >
        <Button
          onClick={handleStartChat}
          className={`h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 group relative ${
            hasProAccess() 
              ? 'bg-[#008000] hover:bg-[#218c1b]' 
              : 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600'
          }`}
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
          
          {/* Pro indicator */}
          {hasProAccess() ? (
            <motion.div
              className="absolute -top-1 -right-1 h-4 w-4 bg-green-500 rounded-full flex items-center justify-center"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
            >
              <Volume2 className="h-2 w-2 text-white" />
            </motion.div>
          ) : (
            <motion.div
              className="absolute -top-1 -right-1 h-4 w-4 bg-amber-500 rounded-full flex items-center justify-center"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
            >
              <Crown className="h-2 w-2 text-white" />
            </motion.div>
          )}
        </Button>
      </motion.div>

      {/* Enhanced Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ duration: 0.3 }}
            className="fixed bottom-24 right-6 z-40 w-80 sm:w-96"
          >
            <ExpandableChat
              title="AI Career Assistant"
              icon={<Bot className="h-5 w-5" />}
              className="h-[500px] bg-white border border-[#e6f5ec]/30 shadow-2xl rounded-2xl overflow-hidden"
            >
              {!hasProAccess() ? (
                // Pro Upgrade Prompt
                <div className="h-full flex flex-col">
                  <div className="p-4 border-b border-[#e6f5ec]/30 bg-gradient-to-r from-amber-50 to-orange-50">
                    <div className="flex items-center justify-center mb-2">
                      <Crown className="h-6 w-6 text-amber-500 mr-2" />
                      <Badge variant="secondary" className="bg-amber-100 text-amber-800">
                        Pro Feature
                      </Badge>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-800 text-center">
                      AI Voice Chat Interface
                    </h3>
                  </div>
                  
                  <div className="flex-1 p-4 space-y-4">
                    {/* Pro Features List - Same as Subscription Page */}
                    <div className="space-y-3">
                      <h4 className="font-semibold text-gray-800 text-center">Pro Features Include:</h4>
                      <div className="grid grid-cols-1 gap-2 max-h-32 overflow-y-auto">
                        {[
                          "Advanced search filters",
                          "24/7 AI Career Assistant", 
                          "AI Voice Chat Interface",
                          "ATS-optimized CV generation",
                          "AI-powered application guidance",
                          "Success rate analysis",
                          "Priority email support",
                          "Application tracking & analytics",
                          "Document templates",
                          "Early access to new features"
                        ].map((proFeature, index) => (
                          <div key={index} className="flex items-center space-x-2 text-sm">
                            <Sparkles className="h-4 w-4 text-green-500 flex-shrink-0" />
                            <span className="text-gray-700">{proFeature}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <p className="text-sm text-gray-600 text-center">
                        Unlock the power of voice-enabled AI conversations for career guidance, resume reviews, and interview preparation.
                      </p>
                      
                      <div className="bg-gradient-to-r from-amber-100 to-orange-100 rounded-lg p-3">
                        <p className="text-lg font-bold text-gray-800 text-center">
                          {priceLoading ? "Loading..." : `₦${proPrice.toLocaleString()}`}
                          <span className="text-sm font-normal">/month</span>
                        </p>
                        <p className="text-xs text-gray-600 text-center">Cancel anytime</p>
                      </div>

                      <Button 
                        onClick={handleUpgrade}
                        disabled={isProcessing}
                        className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold"
                      >
                        {isProcessing ? 'Processing...' : 'Upgrade to Pro'}
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                // Pro User Chat Interface
                <div className="h-full flex flex-col">
                  {/* Chat Header */}
                  <div className="p-4 border-b border-[#e6f5ec]/30 bg-gradient-to-r from-white to-[#e6f5ec]/5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Bot className="h-5 w-5 text-[#008000]" />
                        <span className="font-semibold text-gray-800">AI Assistant</span>
                        <Badge variant="default" className="bg-green-500 text-white text-xs">
                          Pro
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowVoiceInterface(!showVoiceInterface)}
                          className="text-gray-600 hover:text-[#008000]"
                        >
                          <Mic className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Voice Interface */}
                  {showVoiceInterface && (
                    <div className="p-3 border-b border-[#e6f5ec]/30 bg-gradient-to-r from-green-50 to-emerald-50">
                      <VoiceInterface
                        onTranscription={handleVoiceTranscription}
                        className="w-full"
                      />
                    </div>
                  )}

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {!currentSession ? (
                      <div className="text-center space-y-4">
                        <div className="flex items-center justify-center">
                          <Sparkles className="h-8 w-8 text-[#008000]" />
                        </div>
                        <p className="text-gray-600">Start a conversation with your AI career assistant!</p>
                        <div className="grid grid-cols-2 gap-2">
                          {quickActions.map((action, index) => (
                            <Button
                              key={index}
                              variant="outline"
                              size="sm"
                              onClick={() => setMessage(action.text)}
                              className="text-xs border-[#e6f5ec]/50 hover:border-[#008000] hover:bg-[#008000]/5"
                            >
                              <span className="mr-1">{action.icon}</span>
                              {action.text}
                            </Button>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <>
                        {currentSession.messages.map((msg, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className={`flex ${msg.message_type === 'user' ? 'justify-end' : 'justify-start'}`}
                          >
                            <div
                              className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                                msg.message_type === 'user'
                                  ? 'bg-[#008000] text-white'
                                  : 'bg-gray-100 text-gray-800'
                              }`}
                            >
                              <div className="flex items-start space-x-2">
                                {msg.message_type === 'assistant' && (
                                  <Bot className="h-4 w-4 mt-0.5 text-[#008000]" />
                                )}
                                {msg.message_type === 'user' && (
                                  <User className="h-4 w-4 mt-0.5 text-white" />
                                )}
                                <span className="text-sm">{msg.content}</span>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                        {loading && (
                          <div className="flex justify-start">
                            <div className="bg-gray-100 rounded-2xl px-4 py-2">
                              <div className="flex items-center space-x-2">
                                <Bot className="h-4 w-4 text-[#008000]" />
                                <div className="flex space-x-1">
                                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                </div>
                              </div>
                            </div>
                          </div>
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
                </div>
              )}
            </ExpandableChat>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ProAIChatWidget;

