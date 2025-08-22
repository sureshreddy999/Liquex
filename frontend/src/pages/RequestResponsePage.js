import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../hooks/use-toast';
import { 
  ArrowLeft, 
  MapPin, 
  Clock, 
  DollarSign, 
  User, 
  Phone,
  CheckCircle,
  XCircle,
  MessageCircle
} from 'lucide-react';

const RequestResponsePage = () => {
  const { id } = useParams();
  const [request, setRequest] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
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
    
    setRequest(foundRequest);
  }, [id, navigate, toast]);

  const getRequestTypeColor = (type) => {
    const colors = {
      'Money Transfer': 'bg-green-100 text-green-800',
      'Food Delivery': 'bg-orange-100 text-orange-800', 
      'Grocery': 'bg-blue-100 text-blue-800',
      'Transport': 'bg-purple-100 text-purple-800',
      'Emergency Help': 'bg-red-100 text-red-800',
      'Other': 'bg-gray-100 text-gray-800'
    };
    return colors[type] || colors['Other'];
  };

  const getStatusColor = (status) => {
    const colors = {
      'pending': 'bg-yellow-100 text-yellow-800',
      'accepted': 'bg-blue-100 text-blue-800',
      'completed': 'bg-green-100 text-green-800',
      'rejected': 'bg-red-100 text-red-800'
    };
    return colors[status] || colors['pending'];
  };

  const formatTimeAgo = (timestamp) => {
    const diff = Date.now() - new Date(timestamp).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  };

  const handleAccept = async () => {
    setIsProcessing(true);
    
    try {
      // Update request status
      const requests = JSON.parse(localStorage.getItem('liquex_requests') || '[]');
      const updatedRequests = requests.map(req => 
        req.id === id 
          ? { ...req, status: 'accepted', acceptedBy: currentUser.id, acceptedByUsername: currentUser.username }
          : req
      );
      
      localStorage.setItem('liquex_requests', JSON.stringify(updatedRequests));
      
      toast({
        title: "Success",
        description: "Request accepted! You can now chat with the requester."
      });
      
      // Navigate to chat
      navigate(`/chat/${id}`);
      
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to accept request. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    setIsProcessing(true);
    
    try {
      // Update request status
      const requests = JSON.parse(localStorage.getItem('liquex_requests') || '[]');
      const updatedRequests = requests.map(req => 
        req.id === id 
          ? { ...req, status: 'rejected', rejectedBy: currentUser.id }
          : req
      );
      
      localStorage.setItem('liquex_requests', JSON.stringify(updatedRequests));
      
      toast({
        title: "Request Rejected",
        description: "You have rejected this request."
      });
      
      // Navigate back to hub
      navigate('/hub');
      
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to reject request. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  if (!request) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-teal-50 to-cyan-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading request...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-teal-50 to-cyan-50 p-4">
      <div className="max-w-2xl mx-auto space-y-6 pt-8">
        
        {/* Header */}
        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            onClick={() => navigate('/hub')}
            className="border-gray-200 hover:bg-gray-50"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-700 to-teal-600 bg-clip-text text-transparent">
              Request Details
            </h1>
            <p className="text-gray-600 text-sm">Review and respond to this request</p>
          </div>
        </div>

        {/* Request Details Card */}
        <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl text-gray-800">Request Information</CardTitle>
              <Badge variant="outline" className={getStatusColor(request.status)}>
                {request.status.toUpperCase()}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            
            {/* Request Type & Amount */}
            <div className="flex items-center justify-between">
              <Badge className={getRequestTypeColor(request.type)}>
                {request.type}
              </Badge>
              {request.amount && (
                <div className="flex items-center space-x-1 text-green-600 font-semibold text-lg">
                  <DollarSign className="h-5 w-5" />
                  <span>{request.amount}</span>
                </div>
              )}
            </div>

            {/* Description */}
            <div>
              <h3 className="font-semibold text-gray-800 mb-2">Description</h3>
              <p className="text-gray-700 bg-gray-50 rounded-lg p-4">{request.description}</p>
            </div>

            {/* Requester Info */}
            <div className="bg-gradient-to-r from-blue-50 to-teal-50 rounded-xl p-4 border border-blue-100">
              <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
                <User className="h-4 w-4 mr-2" />
                Requester Information
              </h3>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4 text-gray-600" />
                  <span className="text-gray-700 font-medium">{request.username}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4 text-gray-600" />
                  <span className="text-gray-700">Location: {request.lat?.toFixed(4)}, {request.lon?.toFixed(4)}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-gray-600" />
                  <span className="text-gray-700">Requested {formatTimeAgo(request.timestamp)}</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            {request.status === 'pending' && (
              <div className="grid grid-cols-2 gap-4">
                <Button
                  onClick={handleReject}
                  disabled={isProcessing}
                  variant="outline"
                  className="h-12 border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  {isProcessing ? "Processing..." : "Reject"}
                </Button>
                <Button
                  onClick={handleAccept}
                  disabled={isProcessing}
                  className="h-12 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  {isProcessing ? "Processing..." : "Accept"}
                </Button>
              </div>
            )}

            {request.status === 'accepted' && (
              <div className="text-center space-y-4">
                <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                  <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <p className="text-green-800 font-medium">Request Accepted</p>
                  <p className="text-green-700 text-sm mt-1">
                    {request.acceptedBy === currentUser.id 
                      ? "You have accepted this request" 
                      : `Accepted by ${request.acceptedByUsername || 'Someone'}`}
                  </p>
                </div>
                
                {request.acceptedBy === currentUser.id && (
                  <Button
                    onClick={() => navigate(`/chat/${id}`)}
                    className="w-full h-12 bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 text-white"
                  >
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Go to Chat
                  </Button>
                )}
              </div>
            )}

            {request.status === 'rejected' && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
                <XCircle className="h-8 w-8 text-red-600 mx-auto mb-2" />
                <p className="text-red-800 font-medium">Request Rejected</p>
                <p className="text-red-700 text-sm mt-1">This request has been rejected.</p>
              </div>
            )}

            {request.status === 'completed' && (
              <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
                <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <p className="text-green-800 font-medium">Request Completed</p>
                <p className="text-green-700 text-sm mt-1">This request has been successfully completed.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RequestResponsePage;