import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const initialMessages = [
  { 
    sender: "bot", 
    text: "Hi! Welcome to Portfoliofy! How can I help you today?", 
    options: [
      "1. Create Portfolio",
      "2. View Portfolio", 
      "3. Update Portfolio",
      "4. Get Info"
    ] 
  }
];

export default function Chatbot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState(initialMessages);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);

  const handleSend = async (e, overrideInput) => {
    if (e) e.preventDefault();
    const userMessage = overrideInput !== undefined ? overrideInput : input;
    if (!userMessage.trim()) return;
    setInput("");
    
    // Check if user is greeting to show menu
    const greetings = ['hi', 'hello', 'hey', 'hii', 'helo', 'start', 'menu'];
    const isGreeting = greetings.some(greeting => 
      userMessage.toLowerCase().trim().includes(greeting)
    );
    
    setMessages((msgs) => [
      ...msgs,
      { sender: "user", text: userMessage }
    ]);
    
    // Show menu for greetings
    if (isGreeting) {
      setMessages((msgs) => [
        ...msgs,
        { 
          sender: "bot", 
          text: "Hello! Welcome to Portfoliofy! Please choose what you'd like to do:", 
          options: [
            "1. Create Portfolio",
            "2. View Portfolio", 
            "3. Update Portfolio",
            "4. Get Info"
          ] 
        }
      ]);
      return;
    }
    
    setIsLoading(true);

    try {
      // Prepare conversation history for backend
      const conversation = messages
        .filter(m => m.sender === "user" || m.sender === "bot")
        .map(m => ({
          role: m.sender === "user" ? "user" : "assistant",
          content: m.text
        }));
      // Add current user message
      conversation.push({ role: "user", content: userMessage });

      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5163/api'}/chatbot/ask-with-options`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ messages: conversation }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      setMessages((msgs) => [
        ...msgs,
        { sender: "bot", text: data.response || "No response", options: data.options && data.options.length > 0 ? data.options : undefined }
      ]);

      // Handle action redirects
      if (data.action && data.action.type === "redirect" && data.action.path) {
        navigate(data.action.path);
      }

    } catch (error) {
      console.error("Error sending message:", error);
      setMessages((msgs) => [
        ...msgs,
        { sender: "bot", text: "Sorry, I'm having trouble responding right now. Please try again later." }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOptionClick = (option) => {
    // Handle direct navigation for menu options without backend call
    if (option === "1. Create Portfolio") {
      setMessages((msgs) => [
        ...msgs,
        { sender: "user", text: option },
        { sender: "bot", text: "Redirecting you to create your portfolio..." }
      ]);
      setTimeout(() => navigate("/portfolio/create"), 1000);
      return;
    }
    
    if (option === "2. View Portfolio") {
      setMessages((msgs) => [
        ...msgs,
        { sender: "user", text: option },
        { sender: "bot", text: "Redirecting you to browse portfolios..." }
      ]);
      setTimeout(() => navigate("/portfolios"), 1000);
      return;
    }
    
    if (option === "3. Update Portfolio") {
      setMessages((msgs) => [
        ...msgs,
        { sender: "user", text: option },
        { sender: "bot", text: "Redirecting you to your dashboard to select and edit your portfolio..." }
      ]);
      setTimeout(() => navigate("/dashboard"), 1000);
      return;
    }
    
    if (option === "4. Get Info") {
      setMessages((msgs) => [
        ...msgs,
        { sender: "user", text: option },
        { sender: "bot", text: "Redirecting you to your dashboard for more information..." }
      ]);
      setTimeout(() => navigate("/dashboard"), 1000);
      return;
    }
    
    // For other options, use the original backend flow
    handleSend(null, option);
  };

  // Floating button and popup
  return (
    <>
      {/* Floating Chatbot Icon */}
      <div
        style={{
          position: "fixed",
          bottom: 32,
          right: 32,
          zIndex: 1000,
          cursor: "pointer",
          background: "#0078d4",
          borderRadius: "50%",
          width: 56,
          height: 56,
          display: open ? "none" : "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
        }}
        onClick={() => setOpen(true)}
        title="Chat with Assistant"
      >
        <span style={{ color: "#fff", fontSize: 28 }}>💬</span>
      </div>

      {/* Chatbot Popup */}
      {open && (
        <div
          style={{
            position: "fixed",
            bottom: 100,
            right: 32,
            width: 350,
            height: 420,
            background: "#fff",
            borderRadius: 12,
            boxShadow: "0 4px 24px rgba(0,0,0,0.2)",
            zIndex: 1001,
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: "12px 16px",
              background: "#0078d4",
              color: "#fff",
              borderTopLeftRadius: 12,
              borderTopRightRadius: 12,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span>Portfoliofy Assistant</span>
            <button
              onClick={() => setOpen(false)}
              style={{
                background: "transparent",
                border: "none",
                color: "#fff",
                fontSize: 20,
                cursor: "pointer",
              }}
              aria-label="Close"
            >
              ×
            </button>
          </div>
          {/* Messages */}
          <div
            style={{
              flex: 1,
              padding: 16,
              overflowY: "auto",
              background: "#f9f9f9",
            }}
          >
            {messages.length === 0 && (
              <div style={{ color: "#888", textAlign: "center", marginTop: 40 }}>
                Hi! How can I assist you today?
              </div>
            )}
            {messages.map((msg, i) => (
              <div
                key={i}
                style={{
                  textAlign: msg.sender === "user" ? "right" : "left",
                  margin: "8px 0",
                }}
              >
                <span
                  style={{
                    display: "inline-block",
                    background: msg.sender === "user" ? "#e6f0fa" : "#f1f1f1",
                    color: "#222",
                    borderRadius: 8,
                    padding: "6px 12px",
                    maxWidth: "80%",
                  }}
                >
                  {msg.text}
                </span>
                {/* Render options if present */}
                {msg.options && Array.isArray(msg.options) && msg.options.length > 0 && (
                  <div style={{ marginTop: 8 }}>
                    {msg.options.map((opt, idx) => (
                      <button
                        key={idx}
                        style={{
                          marginRight: 8,
                          marginBottom: 4,
                          padding: "6px 12px",
                          borderRadius: 6,
                          border: "1px solid #0078d4",
                          background: "#e6f0fa",
                          color: "#0078d4",
                          cursor: "pointer",
                          fontSize: "12px",
                          fontWeight: "600"
                        }}
                        onClick={() => handleOptionClick(opt)}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {isLoading && (
              <div style={{ textAlign: "left" }}>
                <span style={{
                  display: "inline-block",
                  background: "#f1f1f1",
                  color: "#222",
                  borderRadius: 8,
                  padding: "6px 12px",
                  maxWidth: "80%",
                  fontStyle: "italic"
                }}>
                  Typing...
                </span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          {/* Input */}
          <div style={{ padding: 12, borderTop: "1px solid #eee", background: "#fafafa" }}>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend(e)}
              style={{
                width: "80%",
                padding: 8,
                borderRadius: 6,
                border: "1px solid #ccc",
                marginRight: 8,
              }}
              placeholder="Type your message..."
              disabled={isLoading}
            />
            <button
              onClick={handleSend}
              style={{
                padding: "8px 16px",
                background: "#0078d4",
                color: "#fff",
                border: "none",
                borderRadius: 6,
                cursor: "pointer",
              }}
              disabled={isLoading}
            >
              Send
            </button>
          </div>
        </div>
      )}
    </>
  );
}