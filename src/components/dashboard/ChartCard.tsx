import React from 'react';
import { motion } from 'framer-motion';
import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import Card from '../ui/Card';

interface ChartCardProps {
  title: string;
  type: 'bar' | 'pie';
  data: any[];
  xKey?: string;
  yKey?: string;
  className?: string;
}

const ChartCard: React.FC<ChartCardProps> = ({
  title,
  type,
  data,
  xKey = 'name',
  yKey = 'value',
  className
}) => {
  const colors = ['#89CFF0', '#0D1B2A', '#5CBAE6', '#B6D0E2', '#2A7DA1'];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className={className}>
        <div className="p-6">
          <h3 className="text-lg font-bold mb-4">{title}</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              {type === 'bar' ? (
                <RechartsBarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f3f3" />
                  <XAxis
                    dataKey={xKey}
                    tick={{ fontSize: 12 }}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 12 }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #f3f3f3',
                      borderRadius: '8px',
                      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)'
                    }}
                  />
                  <Bar
                    dataKey={yKey}
                    fill="#89CFF0"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={40}
                  />
                </RechartsBarChart>
              ) : (
                <PieChart>
                  <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    fill="#89CFF0"
                    paddingAngle={5}
                    dataKey={yKey}
                  >
                    {data.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #f3f3f3',
                      borderRadius: '8px',
                      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)'
                    }}
                  />
                </PieChart>
              )}
            </ResponsiveContainer>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

export default ChartCard;