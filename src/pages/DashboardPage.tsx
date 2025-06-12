import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, Clock, TrendingUp, MessageSquare, Download, BarChart2 } from 'lucide-react';
import StatsCard from '../components/dashboard/StatsCard';
import ChartCard from '../components/dashboard/ChartCard';
import PipelineBoard from '../components/dashboard/PipelineBoard';
import Button from '../components/ui/Button';

const DashboardPage: React.FC = () => {
  const matchesData = [
    { month: 'Jan', matches: 15 },
    { month: 'Feb', matches: 18 },
    { month: 'Mar', matches: 22 },
    { month: 'Apr', matches: 28 },
    { month: 'May', matches: 25 },
    { month: 'Jun', matches: 30 }
  ];

  const branchData = [
    { name: 'Tech', value: 50 },
    { name: 'Healthcare', value: 30 },
    { name: 'Finance', value: 20 }
  ];

  const handleExport = () => {
    // Create CSV content
    const csvContent = `Vacature,Kandidaat,Status,Datum\n` +
      `Frontend Developer,Jan de Vries,Matched,2024-02-20\n` +
      `Data Engineer,Emma Bakker,Gecontacteerd,2024-02-19`;

    // Create and trigger download
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'pipeline-export.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-lightgray-500 min-h-screen py-8">
      <div className="container-custom">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
            <p className="text-gray-600">
              Overzicht van uw recruitment activiteiten en inzichten
            </p>
          </div>
          <div className="mt-4 md:mt-0 flex gap-3">
            <Button
              variant="outline"
              leftIcon={<Download size={16} />}
              onClick={handleExport}
            >
              Exporteer Data
            </Button>
            <Button
              variant="primary"
              leftIcon={<BarChart2 size={16} />}
            >
              Genereer Rapport
            </Button>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard
            title="Vacatures Geplaatst"
            value="12"
            icon={<FileText size={20} />}
            trend={{ value: 15, isPositive: true }}
            description="vs. vorige maand"
          />
          <StatsCard
            title="Gem. Time-to-Match"
            value="2 dagen"
            icon={<Clock size={20} />}
            trend={{ value: 25, isPositive: true }}
            description="vs. vorige maand"
          />
          <StatsCard
            title="Match-Succesratio"
            value="45%"
            icon={<TrendingUp size={20} />}
            trend={{ value: 10, isPositive: true }}
            description="vs. vorige maand"
          />
          <StatsCard
            title="Pitch Response Rate"
            value="30%"
            icon={<MessageSquare size={20} />}
            trend={{ value: 5, isPositive: true }}
            description="vs. vorige maand"
          />
        </div>

        {/* Pipeline Board */}
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4">Pipeline</h2>
          <PipelineBoard />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartCard
            title="Matches per Maand"
            type="bar"
            data={matchesData}
            xKey="month"
            yKey="matches"
          />
          <ChartCard
            title="Branche-verdeling"
            type="pie"
            data={branchData}
            yKey="value"
          />
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;