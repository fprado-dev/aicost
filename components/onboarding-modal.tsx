'use client';

import { Button } from '@/components/ui/button';
import { createClient } from '@/utils/supabase/client';
import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';

const OnboardingModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const supabase = createClient();

  useEffect(() => {
    const checkOnboardingStatus = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user && !user.user_metadata.onboarding_completed) {
        setIsOpen(true);
      }
    };

    checkOnboardingStatus();
  }, []);

  const steps = [
    {
      title: 'Welcome to TierWise! 👋',
      content: 'We\'re thrilled to have you on board! TierWise helps you track, manage, and optimize your AI model costs with precision and clarity.',
    },
    {
      title: 'Choose Your AI Models 🤖',
      content: 'Access our library of 250+ text, image, and video models, including DeepSeek, Claude, Google, and many more. Or easily add your custom models to start tracking right away.',
    },
    {
      title: 'Create Cost Tiers 📊',
      content: 'Set up customized tiers to categorize your AI usage. This gives you unprecedented transparency into your spending patterns across different models and applications.',
    },
    {
      title: 'Analyze Your Costs 📈',
      content: 'Visit the Summary section to get comprehensive insights into your AI spending. Identify trends, spot opportunities for optimization, and make data-driven decisions.',
    },
    {
      title: 'You\'re All Set! 🎉',
      content: 'Congratulations on setting up TierWise! We\'re committed to helping you manage your AI costs effectively. If you\'re enjoying the experience, we\'d love to hear your feedback!',
    },
  ];


  const handleNext = async () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.auth.updateUser({
          data: { onboarding_completed: true }
        });
      }
      setIsOpen(false);
    }
  };

  return (
    <Dialog modal={true} open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md">

        <DialogHeader>
          <DialogTitle>

            <h2 className="text-2xl font-bold mb-4">{steps[currentStep].title}</h2>
          </DialogTitle>
          <DialogDescription>
            <p className="text-gray-600 mb-6">{steps[currentStep].content}</p>
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-between items-center">
          <div className="flex gap-2">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full ${index === currentStep ? 'bg-blue-500' : 'bg-gray-300'}`}
              />
            ))}
          </div>
          <Button onClick={handleNext}>
            {currentStep === steps.length - 1 ? 'Get Started' : 'Next'}
          </Button>
        </div>
      </DialogContent>

    </Dialog>
  );
};

export default OnboardingModal;