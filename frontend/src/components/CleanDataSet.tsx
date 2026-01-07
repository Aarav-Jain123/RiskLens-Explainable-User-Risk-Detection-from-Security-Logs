import { useState, useRef, useEffect } from 'react';
import { Navbar } from './Navbar';
import { HeroPanel } from './HeroPanel';
import { SummaryCards } from './SummaryCards';
import { DashboardView } from './DashboardView';
import { UserCarousel } from './UserCarousel';

export default function CleanDataSet() {
  const [currentView, setCurrentView] = useState<'overview' | 'user'>('overview');
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const inputRef = useRef<HTMLInputElement | null>(null);

  const fetchCleanData = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        'https://risklensbackend-g8apbyf5dgceefbx.centralindia-01.azurewebsites.net/clean_dataset_page/'
      );

      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const raw = await response.json();

      // ✅ THE ONLY IMPORTANT PART — JSON MAPPING
      setDashboardData({
        model_performance: raw.model_performance,
        threat_analytics: raw.threat_analytics,
        user_activity_monitor: raw.user_activity_monitor,
      });
    } catch (e) {
      console.error(e);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCleanData();
  }, []);

  const handleSelectUser = (userId: string) => {
    setSelectedUserId(userId);
    setCurrentView('user');
  };

  const handleBackToOverview = () => {
    setSelectedUserId(null);
    setCurrentView('overview');
  };

  const handleNewReport = () => {
    inputRef.current?.click();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar
        currentView={currentView}
        onViewChange={setCurrentView}
        onNewReport={handleNewReport}
      />

      <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {loading && <p>Loading…</p>}
        {error && <p className="text-red-500">{error}</p>}

        {!loading && !error && dashboardData && (
          currentView === 'overview' ? (
            <>
              {/* ✅ MODEL PERFORMANCE */}
              <HeroPanel data={dashboardData?.model_performance} />

              {/* ✅ THREAT ANALYTICS */}
              <SummaryCards data={dashboardData?.threat_analytics} />

              {/* ✅ USER ACTIVITY */}
              <UserCarousel
                data={dashboardData?.user_activity_monitor}
                onSelectUser={handleSelectUser}
              />
            </>
          ) : (
            <DashboardView
              userId={selectedUserId}
              data={dashboardData}
              onBack={handleBackToOverview}
            />
          )
        )}

        <input ref={inputRef} type="file" hidden />
      </main>
    </div>
  );
}
