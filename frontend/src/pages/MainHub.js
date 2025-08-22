import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Badge } from '../components/ui/badge';
import { useAuth } from '../contexts/AuthContext';
import { getCurrentLocation, filterRequestsByDistance } from '../utils/locationUtils';
import { useToast } from '../hooks/use-toast';
import { 
  Plus, 
  Bell, 
  List, 
  MapPin, 
  Clock, 
  DollarSign, 
  LogOut,
  Droplets,
  AlertCircle,
  RefreshCw
} from 'lucide-react';

const MainHub = () => {
  const [activeTab, setActiveTab] = useState('requests');
  const [nearbyRequests, setNearbyRequests] = useState([]);
  const [myRequests, setMyRequests] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [locationError, setLocationError] = useState(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const { currentUser, logout } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Load and filter requests
  const loadRequests = () => {
    const allRequests = JSON.parse(localStorage.getItem('liquex_requests') || '[]');
    
    // Get user's own requests
    const userRequests = allRequests.filter(req => req.userId === currentUser.id);
    setMyRequests(userRequests);
    
    // Filter nearby requests (excluding user's own)
    const otherRequests = allRequests.filter(req => req.userId !== currentUser.id);
    
    if (userLocation) {
      const nearby = filterRequestsByDistance(
        otherRequests, 
        userLocation.lat, 
        userLocation.lon, 
        700
      );
      setNearbyRequests(nearby);
    }
  };

  // Get user location
  const getUserLocation = async () => {
    setIsLoadingLocation(true);
    setLocationError(null);
    
    try {
      const location = await getCurrentLocation();
      setUserLocation(location);
      toast({
        title: "Location Updated",
        description: "Successfully got your current location"
      });
    } catch (error) {
      setLocationError(error.message);
      toast({
        title: "Location Error",
        description: "Could not get your location. Please enable location services.",
        variant: "destructive"
      });
    } finally {
      setIsLoadingLocation(false);
    }
  };

  useEffect(() => {
    getUserLocation();
  }, []);

  useEffect(() => {
    loadRequests();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(loadRequests, 30000);
    return () => clearInterval(interval);
  }, [userLocation, currentUser.id]);

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-teal-50 to-cyan-50 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-br from-blue-600 to-teal-600 rounded-xl">
              <Droplets className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-700 to-teal-600 bg-clip-text text-transparent">
                Liquex Hub
              </h1>
              <p className="text-gray-600 text-sm">Welcome back, {currentUser?.username}</p>
            </div>
          </div>
          
          <Button
            variant="outline"
            onClick={logout}
            className="border-gray-200 hover:bg-red-50 hover:border-red-200"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>

        {/* Location Status */}
        {locationError && (
          <Card className="border-amber-200 bg-amber-50">
            <CardContent className="pt-6">
              <div className="flex items-start space-x-3">
                <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
                <div className="flex-1">
                  <p className="text-amber-800 font-medium">Location access required</p>
                  <p className="text-amber-700 text-sm mt-1">
                    ⚠️ Location access is required to view nearby requests. Please enable location services in your browser.
                  </p>
                  <Button
                    onClick={getUserLocation}
                    className="mt-3 bg-amber-600 hover:bg-amber-700"
                    size="sm"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Retry Location Access
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Main Tabs */}
        <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="requests" className="flex items-center space-x-2">
                  <Plus className="h-4 w-4" />
                  <span>Requests</span>
                </TabsTrigger>
                <TabsTrigger value="notifications" className="flex items-center space-x-2">
                  <Bell className="h-4 w-4" />
                  <span>Notifications</span>
                  {nearbyRequests.length > 0 && (
                    <Badge variant="secondary" className="ml-1">
                      {nearbyRequests.length}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="my-requests" className="flex items-center space-x-2">
                  <List className="h-4 w-4" />
                  <span>My Requests</span>
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </CardHeader>

          <CardContent>
            <Tabs value={activeTab} className="w-full">
              
              {/* Requests Tab */}
              <TabsContent value="requests" className="space-y-6">
                <div className="text-center space-y-4">
                  <div className="p-8 bg-gradient-to-r from-blue-50 to-teal-50 rounded-xl border border-blue-100">
                    <Plus className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">Create New Request</h3>
                    <p className="text-gray-600 mb-6">Need help with something? Create a request and let nearby people assist you.</p>
                    <Button
                      onClick={() => navigate('/raise-request')}
                      className="bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 text-white px-8"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Raise New Request
                    </Button>
                  </div>
                </div>
              </TabsContent>

              {/* Notifications Tab */}
              <TabsContent value="notifications" className="space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-800">
                    Nearby Requests ({nearbyRequests.length})
                  </h3>
                  {userLocation && (
                    <Button
                      variant="outline"
                      onClick={loadRequests}
                      size="sm"
                      className="text-blue-600 border-blue-200 hover:bg-blue-50"
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Refresh
                    </Button>
                  )}
                </div>

                {isLoadingLocation ? (
                  <div className="text-center py-8">
                    <RefreshCw className="h-8 w-8 text-blue-600 mx-auto animate-spin mb-4" />
                    <p className="text-gray-600">Getting your location...</p>
                  </div>
                ) : locationError ? (
                  <div className="text-center py-8">
                    <AlertCircle className="h-8 w-8 text-amber-600 mx-auto mb-4" />
                    <p className="text-gray-600">Enable location to see nearby requests</p>
                  </div>
                ) : nearbyRequests.length === 0 ? (
                  <div className="text-center py-8">
                    <Bell className="h-8 w-8 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No requests found within 700m radius</p>
                    <p className="text-gray-500 text-sm mt-2">Check back later for new requests</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {nearbyRequests.map((request) => (
                      <Card
                        key={request.id}
                        className="cursor-pointer hover:shadow-md transition-shadow border-gray-100"
                        onClick={() => navigate(`/request/${request.id}`)}
                      >
                        <CardContent className="pt-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-2">
                                <Badge className={getRequestTypeColor(request.type)}>
                                  {request.type}
                                </Badge>
                                <Badge variant="outline" className={getStatusColor(request.status)}>
                                  {request.status}
                                </Badge>
                              </div>
                              
                              <h4 className="font-medium text-gray-800 mb-1">
                                {request.description}
                              </h4>
                              
                              <div className="flex items-center space-x-4 text-sm text-gray-600">
                                <span>By {request.username}</span>
                                <div className="flex items-center space-x-1">
                                  <MapPin className="h-3 w-3" />
                                  <span>Nearby</span>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <Clock className="h-3 w-3" />
                                  <span>{formatTimeAgo(request.timestamp)}</span>
                                </div>
                              </div>
                            </div>
                            
                            {request.amount && (
                              <div className="flex items-center space-x-1 text-green-600 font-medium">
                                <DollarSign className="h-4 w-4" />
                                <span>{request.amount}</span>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>

              {/* My Requests Tab */}
              <TabsContent value="my-requests" className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  My Requests ({myRequests.length})
                </h3>

                {myRequests.length === 0 ? (
                  <div className="text-center py-8">
                    <List className="h-8 w-8 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">You haven't created any requests yet</p>
                    <Button
                      onClick={() => navigate('/raise-request')}
                      className="mt-4 bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 text-white"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Create Your First Request
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {myRequests.map((request) => (
                      <Card key={request.id} className="border-gray-100">
                        <CardContent className="pt-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-2">
                                <Badge className={getRequestTypeColor(request.type)}>
                                  {request.type}
                                </Badge>
                                <Badge variant="outline" className={getStatusColor(request.status)}>
                                  {request.status}
                                </Badge>
                              </div>
                              
                              <h4 className="font-medium text-gray-800 mb-1">
                                {request.description}
                              </h4>
                              
                              <div className="flex items-center space-x-4 text-sm text-gray-600">
                                <div className="flex items-center space-x-1">
                                  <Clock className="h-3 w-3" />
                                  <span>{formatTimeAgo(request.timestamp)}</span>
                                </div>
                              </div>
                            </div>
                            
                            {request.amount && (
                              <div className="flex items-center space-x-1 text-green-600 font-medium">
                                <DollarSign className="h-4 w-4" />
                                <span>{request.amount}</span>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MainHub;