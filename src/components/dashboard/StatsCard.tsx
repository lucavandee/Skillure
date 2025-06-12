import React from 'react';
import { motion } from 'framer-motion';
import Card from '../ui/Card';
import { cn } from '../../utils/cn';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  description?: string;
  className?: string;
}

const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  icon,
  trend,
  description,
  className
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className={cn('p-6', className)}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-gray-500">{title}</h3>
          <div className="w-10 h-10 bg-turquoise-100 rounded-lg flex items-center justify-center text-turquoise-600">
            {icon}
          </div>
        </div>
        <div className="text-2xl font-bold mb-2">{value}</div>
        {(trend || description) && (
          <div className="flex items-center text-sm">
            {trend && (
              <span className={cn(
                'flex items-center font-medium',
                trend.isPositive ? 'text-green-600' : 'text-red-600'
              )}>
                {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
              </span>
            )}
            {description && (
              <span className="text-gray-500 ml-2">{description}</span>
            )}
          </div>
        )}
      </Card>
    </motion.div>
  );
};

export default StatsCard;