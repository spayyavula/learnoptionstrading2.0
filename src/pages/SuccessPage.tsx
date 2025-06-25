import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle, ArrowRight, BookOpen } from 'lucide-react';

const SuccessPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [countdown, setCountdown] = useState(5);
  const plan = searchParams.get('plan') || 'subscription';
  
  useEffect(() => {
    // Auto-redirect after countdown
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      window.location.href = '/app';
    }
  }, [countdown]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-6">
          <CheckCircle className="h-8 w-8 text-green-600" />
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Subscription Successful!
        </h1>
        
        <p className="text-gray-600 mb-6">
          Thank you for subscribing to the <span className="font-semibold">{plan}</span> plan. Your account has been activated and you now have full access to all features.
        </p>
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-start">
            <BookOpen className="h-5 w-5 text-blue-600 mt-0.5 mr-2" />
            <div className="text-left">
              <h3 className="font-medium text-blue-800">Getting Started</h3>
              <p className="text-sm text-blue-700 mt-1">
                We recommend starting with our tutorial section to get the most out of your subscription. You'll learn how to use all the features and start building your trading expertise.
              </p>
            </div>
          </div>
        </div>
        
        <p className="text-sm text-gray-500 mb-6">
          Redirecting to dashboard in {countdown} seconds...
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link 
            to="/app" 
            className="btn btn-primary flex items-center justify-center"
          >
            Go to Dashboard
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
          
          <Link 
            to="/app/learning" 
            className="btn btn-secondary flex items-center justify-center"
          >
            Start Learning
            <BookOpen className="ml-2 h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SuccessPage;