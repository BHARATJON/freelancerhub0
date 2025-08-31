import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import api from '../utils/api';
import { useAuthStore } from '../stores/authStore';
import io from 'socket.io-client';
import { Paperclip, Download } from 'lucide-react';

const Chat = () => {
  const { jobId } = useParams();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const { user } = useAuthStore();
  const socketRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    // Fetch initial messages
    const fetchMessages = async () => {
      try {
        const response = await api.get(`/messages/conversation/${jobId}`);
        setMessages(response.data);
      } catch (error) {
        console.error('Error fetching messages:', error);
      }
    };

    fetchMessages();

    // Initialize socket connection
    socketRef.current = io('http://localhost:5000');

    // Join the chat room
    socketRef.current.emit('join-chat', { jobId });

    // Listen for incoming messages
    socketRef.current.on('chat-message', (message) => {
      setMessages((prevMessages) => [...prevMessages, message]);
    });

    return () => {
      // Disconnect the socket when the component unmounts
      socketRef.current.disconnect();
    };
  }, [jobId]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      const recipientId = await getRecipientId();
      if (!recipientId) {
        console.error('Could not determine the recipient ID.');
        return;
      }

      await api.post('/messages', {
        recipientId,
        content: newMessage,
        jobId,
      });
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      // 1. Upload the file
      const uploadResponse = await api.post('/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const { url, name, type, size } = uploadResponse.data;

      // 2. Get the recipient ID
      const recipientId = await getRecipientId();
      if (!recipientId) {
        console.error('Could not determine the recipient ID.');
        return;
      }

      // 3. Send a new message with the file information
      await api.post('/messages', {
        recipientId,
        content: name,
        jobId,
        messageType: type.startsWith('image') ? 'image' : (type.startsWith('video') ? 'video' : 'file'),
        attachments: [{
          name,
          url,
          type,
          size,
        }],
      });
    } catch (error) {
      console.error('Error uploading file and sending message:', error);
    }
  };

  const getRecipientId = async () => {
    try {
      const response = await api.get(`/jobs/${jobId}`);
      const job = response.data;
      if (user.role === 'company') {
        return job.hiredFreelancer;
      } else {
        return job.company;
      }
    } catch (error) {
      console.error('Error fetching job details:', error);
      return null;
    }
  };

  const renderMessageContent = (message) => {
    if (message.attachments && message.attachments.length > 0) {
      const attachment = message.attachments[0];
      const isImage = attachment.type.startsWith('image/');
      const isVideo = attachment.type.startsWith('video/');

      return (
        <div className="flex items-center">
          {isImage ? (
            <img src={`http://localhost:5000${attachment.url}`} alt={attachment.name} className="max-w-xs max-h-48" />
          ) : isVideo ? (
            <video src={`http://localhost:5000${attachment.url}`} controls className="max-w-xs max-h-48" />
          ) : (
            <a
              href={`http://localhost:5000${attachment.url}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:underline"
            >
              {attachment.name}
            </a>
          )}
          <a
            href={`http://localhost:5000${attachment.url}`}
            download
            className="ml-2 text-gray-500 hover:text-gray-700"
          >
            <Download size={16} />
          </a>
        </div>
      );
    } else {
      return <p>{message.content}</p>;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Chat for Job</h1>
      <div className="bg-white rounded-lg shadow-lg p-8">
        <div className="flex flex-col h-[600px]">
          <div className="flex-1 overflow-y-auto">
            {messages.map((message) => (
              <div
                key={message._id}
                className={`flex ${
                  message.sender._id === user.id ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`p-3 rounded-lg max-w-xs ${
                    message.sender._id === user.id
                      ? 'bg-primary-500 text-white'
                      : 'bg-gray-200'
                  }`}
                >
                  {renderMessageContent(message)}
                </div>
              </div>
            ))}
          </div>
          <form onSubmit={handleSendMessage} className="mt-4 flex">
            <input
              type="file"
              ref={fileInputRef}
              style={{ display: 'none' }}
              onChange={handleFileChange}
            />
            <button
              type="button"
              className="bg-gray-200 text-gray-500 rounded-l-lg px-4"
              onClick={() => fileInputRef.current.click()}
            >
              <Paperclip className="w-5 h-5" />
            </button>
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              className="flex-1 border-t border-b p-2"
              placeholder="Type a message..."
            />
            <button type="submit" className="bg-primary-500 text-white rounded-r-lg px-4">
              Send
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Chat;