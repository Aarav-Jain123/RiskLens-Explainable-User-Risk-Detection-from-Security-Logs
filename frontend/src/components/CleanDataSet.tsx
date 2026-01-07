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

  // 🔹 GET request + mapping
  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        const res = await fetch(
          'https://risklensbackend-g8apbyf5dgceefbx.centralindia-01.azurewebsites.net/clean_dataset_page/'
        );

        if (!res.ok) throw new Error('Failed to fetch');

        const raw = await res.json();

        const mappedData: DashboardData = {
          model_performance: raw.model_performance,
          threat_analytics: raw.threat_analytics,
          user_activity_monitor: raw.user_activity_monitor,
        };

        setDashboardData(mappedData);
        setIsFileUploaded(true);
      } catch (err) {
        console.error('Dashboard fetch failed:', err);
      } finally {
        setLoading(false);
      }
    };

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
    return <div>Loading...</div>;
  }

  if (!isFileUploaded || !dashboardData) {
    return <UploadPage onUploadComplete={handleUploadComplete} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar
        currentView={currentView}
        onViewChange={setCurrentView}
        onNewReport={handleNewReport}
      />

      <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {currentView === 'overview' ? (
          <>
            <HeroPanel data={dashboardData.model_performance} />
            <SummaryCards data={dashboardData.threat_analytics} />
            <UserCarousel
              data={dashboardData.user_activity_monitor}
              onSelectUser={handleSelectUser}
            />
            <EntriesTable />
          </>
        ) : (
          selectedUserId && (
            <DashboardView
              userId={selectedUserId}
              data={dashboardData}
              onBack={handleBackToOverview}
            />
          )
        )}
      </main>
    </div>
  );
}
