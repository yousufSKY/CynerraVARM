'use client';

import { useState, useEffect, useRef } from 'react';
import { Bot, Send, Sparkles, Shield, AlertCircle, RefreshCw, MessageSquare, Trash2, Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useChatbot } from '@/hooks/use-chatbot';

interface Conversation {
  id: string;
  title: string;
  lastMessage: string;
  timestamp: string;
  messageCount: number;
}

export default function ChatbotPage() {
  const { 
    messages, 
    conversationId,
    isLoading, 
    error, 
    sendMessage, 
    startNewConversation,
    loadConversationFromStorage,
    clearError
  } = useChatbot();
  
  const [input, setInput] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Load conversations from localStorage
  useEffect(() => {
    const loadConversations = () => {
      const stored = localStorage.getItem('chatConversations');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          setConversations(parsed);
        } catch (err) {
          console.error('Failed to load conversations:', err);
        }
      }
    };
    loadConversations();
  }, []);

  // Save current conversation when messages change
  useEffect(() => {
    if (conversationId && messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      const firstUserMessage = messages.find(m => m.role === 'user');
      
      const conversationTitle = firstUserMessage 
        ? firstUserMessage.content.slice(0, 50) + (firstUserMessage.content.length > 50 ? '...' : '')
        : 'New Conversation';

      // Save the actual messages for this conversation
      localStorage.setItem(`chat_messages_${conversationId}`, JSON.stringify(messages));

      setConversations(prev => {
        const existing = prev.find(c => c.id === conversationId);
        const updated = {
          id: conversationId,
          title: conversationTitle,
          lastMessage: lastMessage.content.slice(0, 100),
          timestamp: new Date().toISOString(),
          messageCount: messages.length
        };

        let newConversations;
        if (existing) {
          newConversations = prev.map(c => c.id === conversationId ? updated : c);
        } else {
          newConversations = [updated, ...prev];
        }

        // Save to localStorage
        localStorage.setItem('chatConversations', JSON.stringify(newConversations));
        return newConversations;
      });
    }
  }, [messages, conversationId]);

  const handleNewChat = () => {
    startNewConversation();
  };

  const handleDeleteConversation = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setConversations(prev => {
      const updated = prev.filter(c => c.id !== id);
      localStorage.setItem('chatConversations', JSON.stringify(updated));
      return updated;
    });
    
    // If deleting current conversation, start new one
    if (id === conversationId) {
      startNewConversation();
    }
  };

  const handleLoadConversation = (id: string) => {
    // Don't reload if already viewing this conversation
    if (id === conversationId) return;
    
    // Load conversation from localStorage
    if (loadConversationFromStorage) {
      loadConversationFromStorage(id);
    } else {
      console.error('loadConversationFromStorage is not available');
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    
    const messageText = input.trim();
    setInput(''); // Clear input immediately
    await sendMessage(messageText);
  };

  const handleSuggestedPrompt = (prompt: string) => {
    setInput(prompt);
  };

  return (
    <DashboardLayout>
      <div className="flex h-[calc(100vh-4rem)] overflow-hidden">
        {/* Sidebar - Conversation History */}
        <div className={`${sidebarOpen ? 'w-72' : 'w-0'} transition-all duration-300 border-r border-slate-800 bg-slate-950/50 flex flex-col overflow-hidden`}>
          {sidebarOpen && (
            <>
              <div className="p-4 border-b border-slate-800">
                <Button
                  onClick={handleNewChat}
                  className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white"
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  New Conversation
                </Button>
              </div>

              <ScrollArea className="flex-1 p-2">
                <div className="space-y-2">
                  {conversations.length === 0 ? (
                    <div className="text-center py-8 text-slate-500 text-sm">
                      <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      No conversations yet
                    </div>
                  ) : (
                    conversations.map((conv) => (
                      <div
                        key={conv.id}
                        onClick={() => handleLoadConversation(conv.id)}
                        className={`p-3 rounded-lg cursor-pointer group transition-all ${
                          conversationId === conv.id
                            ? 'bg-cyan-500/20 border border-cyan-500/30'
                            : 'bg-slate-900/50 hover:bg-slate-800/70 border border-transparent'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <h3 className="text-sm font-medium text-white truncate">
                              {conv.title}
                            </h3>
                            <p className="text-xs text-slate-400 truncate mt-1">
                              {conv.lastMessage}
                            </p>
                            <div className="flex items-center gap-2 mt-2 text-xs text-slate-500">
                              <Clock className="h-3 w-3" />
                              {new Date(conv.timestamp).toLocaleDateString()}
                              <span>·</span>
                              <span>{conv.messageCount} messages</span>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => handleDeleteConversation(conv.id, e)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0 text-red-400 hover:text-red-300 hover:bg-red-500/10"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </>
          )}
        </div>

        {/* Toggle Sidebar Button */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="absolute top-20 left-0 z-10 bg-slate-800 hover:bg-slate-700 text-slate-300 p-2 rounded-r-lg border border-l-0 border-slate-700"
        >
          {sidebarOpen ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        </button>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="p-4 sm:p-6 border-b border-slate-800 bg-slate-950/50">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                  <Bot className="h-6 w-6 text-cyan-400" />
                  AI Assistant
                </h1>
                <p className="text-gray-400 text-sm">
                  Security-focused AI powered by GPT-4o. Ask about scans, vulnerabilities, or remediation strategies.
                </p>
              </div>
              <Badge className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white border-0">
                🤖 AI Powered
              </Badge>
            </div>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="px-6 pt-4">
              <Alert className="bg-red-500/10 border-red-500/30">
                <AlertCircle className="h-4 w-4 text-red-400" />
                <AlertDescription className="text-red-400 text-sm">
                  {error}
                </AlertDescription>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearError}
                  className="ml-auto text-red-400 hover:text-red-300"
                >
                  Dismiss
                </Button>
              </Alert>
            </div>
          )}

          {/* Chat Messages Area */}
          <ScrollArea className="flex-1 px-6 py-4">
            <div className="max-w-4xl mx-auto space-y-4">
                {messages.length === 0 ? (
                  <div className="h-full flex items-center justify-center py-12">
                    <div className="max-w-2xl w-full">
                      <div className="text-center mb-8">
                        <Bot className="h-16 w-16 text-cyan-400 mx-auto mb-4" />
                        <h3 className="text-2xl font-semibold text-white mb-2">
                          Welcome to Cynerra AI Assistant
                        </h3>
                        <p className="text-slate-400 text-sm">
                          Your AI-powered security expert. Ask me anything about vulnerabilities, scan results, or security best practices.
                        </p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
                        {[
                          { icon: Shield, text: "What are my most critical vulnerabilities?", color: "text-red-400" },
                          { icon: Sparkles, text: "Explain my current risk score", color: "text-yellow-400" },
                          { icon: AlertCircle, text: "How do I fix the SSH vulnerability?", color: "text-orange-400" },
                          { icon: Bot, text: "Show me my most critical security issues", color: "text-cyan-400" }
                        ].map((prompt, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleSuggestedPrompt(prompt.text)}
                            className="p-4 rounded-lg bg-slate-800/50 border border-slate-700/70 hover:bg-slate-700/70 hover:border-cyan-500/30 transition-all text-left group"
                          >
                            <prompt.icon className={`h-5 w-5 mb-2 ${prompt.color}`} />
                            <p className="text-sm text-slate-200 group-hover:text-white">
                              {prompt.text}
                            </p>
                          </button>
                        ))}
                      </div>

                      <div className="bg-slate-800/30 border border-slate-700/50 rounded-lg p-4">
                        <h4 className="text-xs font-semibold text-slate-400 mb-2 flex items-center gap-2">
                          <Sparkles className="h-4 w-4" />
                          What I Can Help With:
                        </h4>
                        <ul className="text-xs text-slate-400 space-y-1 ml-6">
                          <li>• Vulnerability analysis & CVE explanations</li>
                          <li>• Scan results interpretation</li>
                          <li>• Remediation guidance & best practices</li>
                          <li>• Risk assessment & prioritization</li>
                          <li>• Security concepts & compliance questions</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
                    {messages.map((msg, idx) => (
                      <div
                        key={idx}
                        className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className="max-w-[85%]">
                          {msg.role === 'assistant' && (
                            <div className="flex items-center gap-2 mb-1 ml-2">
                              <Bot className="h-4 w-4 text-cyan-400" />
                              <span className="text-xs text-slate-400">Cynerra AI</span>
                            </div>
                          )}
                          <div
                            className={`rounded-2xl px-4 py-3 text-sm ${
                              msg.role === 'user'
                                ? 'bg-gradient-to-r from-cyan-600/20 to-blue-600/20 text-cyan-50 border border-cyan-500/30'
                                : 'bg-slate-800 text-slate-100 border border-slate-700/70 whitespace-pre-wrap'
                            }`}
                          >
                            {msg.content}
                          </div>
                          {msg.timestamp && (
                            <div className="text-xs text-slate-500 mt-1 ml-2">
                              {new Date(msg.timestamp).toLocaleTimeString()}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                    {isLoading && (
                      <div className="flex justify-start">
                        <div className="max-w-[85%]">
                          <div className="flex items-center gap-2 mb-1 ml-2">
                            <Bot className="h-4 w-4 text-cyan-400" />
                            <span className="text-xs text-slate-400">Cynerra AI</span>
                          </div>
                          <div className="rounded-2xl px-4 py-3 text-sm bg-slate-800 text-slate-100 border border-slate-700/70">
                            <div className="flex items-center gap-2">
                              <div className="flex gap-1">
                                <span className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                                <span className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                                <span className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                              </div>
                              <span className="text-slate-400">Analyzing...</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </>
                )}
            </div>
          </ScrollArea>

          {/* Input Section - Fixed at bottom */}
          <div className="border-t border-slate-800 bg-slate-950/50 p-4">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center gap-2">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  placeholder="Ask about scans, vulnerabilities, remediation steps..."
                  className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 h-12 text-sm"
                  disabled={isLoading}
                  maxLength={2000}
                />
                <Button 
                  onClick={handleSend} 
                  disabled={isLoading || !input.trim()} 
                  className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white border-0 h-12 px-6"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-xs text-slate-500">
                  Press Enter to send, Shift+Enter for new line
                </p>
                {input.length > 1800 && (
                  <p className="text-xs text-yellow-400">
                    {2000 - input.length} chars left
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

