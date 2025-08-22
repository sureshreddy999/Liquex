import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { useAuth } from '../contexts/AuthContext';
import { getCurrentLocation } from '../utils/locationUtils';
import { useToast } from '../hooks/use-toast';
import { ArrowLeft, MapPin, DollarSign, FileText, Loader2 } from 'lucide-react';

const RaiseRequestPage = () => {
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState('');
  const [customType, setCustomType] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const requestTypes = [
    'Money Transfer',
    'Food Delivery', 
    'Grocery',
    'Transport',
    'Emergency Help',
    'Other'
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!description.trim() || !type) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    if (type === 'Other' && !customType.trim()) {
      toast({
        title: "Error", 
        description: "Please specify the custom request type",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Get current location
      const location = await getCurrentLocation();
      
      // Create request object
      const request = {
        id: Date.now().toString(),
        userId: currentUser.id,
        username: currentUser.username,
        amount: amount || null,
        description: description.trim(),
        type: type === 'Other' ? customType.trim() : type,
        timestamp: new Date().toISOString(),
        status: 'pending',
        lat: location.lat,
        lon: location.lon
      };

      // Save to localStorage
      const requests = JSON.parse(localStorage.getItem('liquex_requests') || '[]');
      requests.push(request);
      localStorage.setItem('liquex_requests', JSON.stringify(requests));
      
      toast({
        title: "Success",
        description: "Your request has been created successfully!"
      });
      
      navigate('/hub');
      
    } catch (error) {
      toast({
        title: "Error",
        description: "Could not get your location. Please enable location services and try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

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
              Raise New Request
            </h1>
            <p className="text-gray-600 text-sm">Let nearby people know how they can help you</p>
          </div>
        </div>

        {/* Form Card */}
        <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-xl text-gray-800">Request Details</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Request Type */}
              <div className="space-y-2">
                <Label htmlFor="type" className="text-sm font-medium text-gray-700">
                  Request Type *
                </Label>
                <Select value={type} onValueChange={setType}>
                  <SelectTrigger className="h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500">
                    <SelectValue placeholder="Select request type" />
                  </SelectTrigger>
                  <SelectContent>
                    {requestTypes.map((requestType) => (
                      <SelectItem key={requestType} value={requestType}>
                        {requestType}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Custom Type Input */}
              {type === 'Other' && (
                <div className="space-y-2">
                  <Label htmlFor="customType" className="text-sm font-medium text-gray-700">
                    Custom Request Type *
                  </Label>
                  <div className="relative">
                    <FileText className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="customType"
                      type="text"
                      placeholder="Enter custom request type"
                      value={customType}
                      onChange={(e) => setCustomType(e.target.value)}
                      className="pl-10 h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                </div>
              )}

              {/* Amount (Optional) */}
              <div className="space-y-2">
                <Label htmlFor="amount" className="text-sm font-medium text-gray-700">
                  Amount (Optional)
                </Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="amount"
                    type="text"
                    placeholder="Enter amount if applicable"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="pl-10 h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description" className="text-sm font-medium text-gray-700">
                  Description *
                </Label>
                <Textarea
                  id="description"
                  placeholder="Describe what you need help with..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  className="border-gray-200 focus:border-blue-500 focus:ring-blue-500 resize-none"
                />
              </div>

              {/* Location Info */}
              <div className="bg-gradient-to-r from-blue-50 to-teal-50 rounded-xl p-4 border border-blue-100">
                <div className="flex items-start space-x-3">
                  <MapPin className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-gray-800 text-sm">Location Sharing</h4>
                    <p className="text-gray-600 text-sm mt-1">
                      Your current location will be captured to help nearby people find you. 
                      Only people within 700m will see your request.
                    </p>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-12 bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 text-white font-medium transition-all duration-200"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating Request...
                  </>
                ) : (
                  "Create Request"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RaiseRequestPage;