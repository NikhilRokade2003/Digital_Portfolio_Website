import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { chatbotAPI, portfolioAPI } from '../../services/api';
import Navigation from '../components/Navigation';

const ChatbotInterface = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [currentFlow, setCurrentFlow] = useState(null); // Track conversation flow
  const [userPortfolios, setUserPortfolios] = useState([]);
  const vantaRef = useRef(null);
  const vantaEffect = useRef(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Initialize Vanta.js NET effect
  useEffect(() => {
    if (vantaRef.current && window.VANTA) {
      vantaEffect.current = window.VANTA.NET({
        el: vantaRef.current,
        mouseControls: true,
        touchControls: true,
        gyroControls: false,
        minHeight: 200.00,
        minWidth: 200.00,
        scale: 1.00,
        scaleMobile: 1.00,
        color: 0x3b82f6,
        backgroundColor: 0x0f172a,
        points: 15.00,
        maxDistance: 25.00,
        spacing: 18.00
      });
    }

    return () => {
      if (vantaEffect.current) {
        vantaEffect.current.destroy();
      }
    };
  }, []);

  useEffect(() => {
    // Load conversation history
    loadHistory();
    // Add welcome message
    const welcomeMessage = {
      id: 'welcome',
      content: "Hi! I'm your AI Portfolio Assistant. I can help you create, improve, and manage your portfolio. How can I assist you today?",
      isBot: true,
      timestamp: new Date().toISOString()
    };
    setMessages([welcomeMessage]);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadHistory = async () => {
    try {
      const response = await chatbotAPI.getConversationHistory();
      if (response.data && response.data.length > 0) {
        setMessages(response.data.map(msg => ({
          id: msg.id,
          content: msg.content,
          isBot: msg.isBot,
          timestamp: msg.timestamp
        })));
      }
    } catch (error) {
      // Handle missing history endpoint gracefully
      if (error.response?.status === 404) {
        // Chat history endpoint not available - starting fresh
      } else {
        console.error('Error loading chat history:', error);
      }
      // Don't show error to user for missing history - just start fresh
    }
  };

  // Handle quick actions and routing
  const handleQuickActions = async (message) => {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('create a new portfolio') || lowerMessage.includes('create portfolio')) {
      const botMessage = {
        id: Date.now().toString(),
        content: `🚀 Perfect! I'll take you to the portfolio creation page where you can build your professional portfolio step by step.`,
        isBot: true,
        timestamp: new Date().toISOString()
      };
      
      setMessages(prev => [...prev, botMessage]);
      
      // Navigate after a short delay for better UX
      setTimeout(() => {
        navigate('/portfolio/create');
      }, 1500);
      
      return { shouldRoute: true };
    }
    
    return { shouldRoute: false };
  };

  // Get AI response for various queries
  const getAIResponse = async (message) => {
    const lowerMessage = message.toLowerCase();
    
    // Determine the type of request and provide specialized responses
    if (lowerMessage.includes('improve') && lowerMessage.includes('portfolio')) {
      return await handlePortfolioImprovement(message);
    } else if (lowerMessage.includes('project description') || lowerMessage.includes('generate project')) {
      return await handleProjectGeneration(message);
    } else if (lowerMessage.includes('skills') || lowerMessage.includes('suggest skills')) {
      return await handleSkillSuggestions(message);
    } else if (lowerMessage.includes('review') && lowerMessage.includes('portfolio')) {
      return await handlePortfolioReview(message);
    } else {
      // General chat
      const response = await chatbotAPI.sendMessage(message);
      return { response: response.data.response || `I apologize, but I couldn't process your request at the moment.`, options: [] };
    }
  };

  // Portfolio improvement suggestions
  const handlePortfolioImprovement = async (message) => {
    try {
      // Get user's portfolios for context
      const portfolios = await portfolioAPI.getMyPortfolios();
      setUserPortfolios(portfolios.data || []);
      
      if (!portfolios.data || portfolios.data.length === 0) {
        return {
          response: `📝 I notice you don't have any portfolios yet. Here are some general tips to get started:

• Start with a clear, professional headline
• Add a compelling summary that highlights your key strengths
• Include your best projects with detailed descriptions
• List relevant skills and technologies
• Add your educational background and work experience
• Use a clean, professional design

Would you like me to guide you through creating your first portfolio?`,
          options: ['Create my first portfolio', 'Get more tips']
        };
      }
      
      // Analyze existing portfolio and provide AI suggestions
      const portfolioData = portfolios.data[0]; // Analyze first portfolio
      const analysisPrompt = `Analyze this portfolio and suggest improvements: ${JSON.stringify(portfolioData)}`;
      
      const response = await chatbotAPI.sendMessage(analysisPrompt);
      
      return {
        response: `✨ Based on your portfolio analysis, here are my recommendations:

${response.data.response}

Would you like specific suggestions for any particular section?`,
        options: ['Improve projects', 'Enhance skills', 'Better summary', 'Design tips']
      };
    } catch (error) {
      return {
        response: `✨ Here are some general portfolio improvement tips:

• **Professional Summary**: Write a compelling 2-3 sentence summary highlighting your expertise
• **Project Showcases**: Include 3-5 best projects with live demos and code repositories
• **Skills Section**: List technical skills relevant to your target roles
• **Experience**: Quantify your achievements with specific metrics
• **Contact Information**: Make it easy for recruiters to reach you

What specific area would you like to focus on improving?`,
        options: ['Projects', 'Skills', 'Experience', 'Design']
      };
    }
  };

  // Project description generation
  const handleProjectGeneration = async (message) => {
    setCurrentFlow('project-generation');
    
    return {
      response: `📝 I'll help you create compelling project descriptions! Please provide me with:

1. **Project name**
2. **Technologies used** (e.g., React, Node.js, MongoDB)
3. **Main purpose/problem it solves**
4. **Key features** (2-3 main features)
5. **Your role** in the project

You can provide all details in one message or step by step.`,
      options: ['I have all details ready', 'Guide me step by step']
    };
  };

  // Skill suggestions
  const handleSkillSuggestions = async (message) => {
    const currentYear = new Date().getFullYear();
    
    return {
      response: `🎯 Here are the most in-demand skills for ${currentYear}:

**Frontend Development:**
• React.js, Next.js, Vue.js
• TypeScript, JavaScript ES6+
• Tailwind CSS, Styled Components

**Backend Development:**
• Node.js, Python, Java
• Express.js, FastAPI, Spring Boot
• REST APIs, GraphQL

**Database & Cloud:**
• MongoDB, PostgreSQL, Redis
• AWS, Azure, Docker
• Kubernetes, CI/CD

**Emerging Technologies:**
• AI/ML Integration
• Web3, Blockchain
• Progressive Web Apps

What's your current focus area? I can provide more specific recommendations.`,
      options: ['Frontend skills', 'Backend skills', 'Full-stack path', 'Emerging tech']
    };
  };

  // Portfolio review
  const handlePortfolioReview = async (message) => {
    try {
      const portfolios = await portfolioAPI.getMyPortfolios();
      
      if (!portfolios.data || portfolios.data.length === 0) {
        return {
          response: `📋 I don't see any portfolios to review yet. Create your first portfolio and I'll provide a comprehensive analysis!

Would you like to start creating one now?`,
          options: ['Create portfolio now', 'Get portfolio tips first']
        };
      }
      
      const portfolio = portfolios.data[0];
      const reviewPrompt = `Please review this portfolio and rate each section (Summary, Projects, Skills, Experience, Education) on a scale of 1-10 and provide specific improvement suggestions: ${JSON.stringify(portfolio)}`;
      
      const response = await chatbotAPI.sendMessage(reviewPrompt);
      
      return {
        response: `👀 **Portfolio Review Results:**

${response.data.response}

Would you like detailed suggestions for any specific section?`,
        options: ['Improve weakest section', 'Overall optimization tips', 'Compare with industry standards']
      };
    } catch (error) {
      return {
        response: `👀 **Portfolio Review Checklist:**

✅ **Professional Summary** (Weight: 20%)
• Clear value proposition
• Target audience focused

✅ **Projects Section** (Weight: 35%)
• 3-5 quality projects
• Live demos & source code
• Technical details

✅ **Skills Section** (Weight: 20%)
• Relevant to target roles
• Properly categorized

✅ **Experience** (Weight: 15%)
• Quantified achievements
• Relevant responsibilities

✅ **Design & UX** (Weight: 10%)
• Clean, professional layout
• Mobile responsive
• Fast loading

Create a portfolio to get a personalized review!`,
        options: ['Create portfolio for review', 'Get design tips', 'Industry benchmarks']
      };
    }
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = {
      id: Date.now().toString(),
      content: inputMessage,
      isBot: false,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    const messageToProcess = inputMessage;
    setInputMessage('');
    setIsLoading(true);
    setIsTyping(true);

    try {
      // Handle quick actions with immediate routing
      const response = await handleQuickActions(messageToProcess);
      if (response.shouldRoute) {
        setIsTyping(false);
        setIsLoading(false);
        return;
      }

      // For other messages, get AI response
      const aiResponse = await getAIResponse(messageToProcess);
      
      setIsTyping(false);
      
      const botMessage = {
        id: (Date.now() + 1).toString(),
        content: aiResponse.response,
        isBot: true,
        timestamp: new Date().toISOString(),
        options: aiResponse.options
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      setIsTyping(false);
      
      const errorMessage = {
        id: (Date.now() + 1).toString(),
        content: 'I apologize, but I\'m having trouble connecting right now. Please try again later.',
        isBot: true,
        timestamp: new Date().toISOString()
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearHistory = async () => {
    try {
      // Clear the UI immediately for better UX
      setMessages([]);
      setInputMessage('');
      setIsLoading(false);
      setIsTyping(false);
      
      // Clear server-side history
      await chatbotAPI.clearHistory();
      
      // Add fresh welcome message
      const welcomeMessage = {
        id: 'welcome-' + Date.now(),
        content: "Hi! I'm your AI Portfolio Assistant. I can help you create, improve, and manage your portfolio. How can I assist you today?",
        isBot: true,
        timestamp: new Date().toISOString()
      };
      setMessages([welcomeMessage]);
      
      // Focus the input for better UX
      if (inputRef.current) {
        inputRef.current.focus();
      }
    } catch (error) {
      console.error('Error clearing history:', error);
      // Even if server clear fails, reset local state
      const welcomeMessage = {
        id: 'welcome-' + Date.now(),
        content: "Hi! I'm your AI Portfolio Assistant. I can help you create, improve, and manage your portfolio. How can I assist you today?",
        isBot: true,
        timestamp: new Date().toISOString()
      };
      setMessages([welcomeMessage]);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const quickActions = [
    { text: "Create a new portfolio", icon: "💼" },
    { text: "Help me improve my portfolio", icon: "✨" },
    { text: "Generate project descriptions", icon: "📝" },
    { text: "Suggest skills to add", icon: "🎯" },
    { text: "Review my portfolio", icon: "👀" },
    { text: "Create portfolio sections", icon: "📋" }
  ];

  return (
    <div className="min-h-screen relative overflow-hidden" ref={vantaRef}>
      <Navigation />
      {/* Enhanced Animated Background Elements */}
      <div className="absolute inset-0 z-1 pointer-events-none">
        <div className="live-wallpaper-shape live-wallpaper-1 opacity-20"></div>
        <div className="live-wallpaper-shape live-wallpaper-2 opacity-15"></div>
        <div className="live-wallpaper-shape live-wallpaper-3 opacity-20"></div>
        <div className="floating-particles opacity-30">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="particle"></div>
          ))}
        </div>
        <div className="aurora opacity-25"></div>
      </div>
      
      <div className="relative z-10 max-w-4xl mx-auto h-full flex flex-col main-content">
        
        {/* Header */}
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-primary-500 to-accent-500 rounded-full flex items-center justify-center text-white text-xl shadow-glow">
                🤖
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">AI Portfolio Assistant</h1>
                <p className="text-white/60">Powered by OpenAI</p>
              </div>
            </div>
            
            <button
              onClick={clearHistory}
              className="glass-button hover-lift"
            >
              <span className="mr-2">🗑️</span>
              Clear Chat
            </button>
          </div>
        </div>

        {/* Messages Container */}
        <div className="flex-1 overflow-hidden flex flex-col">
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.isBot ? 'justify-start' : 'justify-end'}`}
              >
                <div className={`flex items-start space-x-3 max-w-[80%] ${message.isBot ? 'flex-row' : 'flex-row-reverse space-x-reverse'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm shadow-glow ${
                    message.isBot 
                      ? 'bg-gradient-to-r from-primary-500 to-accent-500' 
                      : 'bg-gradient-to-r from-green-500 to-blue-500'
                  }`}>
                    {message.isBot ? '🤖' : '👤'}
                  </div>
                  
                  <div className="flex flex-col space-y-2">
                    <div className={`rounded-2xl px-4 py-3 ${
                      message.isBot 
                        ? 'bg-white/10 text-white' 
                        : 'bg-gradient-to-r from-primary-500 to-accent-500 text-white'
                    } backdrop-blur-sm border border-white/20`}>
                      <p className="whitespace-pre-wrap">{message.content}</p>
                      <p className={`text-xs mt-2 ${
                        message.isBot ? 'text-white/50' : 'text-white/70'
                      }`}>
                        {formatTime(message.timestamp)}
                      </p>
                    </div>
                    
                    {/* Option buttons for bot messages */}
                    {message.isBot && message.options && message.options.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {message.options.map((option, index) => (
                          <button
                            key={index}
                            onClick={() => setInputMessage(option)}
                            className="px-3 py-1 bg-white/10 text-white text-sm rounded-lg border border-white/20 hover:bg-white/20 transition-colors backdrop-blur-sm"
                          >
                            {option}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex justify-start">
                <div className="flex items-start space-x-3 max-w-[80%]">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-primary-500 to-accent-500 flex items-center justify-center text-white text-sm shadow-glow">
                    🤖
                  </div>
                  <div className="bg-white/10 rounded-2xl px-4 py-3 backdrop-blur-sm border border-white/20">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Actions */}
          {messages.length <= 1 && (
            <div className="px-6 py-4 border-t border-white/10">
              <p className="text-white/60 text-sm mb-3">Quick actions:</p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {quickActions.map((action, index) => (
                  <button
                    key={index}
                    onClick={() => setInputMessage(action.text)}
                    className="glass-card p-3 text-left hover-lift text-sm text-white/80 hover:text-white transition-colors"
                  >
                    <div className="flex items-center space-x-2">
                      <span>{action.icon}</span>
                      <span className="truncate">{action.text}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input Area */}
          <div className="p-6 border-t border-white/10">
            <div className="flex space-x-4">
              <div className="flex-1 relative">
                <textarea
                  ref={inputRef}
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your message here... (Press Enter to send, Shift+Enter for new line)"
                  className="w-full p-4 pr-12 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none backdrop-blur-sm"
                  rows="1"
                  style={{ minHeight: '56px', maxHeight: '120px' }}
                  disabled={isLoading}
                />
                <div className="absolute right-3 bottom-3 text-white/40">
                  <span className="text-xs">
                    {inputMessage.length}/1000
                  </span>
                </div>
              </div>
              
              <button
                onClick={sendMessage}
                disabled={!inputMessage.trim() || isLoading}
                className="px-6 py-3 bg-gradient-to-r from-primary-500 to-accent-500 text-white rounded-xl hover:shadow-glow transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {isLoading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                ) : (
                  <>
                    <span>Send</span>
                    <span>📤</span>
                  </>
                )}
              </button>
            </div>
            
            <p className="text-white/40 text-xs mt-2 text-center">
              AI responses may contain errors. Always review generated content.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatbotInterface;