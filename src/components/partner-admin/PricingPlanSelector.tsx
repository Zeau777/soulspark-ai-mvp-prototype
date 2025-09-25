import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';

interface PricingPlan {
  id: 'starter' | 'growth' | 'enterprise';
  name: string;
  price: number;
  maxSeats: number;
  description: string;
  features: string[];
}

const PRICING_PLANS: PricingPlan[] = [
  {
    id: 'starter',
    name: 'Startup',
    price: 6,
    maxSeats: 250,
    description: 'Small to mid-size companies',
    features: [
      'Personalized SoulDrops',
      '24/7 AI well-being support',
      'Mobile and Slack access',
      'Engagement tracking'
    ]
  },
  {
    id: 'growth',
    name: 'Growth',
    price: 8,
    maxSeats: 1000,
    description: 'Growing organizations',
    features: [
      'Everything in Starter',
      'Priority onboarding',
      'Advanced engagement insights'
    ]
  }
];

interface PricingPlanSelectorProps {
  selectedPlan: string | null;
  onPlanSelect: (plan: PricingPlan) => void;
}

export default function PricingPlanSelector({ selectedPlan, onPlanSelect }: PricingPlanSelectorProps) {
  return (
    <div className="space-y-4">
      <div className="text-center space-y-2">
        <h3 className="text-xl font-semibold">Choose Your Organization's Plan</h3>
        <p className="text-muted-foreground">Select the plan that best fits your organization size</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {PRICING_PLANS.map((plan) => (
          <Card 
            key={plan.id}
            className={`cursor-pointer transition-all ${
              selectedPlan === plan.id 
                ? 'ring-2 ring-primary border-primary shadow-lg' 
                : 'hover:shadow-md'
            }`}
            onClick={() => onPlanSelect(plan)}
          >
            <CardHeader className="text-center">
              <CardTitle className="text-lg">{plan.name}</CardTitle>
              <p className="text-sm text-muted-foreground">{plan.description}</p>
              <div className="space-y-1">
                <div className="text-2xl font-bold">${plan.price}</div>
                <div className="text-xs text-muted-foreground">per seat / month</div>
                <div className="text-xs font-medium">Up to {plan.maxSeats.toLocaleString()} seats</div>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              {selectedPlan === plan.id && (
                <div className="mt-4 flex items-center justify-center">
                  <div className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-medium">
                    Selected Plan
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}