import React from 'react';
import { CheckCircle } from 'lucide-react';
import StripeCheckoutButton from './StripeCheckoutButton';

interface PricingCardProps {
  title: string;
  price: number;
  interval: 'month' | 'year';
  description: string;
  features: string[];
  priceId: string;
  popular?: boolean;
  className?: string;
}

const PricingCard: React.FC<PricingCardProps> = ({
  title,
  price,
  interval,
  description,
  features,
  priceId,
  popular = false,
  className = '',
}) => {
  return (
    <div 
      className={`bg-white rounded-lg shadow-md border ${
        popular ? 'border-blue-500 ring-2 ring-blue-500 ring-opacity-50' : 'border-gray-200'
      } p-6 ${className}`}
    >
      {popular && (
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
          <span className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
            Most Popular
          </span>
        </div>
      )}

      <div className="text-center mb-6">
        <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
        <div className="text-4xl font-bold text-gray-900 mb-2">
          <span className="text-2xl">$</span>{price}
          <span className="text-lg text-gray-500 ml-1">/{interval}</span>
        </div>
        <p className="text-gray-600">{description}</p>
      </div>
      
      <ul className="space-y-3 mb-6">
        {features.map((feature, index) => (
          <li key={index} className="flex items-start">
            <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
            <span className="text-gray-700">{feature}</span>
          </li>
        ))}
      </ul>
      
      <StripeCheckoutButton 
        priceId={priceId}
        buttonText={`Subscribe to ${title}`}
        planName={title.toLowerCase().replace(/\s+/g, '-')}
      />
    </div>
  );
};

export default PricingCard;