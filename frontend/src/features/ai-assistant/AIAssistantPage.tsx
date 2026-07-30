import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Paper,
  Chip,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  Divider,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Send as SendIcon,
  Psychology as AIIcon,
  LightbulbOutlined as SuggestionIcon,
  Clear as ClearIcon,
  Person as PersonIcon,
} from '@mui/icons-material';

interface Message {
  id: string;
  type: 'user' | 'assistant';
  text: string;
  timestamp: string;
  result?: any;
}

const AIAssistantPage: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [examples, setExamples] = useState<any>(null);
  const messagesEndRef = useRef<null | HTMLDivElement>(null);

  useEffect(() => {
    fetchExamples();
    // Add welcome message
    setMessages([{
      id: '0',
      type: 'assistant',
      text: 'Hello! I\'m your AI assistant. Ask me anything about attendance, cameras, departments, or recognition performance. Try one of the example queries below!',
      timestamp: new Date().toISOString()
    }]);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchExamples = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/v1/ai-assistant/examples');
      const data = await response.json();
      setExamples(data);
    } catch (error) {
      console.error('Error fetching examples:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      text: input,
      timestamp: new Date().toISOString()
    };

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

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        text: data.success ? (data.result?.summary || 'Query processed successfully') : (data.error || 'Failed to process query'),
        timestamp: data.timestamp,
        result: data.result
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        text: 'Sorry, I encountered an error processing your request.',
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion);
  };

  const handleClearChat = () => {
    setMessages([{
      id: '0',
      type: 'assistant',
      text: 'Chat cleared. How can I help you?',
      timestamp: new Date().toISOString()
    }]);
  };

  const renderResult = (result: any) => {
    if (!result) return null;

    return (
      <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.100', borderRadius: 2 }}>
        {result.type === 'late_arrivals' && (
          <Box>
            <Typography variant="subtitle2" color="primary" gutterBottom>
              Late Arrivals ({result.count})
            </Typography>
            {result.employees?.slice(0, 5).map((emp: any) => (
              <Box key={emp.id} sx={{ mb: 1 }}>
                <Typography variant="body2">
                  <strong>{emp.name}</strong> - {emp.arrival_time} ({emp.minutes_late} min late)
                </Typography>
              </Box>
            ))}
            {result.employees?.length > 5 && (
              <Typography variant="body2" color="textSecondary">
                ... and {result.employees.length - 5} more
              </Typography>
            )}
          </Box>
        )}

        {result.type === 'absences' && (
          <Box>
            <Typography variant="subtitle2" color="error" gutterBottom>
              Absent Employees ({result.count})
            </Typography>
            {result.employees?.slice(0, 5).map((emp: any) => (
              <Box key={emp.id} sx={{ mb: 1 }}>
                <Typography variant="body2">
                  <strong>{emp.name}</strong> - Last seen: {emp.last_seen}
                </Typography>
              </Box>
            ))}
          </Box>
        )}

        {result.type === 'camera_accuracy' && (
          <Box>
            <Typography variant="subtitle2" color="warning.main" gutterBottom>
              Camera Performance
            </Typography>
            {result.cameras?.slice(0, 3).map((cam: any) => (
              <Box key={cam.id} sx={{ mb: 1 }}>
                <Typography variant="body2">
                  <strong>{cam.name}</strong>: {cam.average_confidence}% confidence
                  <Chip 
                    label={cam.performance_rating} 
                    size="small" 
                    color={cam.performance_rating === 'Excellent' ? 'success' : 'warning'}
                    sx={{ ml: 1 }}
                  />
                </Typography>
              </Box>
            ))}
          </Box>
        )}

        {result.type === 'department_statistics' && (
          <Box>
            <Typography variant="subtitle2" color="success.main" gutterBottom>
              Department Performance
            </Typography>
            {result.departments?.slice(0, 3).map((dept: any) => (
              <Box key={dept.id} sx={{ mb: 1 }}>
                <Typography variant="body2">
                  <strong>{dept.name}</strong>: {dept.attendance_rate}% attendance rate
                </Typography>
              </Box>
            ))}
          </Box>
        )}

        {result.type === 'failed_recognitions' && (
          <Box>
            <Typography variant="subtitle2" color="error" gutterBottom>
              Failed Recognitions ({result.count})
            </Typography>
            {result.failures?.slice(0, 5).map((failure: any) => (
              <Box key={failure.id} sx={{ mb: 1 }}>
                <Typography variant="body2">
                  {failure.user_name} - {failure.date} ({failure.confidence}%)
                </Typography>
              </Box>
            ))}
          </Box>
        )}
      </Box>
    );
  };

  return (
    <Box sx={{ p: 3, height: 'calc(100vh - 120px)', display: 'flex', flexDirection: 'column' }}>
      <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <AIIcon color="primary" />
        AI Assistant
      </Typography>
      <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
        Ask natural language questions about your attendance system
      </Typography>

      <Box sx={{ display: 'flex', gap: 3, flex: 1, overflow: 'hidden' }}>
        {/* Chat Area */}
        <Card sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column', p: 0 }}>
            {/* Messages */}
            <Box sx={{ flex: 1, overflowY: 'auto', p: 3 }}>
              {messages.map((message) => (
                <Box
                  key={message.id}
                  sx={{
                    display: 'flex',
                    justifyContent: message.type === 'user' ? 'flex-end' : 'flex-start',
                    mb: 2
                  }}
                >
                  <Paper
                    sx={{
                      p: 2,
                      maxWidth: '70%',
                      bgcolor: message.type === 'user' ? 'primary.main' : 'grey.100',
                      color: message.type === 'user' ? 'white' : 'text.primary'
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      {message.type === 'assistant' ? <AIIcon fontSize="small" /> : <PersonIcon fontSize="small" />}
                      <Typography variant="caption">
                        {message.type === 'assistant' ? 'AI Assistant' : 'You'}
                      </Typography>
                    </Box>
                    <Typography variant="body1">{message.text}</Typography>
                    {message.result && renderResult(message.result)}
                    <Typography variant="caption" sx={{ mt: 1, display: 'block', opacity: 0.7 }}>
                      {new Date(message.timestamp).toLocaleTimeString()}
                    </Typography>
                  </Paper>
                </Box>
              ))}
              {loading && (
                <Box sx={{ display: 'flex', justifyContent: 'flex-start', mb: 2 }}>
                  <Paper sx={{ p: 2, bgcolor: 'grey.100' }}>
                    <CircularProgress size={20} />
                    <Typography variant="body2" sx={{ ml: 2, display: 'inline' }}>
                      Thinking...
                    </Typography>
                  </Paper>
                </Box>
              )}
              <div ref={messagesEndRef} />
            </Box>

            <Divider />

            {/* Input Area */}
            <Box sx={{ p: 2, display: 'flex', gap: 1 }}>
              <TextField
                fullWidth
                placeholder="Ask me anything... (e.g., 'Who arrived late today?')"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                disabled={loading}
              />
              <Button
                variant="contained"
                onClick={handleSendMessage}
                disabled={loading || !input.trim()}
                endIcon={<SendIcon />}
              >
                Send
              </Button>
              <Tooltip title="Clear chat">
                <IconButton onClick={handleClearChat} color="error">
                  <ClearIcon />
                </IconButton>
              </Tooltip>
            </Box>
          </CardContent>
        </Card>

        {/* Sidebar with Examples */}
        <Card sx={{ width: 350, overflowY: 'auto' }}>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <SuggestionIcon color="primary" />
              Example Queries
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
              Click any example to try it
            </Typography>

            {examples && Object.entries(examples.categories).map(([category, queries]: [string, any]) => (
              <Box key={category} sx={{ mb: 3 }}>
                <Typography variant="subtitle2" color="primary" gutterBottom>
                  {category}
                </Typography>
                <List dense>
                  {queries.map((query: string, index: number) => (
                    <ListItem
                      key={index}
                      button
                      onClick={() => handleSuggestionClick(query)}
                      sx={{ 
                        borderRadius: 1, 
                        mb: 0.5,
                        '&:hover': { bgcolor: 'primary.light', color: 'white' }
                      }}
                    >
                      <ListItemText
                        primary={query}
                        primaryTypographyProps={{ variant: 'body2' }}
                      />
                    </ListItem>
                  ))}
                </List>
              </Box>
            ))}

            {examples && (
              <Box sx={{ mt: 3, p: 2, bgcolor: 'info.light', borderRadius: 1 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Tips
                </Typography>
                {examples.tips.map((tip: string, index: number) => (
                  <Typography key={index} variant="body2" sx={{ mb: 1 }}>
                    • {tip}
                  </Typography>
                ))}
              </Box>
            )}
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};

export default AIAssistantPage;
