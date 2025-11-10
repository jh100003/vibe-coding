
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { GoogleGenAI, Chat } from '@google/genai';
import { Message, Role } from './types';
import ChatMessage from './components/ChatMessage';
import ChatInput from './components/ChatInput';
import { GeminiIcon } from './components/Icons';

const App: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  
  const chat = useMemo<Chat | null>(() => {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
      return ai.chats.create({
        model: 'gemini-2.5-flash',
        config: {
            systemInstruction: 'You are a helpful and friendly AI assistant. Format your responses using markdown.',
        },
      });
    } catch (error) {
      console.error("Failed to initialize GoogleGenAI:", error);
      setMessages([{
        id: 'init-error',
        role: Role.ERROR,
        parts: "Failed to initialize the AI model. Please check the API key and configuration."
      }]);
      return null;
    }
  }, []);

  useEffect(() => {
    chatContainerRef.current?.scrollTo({
      top: chatContainerRef.current.scrollHeight,
      behavior: 'smooth',
    });
  }, [messages]);
  
  const handleSendMessage = async (userInput: string) => {
    if (!chat) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: Role.USER,
      parts: userInput,
    };
    
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    const modelMessageId = (Date.now() + 1).toString();
    setMessages(prev => [...prev, { id: modelMessageId, role: Role.MODEL, parts: '...' }]);

    try {
      const result = await chat.sendMessageStream({ message: userInput });
      
      let text = '';
      for await (const chunk of result) {
        text += chunk.text;
        setMessages(prev =>
          prev.map(msg =>
            msg.id === modelMessageId ? { ...msg, parts: text + '...' } : msg
          )
        );
      }
      
      setMessages(prev =>
        prev.map(msg =>
          msg.id === modelMessageId ? { ...msg, parts: text } : msg
        )
      );

    } catch (error) {
      console.error("Error sending message:", error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: Role.ERROR,
        parts: "Sorry, something went wrong while processing your request. Please try again.",
      };
      setMessages(prev => prev.filter(msg => msg.id !== modelMessageId));
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const WelcomeScreen: React.FC = () => (
    <div className="flex flex-col items-center justify-center h-full text-center">
        <div className="w-16 h-16 mb-4 bg-gradient-to-br from-purple-400 to-indigo-600 flex items-center justify-center rounded-full text-white">
            <GeminiIcon className="w-8 h-8" />
        </div>
        <h1 className="text-4xl font-bold text-gray-800 dark:text-gray-200">
            How can I help you today?
        </h1>
    </div>
  );

  return (
    <div className="flex flex-col h-screen font-sans">
        <header className="p-4 border-b border-gray-200 dark:border-gray-800">
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Gemini Clone</h1>
        </header>
        <main ref={chatContainerRef} className="flex-grow p-4 md:p-6 overflow-y-auto">
            <div className="max-w-4xl mx-auto">
                {messages.length === 0 ? (
                    <WelcomeScreen />
                ) : (
                    messages.map((msg) => (
                        <ChatMessage key={msg.id} message={msg} />
                    ))
                )}
            </div>
        </main>
        <footer className="sticky bottom-0">
            <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} />
        </footer>
    </div>
  );
};

export default App;
