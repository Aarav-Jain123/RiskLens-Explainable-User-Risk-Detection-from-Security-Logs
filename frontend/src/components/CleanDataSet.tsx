import { useState, useRef, useEffect } from 'react';
import { Navbar } from './Navbar';
import { HeroPanel } from './HeroPanel';
import { SummaryCards } from './SummaryCards';
import { EntriesTable } from './EntriesTable';
import { DashboardView } from './DashboardView';
import { UserCarousel } from './UserCarousel';
import { DashboardData } from '../types/dashboard';

export default function CleanDataSet() {
  const [currentView, setCurrentView] = useState<'overview' | 'user'>('overview');
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
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

      if (!response.ok) throw new Error(`Server responded with ${response.status}`);

      const raw = await response.json();

      // ✅ MAPPING LOGIC
      // We explicitly map the fields to ensure the structure matches our Interface
      const mappedData: DashboardData = {
        model_performance: {
          accuracy: raw.model_performance?.accuracy || "0%",
          status: raw.model_performance?.status || "Unknown",
        },
        threat_analytics: {
          total_threat_count: raw.threat_analytics?.total_threat_count || 0,
          threats_per_day: raw.threat_analytics?.threats_per_day || {},
          top_threat_subclasses: raw.threat_analytics?.top_threat_subclasses || {},
          risk_percentage_by_event: raw.threat_analytics?.risk_percentage_by_event || {},
        },
        user_activity_monitor: raw.user_activity_monitor || [],
      };

      setDashboardData(mappedData);
    } catch (e) {
      console.error("Fetch Error:", e);
      setError('Failed to load dashboard data. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCleanData();
  }, []);

  // ... (handlers stay the same)

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar currentView={currentView} onViewChange={setCurrentView} onNewReport={() => inputRef.current?.click()} />

      <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {loading && <div className="animate-pulse text-center p-10">Loading Security Data...</div>}
        {error && <div className="bg-red-50 text-red-700 p-4 rounded-lg border border-red-200">{error}</div>}

        {!loading && dashboardData && (
          currentView === 'overview' ? (
            <>
              {/* Data passed down matches the mapped structure */}
              <HeroPanel data={dashboardData.model_performance} />
              <SummaryCards data={dashboardData.threat_analytics} />
              <UserCarousel 
                data={dashboardData.user_activity_monitor} 
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
