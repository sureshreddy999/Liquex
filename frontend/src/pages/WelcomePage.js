import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { useAuth } from '../contexts/AuthContext';
import { Droplets, ArrowRight, MapPin, MessageCircle, Shield, Users } from 'lucide-react';

const WelcomePage = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const features = [
    {
      icon: <MapPin className="h-6 w-6 text-blue-600" />,
      title: "Location-Based",
      description: "Find and help people within 700m radius"
    },
    {
      icon: <MessageCircle className="h-6 w-6 text-teal-600" />,
      title: "Real-Time Chat",
      description: "Communicate directly with requesters"
    },
    {
      icon: <Shield className="h-6 w-6 text-blue-600" />,
      title: "Secure Verification", 
      description: "OTP-based transaction completion"
    },
    {
      icon: <Users className="h-6 w-6 text-teal-600" />,
      title: "Community Help",
      description: "Connect with neighbors for assistance"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-teal-50 to-cyan-50 p-4">
      <div className="max-w-2xl mx-auto space-y-8 pt-8">
        
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center space-x-2">
            <div className="p-4 bg-gradient-to-br from-blue-600 to-teal-600 rounded-3xl">
              <Droplets className="h-10 w-10 text-white" />
            </div>
          </div>
          <div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-700 to-teal-600 bg-clip-text text-transparent mb-2">
              Welcome to Liquex
            </h1>
            <p className="text-xl text-gray-600">Hello, {currentUser?.username}!</p>
          </div>
        </div>

        {/* Welcome Card */}
        <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
          <CardHeader className="text-center pb-6">
            <CardTitle className="text-2xl text-gray-800 mb-2">
              How Liquex Works
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-gray-600 text-center leading-relaxed">
              Liquex connects you with people in your immediate area who can help with various needs - 
              from money transfers to food delivery, emergency assistance to grocery runs.
            </p>

            {/* Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
              {features.map((feature, index) => (
                <div key={index} className="flex items-start space-x-3 p-4 rounded-xl bg-gradient-to-r from-blue-50 to-teal-50 border border-blue-100">
                  <div className="flex-shrink-0 mt-1">
                    {feature.icon}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800 text-sm">{feature.title}</h3>
                    <p className="text-gray-600 text-sm mt-1">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Steps */}
            <div className="bg-gradient-to-r from-blue-50 to-teal-50 rounded-xl p-6 mt-8">
              <h3 className="font-semibold text-gray-800 mb-4 text-center">Getting Started</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-semibold">1</div>
                  <p className="text-sm text-gray-700">Create or view requests in your area</p>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 bg-teal-600 text-white rounded-full flex items-center justify-center text-xs font-semibold">2</div>
                  <p className="text-sm text-gray-700">Accept requests and start chatting</p>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-semibold">3</div>
                  <p className="text-sm text-gray-700">Complete with OTP verification</p>
                </div>
              </div>
            </div>

            <Button
              onClick={() => navigate('/hub')}
              className="w-full h-12 bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 text-white font-semibold transition-all duration-200 group"
            >
              Enter Main Hub
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default WelcomePage;