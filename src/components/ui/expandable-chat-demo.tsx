
"use client"

import { useState, FormEvent } from "react"
import { Send, Bot, Paperclip, Mic, CornerDownLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  ChatBubble,
  ChatBubbleAvatar,
  ChatBubbleMessage,
} from "@/components/ui/chat-bubble"
import { ChatInput } from "@/components/ui/chat-input"
import {
  ExpandableChat,
  ExpandableChatHeader,
  ExpandableChatBody,
  ExpandableChatFooter,
} from "@/components/ui/expandable-chat"
import { ChatMessageList } from "@/components/ui/chat-message-list"

export function ExpandableChatDemo() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      content: "Hello! I'm your AI career assistant. How can I help you with this opportunity today? 🚀",
      sender: "ai",
    },
    {
      id: 2,
      content: "I'd like to know more about the application process and requirements.",
      sender: "user",
    },
    {
      id: 3,
      content: "Great question! I can help you understand the requirements, prepare your application materials, and even provide tips for standing out. What specific aspect would you like to focus on first?",
      sender: "ai",
    },
  ])

  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return

    setMessages((prev) => [
      ...prev,
      {
        id: prev.length + 1,
        content: input,
        sender: "user",
      },
    ])
    setInput("")
    setIsLoading(true)

    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: prev.length + 1,
          content: "I understand your question! Let me provide you with detailed guidance on that topic. Based on the opportunity details, here are my recommendations...",
          sender: "ai",
        },
      ])
      setIsLoading(false)
    }, 1500)
  }

  const handleAttachFile = () => {
    // File attachment functionality
  }

  const handleMicrophoneClick = () => {
    // Voice input functionality
  }

  return (
    <div className="h-[600px] relative">
      <ExpandableChat
        size="lg"
        position="bottom-right"
        icon={<Bot className="h-7 w-7" />}
      >
        <ExpandableChatHeader className="flex-col text-center justify-center">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-gradient-to-r from-[#17cfcf]/20 to-[#e6f5ec]/20 rounded-full">
              <Bot className="h-6 w-6 text-[#17cfcf]" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[#384040]">AI Career Assistant</h1>
              <p className="text-sm text-gray-600">
                Get personalized guidance for this opportunity ✨
              </p>
            </div>
          </div>
        </ExpandableChatHeader>

        <ExpandableChatBody>
          <ChatMessageList>
            {messages.map((message) => (
              <ChatBubble
                key={message.id}
                variant={message.sender === "user" ? "sent" : "received"}
              >
                <ChatBubbleAvatar
                  className="h-10 w-10 shrink-0"
                  src={
                    message.sender === "user"
                      ? "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=64&h=64&q=80&crop=faces&fit=crop"
                      : "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=64&h=64&q=80&crop=faces&fit=crop"
                  }
                  fallback={message.sender === "user" ? "You" : "AI"}
                />
                <ChatBubbleMessage
                  variant={message.sender === "user" ? "sent" : "received"}
                >
                  {message.content}
                </ChatBubbleMessage>
              </ChatBubble>
            ))}

            {isLoading && (
              <ChatBubble variant="received">
                <ChatBubbleAvatar
                  className="h-10 w-10 shrink-0"
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=64&h=64&q=80&crop=faces&fit=crop"
                  fallback="AI"
                />
                <ChatBubbleMessage isLoading />
              </ChatBubble>
            )}
          </ChatMessageList>
        </ExpandableChatBody>

        <ExpandableChatFooter>
          <form
            onSubmit={handleSubmit}
            className="relative rounded-xl border border-[#e6f5ec]/50 bg-white/80 backdrop-blur-sm focus-within:ring-2 focus-within:ring-[#17cfcf]/30 p-2 transition-all duration-200"
          >
            <ChatInput
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask me about this opportunity..."
              className="min-h-12 resize-none rounded-lg bg-transparent border-0 p-3 shadow-none focus-visible:ring-0"
            />
            <div className="flex items-center p-3 pt-0 justify-between">
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  type="button"
                  onClick={handleAttachFile}
                  className="hover:bg-[#17cfcf]/10 rounded-full"
                >
                  <Paperclip className="size-4" />
                </Button>

                <Button
                  variant="ghost"
                  size="icon"
                  type="button"
                  onClick={handleMicrophoneClick}
                  className="hover:bg-[#17cfcf]/10 rounded-full"
                >
                  <Mic className="size-4" />
                </Button>
              </div>
              <Button 
                type="submit" 
                size="sm" 
                className="ml-auto gap-2 bg-gradient-to-r from-[#17cfcf] to-[#17cfcf]/90 hover:from-[#17cfcf]/90 hover:to-[#17cfcf]/80 text-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl px-4"
                disabled={!input.trim() || isLoading}
              >
                Send
                <CornerDownLeft className="size-3.5" />
              </Button>
            </div>
          </form>
        </ExpandableChatFooter>
      </ExpandableChat>
    </div>
  )
}
