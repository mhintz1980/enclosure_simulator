import { useState } from 'react';
import { Card } from '../common';
import { useChat, ChatMessage } from '../../hooks/useChat';

interface ChatPanelProps {
  designMetrics: any;
  optimizationFocus: string;
  setHeatLoad: (value: number) => void;
  setCombustionAirflow: (value: number) => void;
}

export function ChatPanel({
  designMetrics,
  optimizationFocus,
  setHeatLoad,
  setCombustionAirflow,
}: ChatPanelProps) {
  const {
    messages,
    isLoading,
    chatEndRef,
    sendMessage,
  } = useChat();
  const [userPrompt, setUserPrompt] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (userPrompt.trim()) {
      sendMessage(userPrompt, designMetrics, optimizationFocus, setHeatLoad, setCombustionAirflow);
      setUserPrompt('');
    }
  };

  return (
    <Card className="flex flex-col h-[280px] p-0">
      <div className="px-4 py-2.5 border-b border-slate-800 bg-slate-950/40 rounded-t-lg flex items-center justify-between text-xs font-mono text-slate-400">
        <span>🤖 Ventilation & Acoustics Co-Pilot Chat</span>
        <span className={`h-2 w-2 rounded-full ${isLoading ? 'bg-amber-500' : 'bg-emerald-500'} animate-pulse`}></span>
      </div>

      <div className="flex-1 p-4 overflow-y-auto space-y-3 text-xs">
        {messages.map((msg: ChatMessage, i: number) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] rounded p-2.5 leading-relaxed ${
              msg.role === 'user'
                ? 'bg-amber-500 text-slate-950 font-medium'
                : 'bg-slate-950 border border-slate-800 text-slate-300'
            }`}>
              {msg.content}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-slate-950 border border-slate-800 text-slate-400 rounded p-2.5 italic animate-pulse">
              Typing...
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="p-2 border-t border-slate-800 bg-slate-950/20 flex gap-2 rounded-b-lg">
        <input
          type="text"
          value={userPrompt}
          onChange={(e) => setUserPrompt(e.target.value)}
          placeholder="Ask Co-Pilot to audit or tune configuration..."
          className="flex-1 bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-amber-500"
        />
      </form>
    </Card>
  );
}