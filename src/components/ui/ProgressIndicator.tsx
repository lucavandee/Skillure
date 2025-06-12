import React from 'react';
import { motion } from 'framer-motion';

interface ProgressIndicatorProps {
  steps: string[];
  currentStep: number;
  onStepClick?: (step: number) => void;
}

const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  steps,
  currentStep,
  onStepClick,
}) => {
  return (
    <div className="relative">
      <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-lightgray-800 -translate-y-1/2" />
      <div className="relative flex justify-between">
        {steps.map((step, index) => (
          <div
            key={index}
            className="flex flex-col items-center"
            onClick={() => onStepClick?.(index)}
          >
            <motion.div
              initial={false}
              animate={{
                scale: currentStep >= index ? 1 : 0.8,
                backgroundColor: currentStep >= index ? '#89CFF0' : '#f6f6f6',
              }}
              className={`w-8 h-8 rounded-full flex items-center justify-center relative z-10 cursor-pointer
                ${currentStep >= index ? 'bg-turquoise-500' : 'bg-lightgray-500'}`}
            >
              <span className={`text-sm font-medium ${
                currentStep >= index ? 'text-midnight' : 'text-gray-500'
              }`}>
                {index + 1}
              </span>
            </motion.div>
            <span className="mt-2 text-sm text-gray-600">{step}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProgressIndicator;