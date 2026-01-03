import React, { useState, useEffect, useRef } from 'react';
import { db } from '../firebase';
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp } from 'firebase/firestore';

export default function ChatWindow({ order, user, onClose }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null); // Ref for the hidden file input

  // Logic to show who you are talking to
  const isCustomer = user.uid === order.userId;
  const chatPartnerName = isCustomer 
    ? (order.status === 'Out for Delivery' ? 'Rider' : order.vendorName) 
    : order.userEmail?.split('@')[0] || "Customer";

  useEffect(() => {
    if (!order.id) return;

    // 1. LISTEN TO MESSAGES
    const messagesRef = collection(db, "orders", order.id, "messages");
    const q = query(messagesRef, orderBy("createdAt", "asc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setMessages(msgs);
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    });

    return () => unsubscribe();
  }, [order.id]);

  // Helper to send message object to Firestore
  const sendMessageToFirestore = async (text, imageUrl = null) => {
    try {
      const messagesRef = collection(db, "orders", order.id, "messages");
      await addDoc(messagesRef, {
        text: text,
        image: imageUrl, // Store base64 string or URL
        senderId: user.uid,
        senderEmail: user.email,
        createdAt: serverTimestamp(),
      });
      setNewMessage('');
    } catch (error) {
      console.error("Error sending message:", error);
      alert("Failed to send message. Please try again.");
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    await sendMessageToFirestore(newMessage);
  };

  // 2. HANDLE IMAGE SELECTION
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Limit file size to 1MB (Firestore document limit)
    if (file.size > 1024 * 1024) {
      alert("Image is too large. Please select an image under 1MB.");
      return;
    }

    setIsUploading(true);
    
    // Convert image to Base64 string
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = reader.result;
      // Send as a message with the image attached
      await sendMessageToFirestore("", base64String);
      setIsUploading(false);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-in fade-in zoom-in duration-200">
      <div className="bg-white dark:bg-gray-900 w-full max-w-md rounded-2xl shadow-2xl flex flex-col h-[600px] overflow-hidden border border-gray-200 dark:border-gray-800">
        
        {/* Header */}
        <div className="bg-indigo-600 p-4 flex justify-between items-center text-white shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-xl">
              💬
            </div>
            <div>
              <h3 className="font-bold">Chat with {chatPartnerName}</h3>
              <p className="text-xs text-indigo-100">Order #{order.id.slice(0, 6)}</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-white/80 hover:text-white hover:bg-white/10 rounded-full p-2 transition"
          >
            ✕
          </button>
        </div>

        {/* Messages Area */}
        <div className="flex-grow overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-950">
          {messages.length === 0 && (
            <div className="text-center text-gray-400 text-sm mt-10 flex flex-col items-center">
              <span className="text-4xl mb-2">👋</span>
              <p>Start the conversation!</p>
            </div>
          )}
          
          {messages.map((msg) => {
            const isMe = msg.senderId === user.uid;
            return (
              <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] rounded-2xl px-4 py-2 shadow-sm text-sm overflow-hidden ${
                  isMe 
                    ? 'bg-indigo-600 text-white rounded-br-none' 
                    : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-700 rounded-bl-none'
                }`}>
                  {/* Render Image if present */}
                  {msg.image && (
                    <div className="mb-2 -mx-2 -mt-2">
                      <img 
                        src={msg.image} 
                        alt="Attachment" 
                        className="w-full h-auto rounded-t-xl"
                        style={{ maxHeight: '200px', objectFit: 'cover' }}
                      />
                    </div>
                  )}
                  
                  {/* Render Text if present */}
                  {msg.text && <p>{msg.text}</p>}
                  
                  <p className={`text-[10px] mt-1 text-right ${isMe ? 'text-indigo-200' : 'text-gray-400'}`}>
                    {msg.createdAt?.seconds ? new Date(msg.createdAt.seconds * 1000).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '...'}
                  </p>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <form onSubmit={handleSendMessage} className="p-4 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 flex gap-2 items-center">
          
          {/* File Input (Hidden) */}
          <input 
            type="file" 
            accept="image/*" 
            ref={fileInputRef}
            onChange={handleFileSelect}
            className="hidden"
          />

          {/* Attachment Button */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="text-gray-500 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition"
            title="Attach Image"
          >
            {isUploading ? (
              <span className="animate-spin inline-block">⏳</span>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>
            )}
          </button>

          <input 
            type="text" 
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..." 
            className="flex-grow p-3 rounded-xl bg-gray-100 dark:bg-gray-800 border-none outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white transition"
          />
          
          <button 
            type="submit" 
            disabled={!newMessage.trim() && !isUploading}
            className="bg-indigo-600 text-white p-3 rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-lg"
          >
            ➤
          </button>
        </form>

      </div>
    </div>
  );
}