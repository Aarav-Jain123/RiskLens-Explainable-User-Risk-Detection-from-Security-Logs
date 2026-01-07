import { useState, useEffect } from 'react';
import { Navbar } from './Navbar';
import { HeroPanel } from './HeroPanel';
import { SummaryCards } from './SummaryCards';
import { EntriesTable } from './EntriesTable';
import { DashboardView } from './DashboardView';
import { UserCarousel } from './UserCarousel';
import { UploadPage } from './UploadPage';
import { DashboardData } from '../types/dashboard';

export default function App() {
  const [isFileUploaded, setIsFileUploaded] = useState(false);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [currentView, setCurrentView] = useState<'overview' | 'dashboard'>('overview');
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        'https://risklensbackend-g8apbyf5dgceefbx.centralindia-01.azurewebsites.net/clean_dataset_page/'
      );
      
      if (!response.ok) throw new Error('Network response was not ok');
      
      const rawData = await response.json();

      // Mapping values to match your component expectations
      const mappedData: DashboardData = {
        model_performance: rawData.model_performance,
        threat_analytics: rawData.threat_analytics,
        user_activity_monitor: rawData.user_activity_monitor,
      };

      setDashboardData(mappedData);
      setIsFileUploaded(true);
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Trigger the GET request on mount
  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleUploadComplete = (data: DashboardData) => {
    setDashboardData(data);
    setIsFileUploaded(true);
  };

  const handleNewReport = () => {
    setIsFileUploaded(false);
    setDashboardData(null);
    setCurrentView('overview');
    setSelectedUserId(null);
    fetchDashboardData(); // Re-fetch on reset if desired
  };

  const handleSelectUser = (userId: string) => {
    setSelectedUserId(userId);
    setCurrentView('dashboard');
  };

  const handleBackToOverview = () => {
    setCurrentView('overview');
    setSelectedUserId(null);
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!isFileUploaded) {
    return <UploadPage onUploadComplete={handleUploadComplete} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar currentView={currentView} onViewChange={setCurrentView} onNewReport={handleNewReport} />
      
      <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {currentView === 'overview' ? (
          <>
            <HeroPanel data={dashboardData?.model_performance} />
            <SummaryCards data={dashboardData?.threat_analytics} />
            <UserCarousel data={dashboardData?.user_activity_monitor} onSelectUser={handleSelectUser} />
            <EntriesTable />
          </>
        ) : (
          <DashboardView 
            userId={selectedUserId} 
            data={dashboardData} 
            onBack={handleBackToOverview} 
          />
        )}
      </main>
    </div>
  );
}
