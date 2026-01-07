import { useState, useRef, useEffect } from 'react';
import { Plus, Upload, FileSpreadsheet, Shield, Eye, AlertCircle, CheckCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { DashboardData } from '../types/dashboard';

interface UploadPageProps {
  onUploadComplete: (data: DashboardData) => void;
}

export function UploadPage({ onUploadComplete }: UploadPageProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewName, setPreviewName] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Carousel images - extracted into a helper so you can later swap to CDN/local assets
  const carouselImages = [
    'https://raw.githubusercontent.com/Aarav-Jain123/RiskLens/refs/heads/main/Screenshot%202026-01-07%20004515.png',
    'https://raw.githubusercontent.com/Aarav-Jain123/RiskLens/refs/heads/main/Screenshot%202026-01-07%20004525.png',
    'https://raw.githubusercontent.com/Aarav-Jain123/RiskLens/refs/heads/main/Screenshot%202026-01-07%20004550.png',
  ];

  // Auto-play carousel
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % carouselImages.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [carouselImages.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % carouselImages.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + carouselImages.length) % carouselImages.length);
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const processFile = async (file: File, input?: HTMLInputElement) => {
    // Allow validation by extension ONLY (MIME lies for CSV)
    const isValidFile = /\.(xlsx|xls|csv)$/i.test(file.name);
    if (!isValidFile) {
      setError('Please select a valid Excel or CSV file (.xlsx, .xls, .csv)');
      if (input) input.value = '';
      return;
    }

    setError(null);
    setUploading(true);

    // Simple preview link using URL.createObjectURL
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
    setPreviewName(file.name);

    const isDev = import.meta.env.MODE === 'development';
    const baseURL = isDev
      ? import.meta.env.VITE_API_BASE_URL_LOCAL
      : import.meta.env.VITE_API_BASE_URL_PROD;

    if (!baseURL) {
      setError('API base URL is not configured');
      setUploading(false);
      return;
    }

    try {
      const formData = new FormData();
      formData.append('csv_file', file);

      // Append an explicit upload path
      const response = await fetch(`${baseURL}/api/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Upload failed (${response.status}): ${errorText}`);
      }

      const contentType = response.headers.get('content-type');
      if (!contentType?.includes('application/json')) {
        throw new Error('Server did not return JSON');
      }

      const data: DashboardData = await response.json();
      onUploadComplete(data);
    } catch (error) {
      console.error('Upload error:', error);
      setError(error instanceof Error ? error.message : 'Failed to upload file');
    } finally {
      setUploading(false);
      if (input) input.value = ''; // allow re-upload of same file
    }
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const input = event.target;
    const file = input.files?.[0];
    if (!file) return;
    processFile(file, input);
  };

  // Drag-and-drop handlers
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!uploading) {
      setDragActive(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (uploading) return;

    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    processFile(file);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Hero Section */}
      <div className="max-w-6xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 rounded-3xl mb-8 shadow-xl transform hover:scale-105 transition-transform duration-300">
            <Shield className="h-12 w-12 text-white" />
          </div>
          <h1 className="text-gray-900 mb-6 text-5xl">RiskLens</h1>
          <p className="text-2xl text-gray-700 max-w-3xl mx-auto font-light leading-relaxed mb-12">
            When responsibility rests on you, clarity matters more than data
          </p>

          {/* Carousel Section */}
          <div className="max-w-4xl mx-auto mb-8">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl bg-gradient-to-br from-slate-100 to-slate-200">
              {/* Carousel Images */}
              <div className="relative w-full h-[400px]">
                {carouselImages.map((image, index) => (
                  <div
                    key={index}
                    className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                      index === currentSlide ? 'opacity-100' : 'opacity-0'
                    }`}
                  >
                    <div className="relative w-full h-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
                      <img
                        src={image}
                        alt={`Dashboard preview ${index + 1}`}
                        className="w-full h-full object-contain"
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Custom Navigation Arrows */}
              <button
                onClick={prevSlide}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white rounded-full p-3 shadow-lg transition-all duration-200 hover:scale-110"
                aria-label="Previous slide"
              >
                <ChevronLeft className="h-6 w-6 text-gray-800" />
              </button>
              <button
                onClick={nextSlide}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white rounded-full p-3 shadow-lg transition-all duration-200 hover:scale-110"
                aria-label="Next slide"
              >
                <ChevronRight className="h-6 w-6 text-gray-800" />
              </button>

              {/* Dots Indicator */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex gap-2">
                {carouselImages.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => goToSlide(index)}
                    className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                      index === currentSlide
                        ? 'bg-blue-600 w-8'
                        : 'bg-blue-300 hover:bg-blue-400'
                    }`}
                    aria-label={`Go to slide ${index + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="space-y-16">
          {/* Situation */}
          {/* ... all your narrative sections remain unchanged ... */}

          {/* Comparison */}
          <section className="bg-white rounded-xl p-10 shadow-md hover:shadow-xl transition-shadow duration-300 border border-gray-100">
            <h2 className="text-gray-900 mb-6 text-3xl">A simple comparison (this matters)</h2>
            <div className="max-w-none space-y-4">
              <p className="text-gray-700 leading-relaxed text-lg">
                To understand the difference RiskLens makes, consider two real-world scenarios.
              </p>
              <p className="text-gray-700 leading-relaxed text-lg mb-6">
                You can review both below:
              </p>
              <div className="grid md:grid-cols-2 gap-8">
                <Card className="p-8 border-2 border-green-300 bg-gradient-to-br from-green-50 to-emerald-50 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                  <div className="text-3xl mb-3">🔹</div>
                  <h3 className="text-gray-900 font-semibold mb-3 text-xl">Clean activity dataset</h3>
                  <p className="text-sm text-gray-700 mb-6 leading-relaxed">
                    Represents routine, expected employee behavior over a normal reporting period.
                  </p>
                  <a
                    href="https://risklensbackend-g8apbyf5dgceefbx.centralindia-01.azurewebsites.net/clean_dataset_page/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-blue-600 hover:text-blue-700 text-sm font-semibold underline hover:no-underline transition-all"
                  >
                    View clean dataset analysis →
                  </a>
                </Card>
                <Card className="p-8 border-2 border-amber-300 bg-gradient-to-br from-amber-50 to-orange-50 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                  <div className="text-3xl mb-3">🔹</div>
                  <h3 className="text-gray-900 font-semibold mb-3 text-xl">Unusual activity dataset</h3>
                  <p className="text-sm text-gray-700 mb-6 leading-relaxed">
                    Contains subtle patterns that may warrant review when seen in context.
                  </p>
                  <a
                    href="https://risklensbackend-g8apbyf5dgceefbx.centralindia-01.azurewebsites.net/unusual_dataset_page/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-blue-600 hover:text-blue-700 text-sm font-semibold underline hover:no-underline transition-all"
                  >
                    View unusual dataset analysis →
                  </a>
                </Card>
              </div>
              <p className="text-gray-700 leading-relaxed text-lg mt-8">
                These datasets are analyzed using the same process. The difference lies in what becomes visible.
              </p>
              <p className="text-gray-600 text-base mt-4 italic">
                No uploads. No setup. Just outcomes.
              </p>
            </div>
          </section>

          {/* ... keep all the intervening sections unchanged ... */}

          {/* Upload Section with drag-and-drop */}
          <section className="bg-white rounded-2xl p-12 shadow-2xl border-4 border-blue-300 hover:border-blue-400 transition-all duration-300">
            <div className="text-center">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-600 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-xl transform hover:rotate-6 transition-transform duration-300">
                <FileSpreadsheet className="h-12 w-12 text-white" />
              </div>
              <h2 className="text-gray-900 mb-4 text-3xl">Get Started</h2>
              <p className="text-gray-600 mb-10 text-lg max-w-2xl mx-auto">
                Upload your Excel or CSV report to analyze employee activity data and gain clarity
              </p>

              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                className={`border-2 border-dashed rounded-2xl p-12 transition-all duration-200 ${
                  dragActive ? 'border-blue-500 bg-blue-50' : 'border-blue-300 bg-white'
                }`}
              >
                <p className="mb-4 text-gray-600">
                  Drag and drop your file here, or use the button below.
                </p>

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
                    className="gap-3 text-xl px-12 py-8 h-auto shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                  >
                    {uploading ? (
                      <>
                        <Upload className="h-6 w-6 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Plus className="h-6 w-6" />
                        New Report
                      </>
                    )}
                  </Button>

                  {error && (
                    <p className="text-sm text-red-600 mt-4 bg-red-50 p-3 rounded-lg">{error}</p>
                  )}

                  {previewUrl && previewName && (
                    <div className="mt-4 text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">
                      <p className="font-medium mb-1">Selected file preview:</p>
                      <a
                        href={previewUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 underline break-all"
                      >
                        {previewName}
                      </a>
                    </div>
                  )}

                  <div className="mt-10 pt-8 border-t border-gray-200">
                    <p className="text-sm text-gray-500 mb-4 font-medium">Supported file formats</p>
                    <div className="flex items-center justify-center gap-4 mb-6">
                      <span className="px-4 py-2 bg-green-100 text-green-700 rounded-lg text-sm font-semibold shadow-sm">
                        .xlsx
                      </span>
                      <span className="px-4 py-2 bg-green-100 text-green-700 rounded-lg text-sm font-semibold shadow-sm">
                        .xls
                      </span>
                      <span className="px-4 py-2 bg-green-100 text-green-700 rounded-lg text-sm font-semibold shadow-sm">
                        .csv
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 bg-gray-50 p-4 rounded-lg">
                      Grab sample datasets from{' '}
                      <a
                        href="https://github.com/Aarav-Jain123/RiskLens/tree/main/datasets"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-700 font-semibold underline hover:no-underline transition-all"
                      >
                        github.com/Aarav-Jain123/RiskLens/datasets
                      </a>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Closing */}
          <section className="text-center py-12">
            <p className="text-gray-800 text-2xl font-light italic">
              When understanding arrives early, action doesn't have to be reactive.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
