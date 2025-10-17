import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, Send, Bot, User, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { chatService, formatTime } from '@/lib/chat';
import type { ChatState } from '../../worker/types';
import { useLanguage } from '@/hooks/use-language';
import { ScrollArea } from './ui/scroll-area';
export function ChatAssistant() {
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [chatState, setChatState] = useState<ChatState>({
    messages: [],
    sessionId: chatService.getSessionId(),
    isProcessing: false,
    model: 'google-ai-studio/gemini-2.5-flash',
    streamingMessage: ''
  });
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatState.messages, chatState.streamingMessage]);
  const loadCurrentSession = async () => {
    const response = await chatService.getMessages();
    if (response.success && response.data) {
      setChatState(prev => ({ ...prev, ...response.data }));
    }
  };
  useEffect(() => {
    if (isOpen) {
      loadCurrentSession();
    }
  }, [isOpen]);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || chatState.isProcessing) return;
    const message = input.trim();
    setInput('');
    const userMessage = { id: crypto.randomUUID(), role: 'user' as const, content: message, timestamp: Date.now() };
    setChatState(prev => ({
      ...prev,
      messages: [...prev.messages, userMessage],
      streamingMessage: '',
      isProcessing: true,
    }));
    await chatService.sendMessage(message, chatState.model, (chunk) => {
      setChatState(prev => ({ ...prev, streamingMessage: (prev.streamingMessage || '') + chunk }));
    });
    await loadCurrentSession();
    setChatState(prev => ({ ...prev, isProcessing: false, streamingMessage: '' }));
  };
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };
  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button className="fixed bottom-8 right-8 rounded-full h-16 w-16 shadow-lg z-50" size="icon">
          <MessageSquare className="h-8 w-8" />
        </Button>
      </SheetTrigger>
      <SheetContent className="w-[400px] sm:w-[540px] flex flex-col p-0">
        <SheetHeader className="p-6 border-b">
          <SheetTitle className="flex items-center gap-2">
            <Bot className="h-6 w-6 text-primary" />
            {t('chat_assistant.title')}
          </SheetTitle>
        </SheetHeader>
        <ScrollArea className="flex-1 p-6">
          <div className="space-y-4">
            {chatState.messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex items-end gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role === 'assistant' && <Bot className="w-6 h-6 text-muted-foreground flex-shrink-0" />}
                <div className={`max-w-[80%] p-3 rounded-lg ${msg.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                  <p className="whitespace-pre-wrap text-sm">{msg.content}</p>
                  <p className="text-xs opacity-70 mt-1">{formatTime(msg.timestamp)}</p>
                </div>
                {msg.role === 'user' && <User className="w-6 h-6 text-muted-foreground flex-shrink-0" />}
              </motion.div>
            ))}
            {chatState.streamingMessage && (
              <div className="flex items-end gap-2 justify-start">
                <Bot className="w-6 h-6 text-muted-foreground flex-shrink-0" />
                <div className="max-w-[80%] p-3 rounded-lg bg-muted">
                  <p className="whitespace-pre-wrap text-sm">{chatState.streamingMessage}<span className="animate-pulse">|</span></p>
                </div>
              </div>
            )}
            {chatState.isProcessing && !chatState.streamingMessage && (
              <div className="flex items-end gap-2 justify-start">
                <Bot className="w-6 h-6 text-muted-foreground flex-shrink-0" />
                <div className="max-w-[80%] p-3 rounded-lg bg-muted flex items-center">
                  <Loader2 className="h-4 w-4 animate-spin" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
        <div className="p-4 border-t bg-background">
          <form onSubmit={handleSubmit} className="flex gap-2 items-center">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={t('chat_assistant.placeholder')}
              className="flex-1 resize-none"
              rows={1}
              disabled={chatState.isProcessing}
            />
            <Button type="submit" disabled={!input.trim() || chatState.isProcessing}>
              <Send className="w-4 h-4" />
            </Button>
          </form>
        </div>
      </SheetContent>
    </Sheet>
  );
}