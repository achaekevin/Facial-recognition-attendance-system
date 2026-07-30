import React, { useState } from 'react';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Card } from '../../components/ui/Card';
import { Send, Bot, User, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

const AIAssistantPage: React.FC = () => {
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const exampleQueries = [
    "Who was late today?",
    "Show me absences this week",
    "What's the camera accuracy?",
    "List department attendance",
    "Show recognition failures",
    "Attendance trends last month"
  ];

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch('http://localhost:8000/api/v1/ai-assistant/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: input })
      });
      const data = await response.json();
      
      setMessages(prev => [...prev, { role: 'assistant', content: data.answer, data: data.data }]);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to get response');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
          <Bot className="w-6 h-6 text-primary" /> AI Assistant
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Ask questions about attendance data in natural language
        </p>
      </div>

      {messages.length === 0 && (
        <Card>
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-5 h-5 text-primary" />
            <h3 className="font-semibold text-slate-900 dark:text-white">Try asking:</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {exampleQueries.map((query, idx) => (
              <button
                key={idx}
                onClick={() => setInput(query)}
                className="text-left p-3 rounded-lg border border-slate-200 dark:border-slate-800 hover:border-primary hover:bg-primary/5 transition-colors text-sm text-slate-700 dark:text-slate-300"
              >
                {query}
              </button>
            ))}
          </div>
        </Card>
      )}

      <div className="space-y-4">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
            {msg.role === 'assistant' && (
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4 text-primary" />
              </div>
            )}
            <div className={`max-w-2xl ${msg.role === 'user' ? 'bg-primary text-white' : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800'} rounded-2xl p-4`}>
              <p className={`text-sm ${msg.role === 'user' ? 'text-white' : 'text-slate-700 dark:text-slate-300'}`}>
                {msg.content}
              </p>
              {msg.data && (
                <div className="mt-3 space-y-2">
                  {Array.isArray(msg.data) && msg.data.map((item: any, i: number) => (
                    <div key={i} className="text-xs p-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                      {JSON.stringify(item)}
                    </div>
                  ))}
                </div>
              )}
            </div>
            {msg.role === 'user' && (
              <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center shrink-0">
                <User className="w-4 h-4 text-slate-600 dark:text-slate-400" />
              </div>
            )}
          </div>
        ))}
        {loading && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4 text-primary" />
            </div>
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            </div>
          </div>
        )}
      </div>

      <Card>
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Ask a question about attendance..."
            className="flex-1 px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <Button 
            variant="primary" 
            onClick={handleSendMessage}
            disabled={loading || !input.trim()}
            leftIcon={<Send className="w-4 h-4" />}
          >
            Send
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default AIAssistantPage;
