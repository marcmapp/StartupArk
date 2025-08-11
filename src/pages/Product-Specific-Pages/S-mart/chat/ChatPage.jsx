import React, { useState } from 'react';

const ChatPage = () => {
  const [messages, setMessages] = useState([
    { id: 1, sender: 'support', text: 'Hello! How can we help you today?', time: '10:30 AM' },
    { id: 2, sender: 'user', text: 'I need help with my subscription', time: '10:32 AM' }
  ]);
  const [newMessage, setNewMessage] = useState('');

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (newMessage.trim()) {
      setMessages([...messages, {
        id: messages.length + 1,
        sender: 'user',
        text: newMessage,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
      setNewMessage('');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col h-[calc(100vh-200px)]">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold">Support Chat</h1>
          <div className="flex items-center space-x-2">
            <span className="h-3 w-3 bg-green-500 rounded-full"></span>
            <span className="text-sm text-gray-600">Online</span>
          </div>
        </div>

        <div className="flex-1 bg-white rounded-lg shadow-sm border border-gray-200 p-4 overflow-y-auto mb-4">
          <div className="space-y-4">
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-xs md:max-w-md lg:max-w-lg rounded-lg px-4 py-2 ${message.sender === 'user' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-800'}`}>
                  <p>{message.text}</p>
                  <p className={`text-xs mt-1 ${message.sender === 'user' ? 'text-indigo-200' : 'text-gray-500'}`}>
                    {message.time}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <form onSubmit={handleSendMessage} className="flex space-x-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
          <button
            type="submit"
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatPage;