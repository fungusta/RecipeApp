'use client';

import React, { useState } from 'react';
import Card from './Card';
import { Instruction } from '@/data/recipes';

interface CookingSectionProps {
  instructions: Instruction[];
}

export default function CookingSection({ instructions }: CookingSectionProps) {
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());

  const handleStepComplete = (stepIndex: number) => {
    setCompletedSteps(prev => {
      const newSet = new Set(prev);
      if (newSet.has(stepIndex)) {
        newSet.delete(stepIndex);
      } else {
        newSet.add(stepIndex);
      }
      return newSet;
    });
  };

  // Find the current instruction (first incomplete step)
  const getCurrentStepIndex = () => {
    for (let i = 0; i < instructions.length; i++) {
      if (!completedSteps.has(i)) {
        return i;
      }
    }
    return -1; // All steps completed
  };

  const currentStepIndex = getCurrentStepIndex();

  return (
    <div className="w-full max-w-4xl">
      <h2 className="text-2xl font-bold text-center mb-6 text-gray-900">Cooking</h2>
      
      <div className="space-y-4">
        {instructions.map((instruction, index) => {
          const isCompleted = completedSteps.has(index);
          const isCurrentStep = index === currentStepIndex;
          
          return (
            <Card
              key={index}
              backgroundColor={
                isCompleted 
                  ? "bg-gray-300" 
                  : !isCurrentStep 
                    ? "bg-lime-300" 
                    : ""
              }
              className={`relative transition-all duration-300 ${
                isCompleted ? 'opacity-50' : 'opacity-100'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 pr-4">
                  <h3 className="text-lg font-bold text-gray-900 mb-2">
                    {instruction.title}
                  </h3>
                  
                  {instruction.time && (
                    <p className="text-md text-gray-700 mb-3">
                      Time: {instruction.time}
                    </p>
                  )}
                  
                  <p className="text-gray-800 leading-relaxed">
                    {instruction.description}
                  </p>
                </div>
                
                <button
                  onClick={() => handleStepComplete(index)}
                  className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
                    isCompleted
                      ? 'bg-white border-white text-orange-400'
                      : 'bg-transparent border-white text-white hover:bg-white hover:text-orange-400'
                  }`}
                >
                  {isCompleted && (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </button>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
