
import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Message, Role } from '../types';
import { GeminiIcon, UserIcon } from './Icons';

interface ChatMessageProps {
  message: Message;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isUser = message.role === Role.USER;
  const isModel = message.role === Role.MODEL;
  const isError = message.role === Role.ERROR;

  const wrapperClasses = `flex items-start gap-4 my-4 ${isUser ? 'justify-end' : ''}`;
  const messageClasses = `max-w-xl lg:max-w-3xl px-4 py-3 rounded-2xl ${
    isUser
      ? 'bg-blue-600 text-white'
      : isError
      ? 'bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-200'
      : 'bg-gray-200 dark:bg-gray-800 text-gray-800 dark:text-gray-200'
  }`;
  
  const Icon = isUser ? UserIcon : GeminiIcon;

  return (
    <div className={wrapperClasses}>
      {!isUser && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-indigo-600 flex items-center justify-center text-white">
          <Icon className="w-5 h-5" />
        </div>
      )}
      <div className={messageClasses}>
        {isModel ? (
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            className="prose prose-sm dark:prose-invert max-w-none"
            components={{
                h1: ({node, ...props}) => <h1 className="text-xl font-bold" {...props} />,
                h2: ({node, ...props}) => <h2 className="text-lg font-semibold" {...props} />,
                p: ({node, ...props}) => <p className="mb-2 last:mb-0" {...props} />,
                ul: ({node, ...props}) => <ul className="list-disc pl-5 mb-2" {...props} />,
                ol: ({node, ...props}) => <ol className="list-decimal pl-5 mb-2" {...props} />,
                code({node, inline, className, children, ...props}) {
                    const match = /language-(\w+)/.exec(className || '')
                    return !inline && match ? (
                      <pre className="bg-gray-900 text-white p-3 rounded-md my-2 overflow-x-auto">
                        <code className={`language-${match[1]}`} {...props}>
                          {children}
                        </code>
                      </pre>
                    ) : (
                      <code className="bg-gray-300 dark:bg-gray-700 rounded px-1.5 py-0.5 text-sm" {...props}>
                        {children}
                      </code>
                    )
                }
            }}
          >
            {message.parts}
          </ReactMarkdown>
        ) : (
          <p className="whitespace-pre-wrap">{message.parts}</p>
        )}
      </div>
      {isUser && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-700 flex items-center justify-center">
          <Icon className="w-5 h-5" />
        </div>
      )}
    </div>
  );
};

export default ChatMessage;
