import { Card } from './ui/card';
import { DashboardData } from '../types/dashboard';

interface SummaryCardsProps {
  data: DashboardData | null;
}

interface CircularProgressProps {
  percentage: number;
  color: string;
  size?: number;
  strokeWidth?: number;
}

function CircularProgress({ percentage, color, size = 100, strokeWidth = 10 }: CircularProgressProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;
  const center = size / 2;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={center}
          cy={center}
          r={radius}
          stroke="#e5e7eb"
          strokeWidth={strokeWidth}
          fill="none"
        />
        <circle
          cx={center}
          cy={center}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-2xl font-semibold">{percentage}%</span>
      </div>
    </div>
  );
}

export function SummaryCards({ data }: SummaryCardsProps) {
  if (!data) {
    return (
      <div className="text-center py-12 text-gray-400">
        No threat data available
      </div>
    );
  }

  const { threat_analytics } = data;
  
  const totalThreats = threat_analytics.total_threat_count;
  
  const threatsPerDayData = threat_analytics.threats_per_day;
  const daysWithThreats = Object.keys(threatsPerDayData).length;
  const avgThreatsPerDay = daysWithThreats > 0 
    ? Math.round((totalThreats / daysWithThreats) * 10) / 10 
    : 0;
  
  const maxThreatsInDay = Math.max(...Object.values(threatsPerDayData));
  
  const maxDayPercentage = totalThreats > 0 
    ? Math.round((maxThreatsInDay / totalThreats) * 100)
    : 0;
  
  const topThreatSubclasses = threat_analytics.top_threat_subclasses;
  const threatEntries = Object.entries(topThreatSubclasses);
  
  const threatPercentages = threatEntries.map(([name, count]) => ({
    name,
    count,
    percentage: Math.round((count / totalThreats) * 100),
  }));
  
  const failedLoginData = threatPercentages.find(t => t.name === 'failed_login');
  const failedLoginPercentage = failedLoginData?.percentage || 0;
  
  const phishingClickData = threatPercentages.find(t => t.name === 'phishing_click');
  const phishingClickPercentage = phishingClickData?.percentage || 0;
  
  const avgThreatPercentage = daysWithThreats > 0
    ? Math.min(Math.round((avgThreatsPerDay / maxThreatsInDay) * 100), 100)
    : 0;

  const complianceData = [
    {
      title: 'Failed Login Attempts',
      percentage: failedLoginPercentage,
      label: `${failedLoginData?.count || 0} of ${totalThreats} Threats`,
      color: '#ef4444',
    },
    {
      title: 'Phishing Click Events',
      percentage: phishingClickPercentage,
      label: `${phishingClickData?.count || 0} of ${totalThreats} Threats`,
      color: '#f59e0b',
    },
    {
      title: 'Peak Threat Day',
      percentage: maxDayPercentage,
      label: `${maxThreatsInDay} Threats in One Day`,
      color: '#3b82f6',
    },
    {
      title: 'Average Daily Threats',
      percentage: avgThreatPercentage,
      label: `${avgThreatsPerDay} Threats Per Day`,
      color: '#10b981',
    },
    {
      title: 'Monitoring Period',
      percentage: Math.min(Math.round((daysWithThreats / 31) * 100), 100),
      label: `${daysWithThreats} Days Tracked`,
      color: '#8b5cf6',
    },
    {
      title: 'Threat Coverage',
      percentage: Math.round((threatEntries.length / 5) * 100),
      label: `${threatEntries.length} Threat Types`,
      color: '#ec4899',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-gray-900 mb-4 text-center">Threat Analytics Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {complianceData.slice(0, 3).map((item) => (
            <Card key={item.title} className="p-6">
              <div className="flex flex-col items-center text-center space-y-4">
                <h3 className="text-sm text-gray-700">{item.title}</h3>
                <CircularProgress percentage={item.percentage} color={item.color} />
                <p className="text-sm text-gray-600">{item.label}</p>
              </div>
            </Card>
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-gray-900 mb-4 text-center">Activity Metrics</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {complianceData.slice(3, 6).map((item) => (
            <Card key={item.title} className="p-6">
              <div className="flex flex-col items-center text-center space-y-4">
                <h3 className="text-sm text-gray-700">{item.title}</h3>
                <CircularProgress percentage={item.percentage} color={item.color} />
                <p className="text-sm text-gray-600">{item.label}</p>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
