import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../hooks/use-toast';
import { 
  ArrowLeft, 
  Send, 
  MapPin, 
  User, 
  Shield,
  Clock,
  CheckCircle
} from 'lucide-react';

const ChatPage = () => {
  const { id } = useParams();
  const [request, setRequest] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [otp, setOtp] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [otpExpiry, setOtpExpiry] = useState(null);
  const [showOtpVerification, setShowOtpVerification] = useState(false);
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Load request data
    const requests = JSON.parse(localStorage.getItem('liquex_requests') || '[]');
    const foundRequest = requests.find(req => req.id === id);
    
    if (!foundRequest) {
      toast({
        title: "Error",
        description: "Request not found",
        variant: "destructive"
      });
      navigate('/hub');
      return;
    }
    
    if (foundRequest.status !== 'accepted' && foundRequest.status !== 'completed') {
      toast({
        title: "Error",
        description: "This request is not in an active state",
        variant: "destructive"
      });
      navigate('/hub');
      return;
    }
    
    setRequest(foundRequest);
    
    // Load chat messages
    const chatMessages = JSON.parse(localStorage.getItem('liquex_chat_messages') || '[]');
    const requestMessages = chatMessages.filter(msg => msg.requestId === id);
    setMessages(requestMessages);
    
    // Load OTP if exists
    const otpData = localStorage.getItem(`liquex_otp_${id}`);
    if (otpData) {
      const parsedOtpData = JSON.parse(otpData);
      if (new Date(parsedOtpData.expiry) > new Date()) {
        setGeneratedOtp(parsedOtpData.otp);
        setOtpExpiry(parsedOtpData.expiry);
      }
    }
  }, [id, navigate, toast]);

  const sendMessage = (messageText, isSystem = false, type = 'text') => {
    const message = {
      id: Date.now().toString(),
      requestId: id,
      senderId: isSystem ? 'system' : currentUser.id,
      senderName: isSystem ? 'System' : currentUser.username,
      message: messageText,
      timestamp: new Date().toISOString(),
      type: type // 'text', 'location', 'system'
    };

    const allMessages = JSON.parse(localStorage.getItem('liquex_chat_messages') || '[]');
    allMessages.push(message);
    localStorage.setItem('liquex_chat_messages', JSON.stringify(allMessages));
    
    setMessages(prev => [...prev, message]);
    return message;
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    
    if (!newMessage.trim()) return;
    
    sendMessage(newMessage.trim());
    setNewMessage('');
  };

  const shareLocation = () => {
    // Simulate location sharing with mock coordinates
    const mockLat = (Math.random() * 0.01 + 40.7128).toFixed(6); // NYC area mock
    const mockLon = (Math.random() * 0.01 - 74.0060).toFixed(6);
    const locationMessage = `📍 Location shared: 123 Main Street (Lat: ${mockLat}, Lon: ${mockLon})`;
    
    sendMessage(locationMessage, false, 'location');
    
    toast({
      title: "Location Shared",
      description: "Your location has been shared in the chat"
    });
  };

  const generateOtp = () => {
    if (request.userId !== currentUser.id) {
      toast({
        title: "Error",
        description: "Only the requester can generate OTP",
        variant: "destructive"
      });
      return;
    }

    const newOtp = Math.floor(1000 + Math.random() * 9000).toString();
    const expiry = new Date(Date.now() + 5 * 60 * 1000).toISOString(); // 5 minutes

    const otpData = { otp: newOtp, expiry };
    localStorage.setItem(`liquex_otp_${id}`, JSON.stringify(otpData));
    
    setGeneratedOtp(newOtp);
    setOtpExpiry(expiry);
    setShowOtpVerification(true);
    
    sendMessage(`🔐 OTP generated: ${newOtp} (Valid for 5 minutes)`, true, 'system');
    
    toast({
      title: "OTP Generated",
      description: `Your OTP is: ${newOtp}`,
    });
  };

  const verifyOtp = () => {
    if (!otp.trim()) {
      toast({
        title: "Error",
        description: "Please enter the OTP",
        variant: "destructive"
      });
      return;
    }

    if (otp !== generatedOtp) {
      toast({
        title: "Error",
        description: "Invalid OTP. Please try again.",
        variant: "destructive"
      });
      return;
    }

    if (new Date() > new Date(otpExpiry)) {
      toast({
        title: "Error",
        description: "OTP has expired. Please generate a new one.",
        variant: "destructive"
      });
      return;
    }

    // Mark request as completed
    const requests = JSON.parse(localStorage.getItem('liquex_requests') || '[]');
    const updatedRequests = requests.map(req => 
      req.id === id 
        ? { ...req, status: 'completed', completedAt: new Date().toISOString() }
        : req
    );
    
    localStorage.setItem('liquex_requests', JSON.stringify(updatedRequests));
    
    // Send completion message
    sendMessage('✅ Payment Completed (Simulated)', true, 'system');
    
    toast({
      title: "Success",
      description: "Transaction completed successfully!"
    });
    
    // Update local request state
    setRequest(prev => ({ ...prev, status: 'completed' }));
    setShowOtpVerification(false);
    
    // Auto-redirect after 3 seconds
    setTimeout(() => {
      navigate('/hub');
    }, 3000);
  };

  if (!request) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-teal-50 to-cyan-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading chat...</p>
        </div>
      </div>
    );
  }

  const isRequester = request.userId === currentUser.id;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-teal-50 to-cyan-50 p-4">
      <div className="max-w-2xl mx-auto space-y-6 pt-8 pb-4">
        
        {/* Header */}
        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            onClick={() => navigate('/hub')}
            className="border-gray-200 hover:bg-gray-50"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex-1">
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-700 to-teal-600 bg-clip-text text-transparent">
              Chat - {request.type}
            </h1>
            <p className="text-gray-600 text-sm">
              {isRequester ? 'Chatting with helper' : `Helping ${request.username}`}
            </p>
          </div>
          <Badge variant="outline" className="bg-green-100 text-green-800">
            {request.status}
          </Badge>
        </div>

        {/* Chat Card */}
        <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm h-[500px] flex flex-col">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg text-gray-800 flex items-center">
                <User className="h-5 w-5 mr-2" />
                {isRequester ? 'Helper' : request.username}
              </CardTitle>
              <div className="flex space-x-2">
                <Button
                  onClick={shareLocation}
                  size="sm"
                  variant="outline"
                  className="text-blue-600 border-blue-200 hover:bg-blue-50"
                >
                  <MapPin className="h-4 w-4 mr-1" />
                  Share Location
                </Button>
                {isRequester && !generatedOtp && request.status !== 'completed' && (
                  <Button
                    onClick={generateOtp}
                    size="sm"
                    className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
                  >
                    <Shield className="h-4 w-4 mr-1" />
                    Generate OTP
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>

          <CardContent className="flex-1 flex flex-col p-4">
            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto space-y-3 mb-4 max-h-[300px]">
              {messages.length === 0 ? (
                <div className="text-center py-8">
                  <User className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500">Start the conversation...</p>
                </div>
              ) : (
                messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${
                      message.senderId === currentUser.id ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    <div
                      className={`max-w-xs px-4 py-2 rounded-lg ${
                        message.senderId === 'system'
                          ? 'bg-yellow-100 text-yellow-800 mx-auto text-center text-sm'
                          : message.senderId === currentUser.id
                          ? 'bg-gradient-to-r from-blue-600 to-teal-600 text-white'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {message.senderId !== 'system' && message.senderId !== currentUser.id && (
                        <p className="text-xs font-medium mb-1">{message.senderName}</p>
                      )}
                      <p className="text-sm">{message.message}</p>
                      <p className="text-xs opacity-75 mt-1">
                        {new Date(message.timestamp).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* OTP Verification Section */}
            {showOtpVerification && !isRequester && (
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4 mb-4 border border-green-200">
                <div className="flex items-center space-x-2 mb-3">
                  <Shield className="h-5 w-5 text-green-600" />
                  <h4 className="font-medium text-green-800">OTP Verification</h4>
                </div>
                <p className="text-green-700 text-sm mb-3">
                  Ask the requester for the OTP to complete the transaction
                </p>
                <div className="flex space-x-2">
                  <Input
                    type="text"
                    placeholder="Enter 4-digit OTP"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    maxLength={4}
                    className="flex-1 border-green-300 focus:border-green-500 focus:ring-green-500"
                  />
                  <Button
                    onClick={verifyOtp}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    Verify
                  </Button>
                </div>
              </div>
            )}

            {/* Generated OTP Display */}
            {generatedOtp && isRequester && new Date() < new Date(otpExpiry) && request.status !== 'completed' && (
              <div className="bg-gradient-to-r from-blue-50 to-teal-50 rounded-lg p-4 mb-4 border border-blue-200">
                <div className="text-center">
                  <Shield className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <h4 className="font-bold text-blue-800 text-lg">Your OTP</h4>
                  <p className="text-3xl font-mono font-bold text-blue-700 my-2">{generatedOtp}</p>
                  <p className="text-blue-600 text-sm">Share this with the helper to complete transaction</p>
                  <div className="flex items-center justify-center space-x-1 mt-2 text-xs text-blue-500">
                    <Clock className="h-3 w-3" />
                    <span>Expires in 5 minutes</span>
                  </div>
                  <Button
                    onClick={() => setShowOtpVerification(true)}
                    className="mt-3 bg-blue-600 hover:bg-blue-700 text-white"
                    size="sm"
                  >
                    Enable Helper to Verify
                  </Button>
                </div>
              </div>
            )}

            {/* Completion Status */}
            {request.status === 'completed' && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4 text-center">
                <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <p className="text-green-800 font-medium">Transaction Completed!</p>
                <p className="text-green-700 text-sm mt-1">This request has been successfully completed.</p>
              </div>
            )}

            {/* Message Input */}
            {request.status !== 'completed' && (
              <form onSubmit={handleSendMessage} className="flex space-x-2">
                <Input
                  type="text"
                  placeholder="Type your message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="flex-1 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                />
                <Button
                  type="submit"
                  className="bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 text-white"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ChatPage;