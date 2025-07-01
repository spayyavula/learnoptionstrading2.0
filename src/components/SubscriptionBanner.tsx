import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle, XCircle, ArrowRight } from 'lucide-react';
import { StripeService } from '../services/stripeService';

interface SubscriptionBannerProps {
  className?: string;
}

const SubscriptionBanner: React.FC<SubscriptionBannerProps> = ({ className = '' }) => {
  const subscription = StripeService.getSubscriptionStatus();
  
  if (subscription.active) {
    // Determine the plan name based on the subscription plan
    const displayPlan = subscription.plan === 'pro' ? 'Pro' : 
                        subscription.plan === 'enterprise' || subscription.plan === 'yearly' ? 'Enterprise' : 'Basic';
  
    return (
      <div className={`bg-green-50 border border-green-200 rounded-lg p-3 ${className}`}>
        <div className="flex items-center justify-between flex-wrap">
          <div className="flex items-center">
            <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
            <div>
              <div className="flex items-center">
                <span className="text-sm font-medium text-green-800">Learn {displayPlan} Plan</span>
                {subscription.termsAccepted && (
                  <span className="ml-2 px-1.5 py-0.5 bg-green-100 text-green-700 text-xs rounded">
                    Terms Accepted
                  </span>
                )}
              </div>
              <p className="text-xs text-green-600">
                Your subscription is active until {new Date(subscription.subscription?.current_period_end || '').toLocaleDateString()}
              </p>
            </div>
          </div>
          <Link 
            to="/app/settings" 
            className="text-green-700 hover:text-green-800 text-sm font-medium"
          >
            Manage
          </Link>
        </div>
      </div>
    );
  }
  
  return (
    <div className={`bg-yellow-50 border border-yellow-200 rounded-lg p-3 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <XCircle className="h-5 w-5 text-yellow-600 mr-2" />
          <span className="font-medium text-yellow-800">Free Access</span>
        </div>
        <Link 
          to="/pricing" 
          className="inline-flex items-center text-sm bg-yellow-600 text-white px-3 py-1 rounded-md hover:bg-yellow-700 transition-colors"
        >
          Upgrade
          <ArrowRight className="ml-1 h-3 w-3" />
        </Link>
      </div>
    </div>
  );
};

export default SubscriptionBanner;