import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Shield, AlertTriangle } from 'lucide-react';
import PricingCard from '../components/PricingCard';
import { BASE_PRICES } from '../utils/priceSync';

const PricingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Link to="/" className="flex items-center text-blue-600 hover:text-blue-800">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Home
          </Link>
        </div>
        
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Join Our Trading Academy</h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Master options trading with our comprehensive learning platform
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <PricingCard
            title="Learn Basic"
            price={BASE_PRICES.monthly}
            interval="month"
            description="Start your learning journey"
            features={[
              "Access to basic learning modules",
              "Real-time market data",
              "Basic analytics",
              "Email support",
              "1 paper trading account"
            ]}
            priceId={import.meta.env.VITE_STRIPE_PRICE_ID_BASIC || ''}
          />
          
          <PricingCard
            title="Learn Pro"
            price={BASE_PRICES.pro}
            interval="month"
            description="For dedicated students"
            features={[
              "Everything in Learn Basic",
              "Advanced analytics",
              "Options trading features",
              "Priority support",
              "5 paper trading accounts",
              "Strategy backtesting"
            ]}
            popular={true}
            priceId={import.meta.env.VITE_STRIPE_PRICE_ID_PRO || ''}
          />
          
          <PricingCard
            title="Learn Enterprise"
            price={BASE_PRICES.enterprise}
            interval="month"
            description="For trading schools & teams"
            features={[
              "Everything in Learn Pro",
              "Dedicated account manager",
              "Custom integrations",
              "Team collaboration features",
              "Unlimited paper trading accounts",
              "API access"
            ]}
            priceId={import.meta.env.VITE_STRIPE_PRICE_ID_ENTERPRISE || ''}
          />
        </div>
        
        <div className="mt-12 p-4 bg-yellow-50 border border-yellow-200 rounded-lg max-w-4xl mx-auto">
          <div className="flex items-start">
            <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5 mr-2 flex-shrink-0" />
            <div>
              <h4 className="font-medium text-yellow-800">Important Information</h4>
              <p className="text-sm text-yellow-700 mt-1">
                Learn Options Trading Academy is for educational purposes only. Our platform is designed to help you learn and develop trading skills, not to provide financial advice. Options trading involves significant risk and requires proper education.
              </p>
            </div>
          </div>
        </div>
        
        <div className="mt-8 text-center">
          <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
            <Shield className="h-4 w-4" />
            <span>Secure payment • Cancel anytime • 14-day money-back guarantee</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PricingPage;