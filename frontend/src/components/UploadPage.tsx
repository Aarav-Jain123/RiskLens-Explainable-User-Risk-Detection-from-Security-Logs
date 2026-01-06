import { useState, useRef } from 'react';
import { Plus, Upload, FileSpreadsheet } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { DashboardData } from '../types/dashboard';

interface UploadPageProps {
  onUploadComplete: (data: DashboardData) => void;
}

export function UploadPage({ onUploadComplete }: UploadPageProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const validTypes = [
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/csv',
    ];
    
    if (!validTypes.includes(file.type) && !file.name.match(/\.(xlsx|xls|csv)$/i)) {
      setError('Please select a valid Excel or CSV file (.xlsx, .xls, or .csv)');
      return;
    }

    setError(null);
    setUploading(true);

    const inDevMode = import.meta.env.MODE === 'development';
    const apiURL = inDevMode ? import.meta.env.VITE_API_BASE_URL_LOCAL : import.meta.env.VITE_API_BASE_URL_PROD;

    try {
      const formData = new FormData();
      formData.append('csv_file', file);

      const response = await fetch('http://127.0.0.1:8000/model_page/', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data: DashboardData = await response.json();
      onUploadComplete(data);
    } catch (err) {
      setError('Failed to upload file. Please try again.');
      console.error('Upload error:', err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center p-6">
      <Card className="max-w-2xl w-full p-12 text-center">
        <div className="mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <FileSpreadsheet className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-gray-900 mb-3">Risklens Dashboard</h1>
          <p className="text-gray-600">
            Upload your Excel or CSV report to analyze security threats, compliance metrics, and user activity
          </p>
        </div>

        <div className="space-y-4">
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/csv"
            onChange={handleFileChange}
            className="hidden"
          />

          <Button
            size="lg"
            onClick={handleButtonClick}
            disabled={uploading}
            className="gap-2 text-lg px-8 py-6 h-auto"
          >
            {uploading ? (
              <>
                <Upload className="h-5 w-5 animate-pulse" />
                Uploading...
              </>
            ) : (
              <>
                <Plus className="h-5 w-5" />
                New Report
              </>
            )}
          </Button>

          {error && (
            <p className="text-sm text-red-600 mt-4">{error}</p>
          )}

          <div className="mt-8 pt-8 border-t">
            <p className="text-sm text-gray-500 mb-2">Supported file formats</p>
            <div className="flex items-center justify-center gap-4">
              <span className="px-3 py-1 bg-green-100 text-green-700 rounded text-xs">
                .xlsx
              </span>
              <span className="px-3 py-1 bg-green-100 text-green-700 rounded text-xs">
                .xls
              </span>
              <span className="px-3 py-1 bg-green-100 text-green-700 rounded text-xs">
                .csv
              </span>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
