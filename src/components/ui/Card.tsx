import React from 'react';
import { cn } from '../../utils/cn';

interface CardProps {
  className?: string;
  children: React.ReactNode;
  hoverable?: boolean;
  bordered?: boolean;
}

const Card: React.FC<CardProps> = ({ className, children, hoverable = false, bordered = false }) => {
  return (
    <div
      className={cn(
        'card',
        hoverable && 'transition-all duration-300 hover:shadow-lg',
        bordered && 'border border-lightgray-800',
        className
      )}
    >
      {children}
    </div>
  );
};

export default Card;

interface CardHeaderProps {
  className?: string;
  children: React.ReactNode;
}

export const CardHeader: React.FC<CardHeaderProps> = ({ className, children }) => {
  return <div className={cn('mb-4', className)}>{children}</div>;
};

interface CardTitleProps {
  className?: string;
  children: React.ReactNode;
}

export const CardTitle: React.FC<CardTitleProps> = ({ className, children }) => {
  return <h3 className={cn('text-xl font-bold', className)}>{children}</h3>;
};

interface CardContentProps {
  className?: string;
  children: React.ReactNode;
}

export const CardContent: React.FC<CardContentProps> = ({ className, children }) => {
  return <div className={cn('', className)}>{children}</div>;
};

interface CardFooterProps {
  className?: string;
  children: React.ReactNode;
}

export const CardFooter: React.FC<CardFooterProps> = ({ className, children }) => {
  return <div className={cn('mt-4 pt-4 border-t border-lightgray-800', className)}>{children}</div>;
};