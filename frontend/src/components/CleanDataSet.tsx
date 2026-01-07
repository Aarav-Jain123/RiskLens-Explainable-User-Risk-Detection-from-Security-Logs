import { useState, useRef, useEffect } from 'react';
import { Navbar } from './Navbar';
import { HeroPanel } from './HeroPanel';
import { SummaryCards } from './SummaryCards';
import { EntriesTable } from './EntriesTable';
import { DashboardView } from './DashboardView';
import { UserCarousel } from './UserCarousel';

export default function UnusualDataSet() {
  const [currentView, setCurrentView] = useState('overview');
  const [dashboardData, setDashboardData] = useState(null);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const inputRef = useRef(null);

  const fetchCleanData = async () => {
    setError(null);
    setUploading(true);

    try {
      const response = await fetch(`https://risklensbackend-g8apbyf5dgceefbx.centralindia-01.azurewebsites.net/dirty_dataset_page/`, {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error(`Fetch failed (${response.status})`);
      }

      const data = await response.json();
      
      // Values mapped to the state object
      setDashboardData({
        model_performance: data.model_performance,
        threat_analytics: data.threat_analytics,
        user_activity_monitor: data.user_activity_monitor,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch data');
    } finally {
      setUploading(false);
    }
  };

  // Auto-fetch on load
  useEffect(() => {
    fetchCleanData();
  }, []);

  const handleNewReport = () => { inputRef.current?.click(); };
  const handleSelectUser = (userId) => {
    setSelectedUserId(userId);
    setCurrentView('user');
  };
  const handleBackToOverview = () => {
    setSelectedUserId(null);
    setCurrentView('overview');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar currentView={currentView} onViewChange={setCurrentView} onNewReport={handleNewReport} />
      
      <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {currentView === 'overview' ? (
          <>
            {/* Value Mapping to Props */}
            <HeroPanel data={dashboardData?.model_performance} />
            <SummaryCards data={dashboardData?.threat_analytics} />
            <UserCarousel 
              data={dashboardData?.user_activity_monitor} 
              onSelectUser={handleSelectUser} 
            />
            
            <EntriesTable />
            
            <button onClick={fetchCleanData} disabled={uploading}>
              {uploading ? 'Loading...' : 'Fetch Clean Dataset'}
            </button>
            
            {error && <p className="text-red-500">{error}</p>}
            <input ref={inputRef} type="file" style={{ display: 'none' }} />
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
