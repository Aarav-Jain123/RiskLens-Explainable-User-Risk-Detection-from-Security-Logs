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
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const inputRef = useRef<HTMLInputElement | null>(null);

  /* ----------------------------- API FETCH ----------------------------- */

  const fetchCleanData = async () => {
    setUploading(true);
    setError(null);

    try {
      const response = await fetch(
        'https://risklensbackend-g8apbyf5dgceefbx.centralindia-01.azurewebsites.net/clean_dataset_page/',
        { method: 'GET' }
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const contentType = response.headers.get('content-type');
      if (!contentType?.includes('application/json')) {
        throw new Error('Invalid JSON response');
      }

      const rawData = await response.json();

      /* ---------- NORMALIZE / MAP BACKEND DATA HERE ---------- */
      const mappedData: DashboardData = {
        summary: rawData.summary ?? {},
        users: rawData.users ?? [],
        entries: rawData.entries ?? [],
        metadata: rawData.metadata ?? {},
      };

      setDashboardData(mappedData);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'Failed to fetch data');
    } finally {
      setUploading(false);
    }
  };

  /* --------------------------- HANDLERS --------------------------- */

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

  /* ------------------------ AUTO FETCH ON LOAD ------------------------ */
  useEffect(() => {
    fetchCleanData();
  }, []);

  /* ----------------------------- RENDER ----------------------------- */

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
            <HeroPanel data={dashboardData} />
            <SummaryCards data={dashboardData} />

            <UserCarousel
              data={dashboardData}
              onSelectUser={handleSelectUser}
            />

            <button
              onClick={fetchCleanData}
              disabled={uploading}
              className="px-4 py-2 bg-black text-white rounded"
            >
              {uploading ? 'Loading…' : 'Refresh Clean Dataset'}
            </button>

            {error && <p className="text-red-500">{error}</p>}

            <input ref={inputRef} type="file" hidden />
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
