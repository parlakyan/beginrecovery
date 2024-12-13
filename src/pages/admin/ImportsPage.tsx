import React, { useState, useEffect, useRef } from 'react';
import { Upload, FileSpreadsheet, AlertTriangle, MapPin, XCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { importService } from '../../services/imports/importService';
import { ImportJob, ImportedFacility } from '../../services/imports/types';
import { Button } from '../../components/ui';
import Papa from 'papaparse';

export default function ImportsPage() {
  const [jobs, setJobs] = useState<ImportJob[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch import jobs
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const jobs = await importService.getImportJobs();
        setJobs(jobs);
      } catch (err) {
        console.error('Error fetching import jobs:', err);
        setError('Failed to load import jobs');
      }
    };

    fetchJobs();
  }, []);

  // Handle file selection
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'text/csv') {
      setSelectedFile(file);
      setError(null);
    } else {
      setError('Please select a CSV file');
    }
  };

  // Handle file upload and import
  const handleImport = async () => {
    if (!selectedFile) return;

    setUploading(true);
    setError(null);

    try {
      // Parse CSV
      const results = await new Promise<any>((resolve, reject) => {
        Papa.parse(selectedFile, {
          header: true,
          complete: resolve,
          error: reject
        });
      });

      if (!results.data?.length) {
        throw new Error('No data found in CSV file');
      }

      // Create import job
      const jobId = await importService.createImportJob({
        fileName: selectedFile.name,
        userId: 'admin', // TODO: Get from auth
        totalFacilities: results.data.length
      });

      // Start import process
      await importService.importBasicData(jobId, results.data);

      // Start address processing
      importService.processAddresses(jobId).catch(console.error);

      // Refresh jobs list
      const updatedJobs = await importService.getImportJobs();
      setJobs(updatedJobs);

      // Reset form
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

    } catch (err) {
      console.error('Error importing facilities:', err);
      setError(err instanceof Error ? err.message : 'Failed to import facilities');
    } finally {
      setUploading(false);
    }
  };

  // Handle job cancellation
  const handleCancel = async (jobId: string) => {
    try {
      setCancelling(jobId);
      await importService.cancelImportJob(jobId);
      const updatedJobs = await importService.getImportJobs();
      setJobs(updatedJobs);
    } catch (err) {
      console.error('Error cancelling import:', err);
      setError(err instanceof Error ? err.message : 'Failed to cancel import');
    } finally {
      setCancelling(null);
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  // Calculate progress percentage
  const calculateProgress = (job: ImportJob) => {
    const { totalFacilities, processedFacilities, geocodedAddresses } = job.stats;
    
    if (job.status === 'importing') {
      return (processedFacilities / totalFacilities) * 50; // First 50%
    }
    
    if (job.status === 'geocoding') {
      return 50 + (geocodedAddresses / totalFacilities) * 50; // Last 50%
    }
    
    if (job.status === 'completed') return 100;
    if (job.status === 'failed') return 0;
    return 0;
  };

  // Calculate total addresses needing review
  const totalNeedingReview = jobs.reduce((total, job) => 
    total + job.stats.partialMatches, 0
  );

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <div className="flex items-center gap-3 mb-8">
        <FileSpreadsheet className="w-8 h-8 text-blue-600" />
        <h1 className="text-2xl font-bold">Import Facilities</h1>
      </div>

      {/* Address Review Banner */}
      {totalNeedingReview > 0 && (
        <div className="mb-8 p-4 bg-yellow-50 rounded-lg">
          <div className="flex items-start gap-3">
            <MapPin className="w-5 h-5 text-yellow-700 flex-shrink-0 mt-0.5" />
            <div>
              <div className="font-medium text-yellow-800">
                {totalNeedingReview} {totalNeedingReview === 1 ? 'address needs' : 'addresses need'} review
              </div>
              <p className="text-sm text-yellow-700 mt-1">
                Some addresses could not be fully matched and need manual review.
              </p>
              <Link
                to="/admin/address-review"
                className="inline-block mt-2 px-4 py-2 bg-yellow-100 text-yellow-800 rounded-lg hover:bg-yellow-200 transition-colors"
              >
                Review Addresses
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Upload Section */}
      <div className="mb-8 p-6 bg-gray-50 rounded-lg">
        <h2 className="text-lg font-semibold mb-4">Upload CSV File</h2>
        <div className="space-y-4">
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={handleFileSelect}
            className="block w-full text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
          {error && (
            <div className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="w-4 h-4" />
              <span>{error}</span>
            </div>
          )}
          <Button
            variant="primary"
            disabled={!selectedFile || uploading}
            onClick={handleImport}
            className="flex items-center gap-2"
          >
            <Upload className="w-4 h-4" />
            {uploading ? 'Importing...' : 'Start Import'}
          </Button>
        </div>
      </div>

      {/* Import Jobs List */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Import History</h2>
        <div className="space-y-4">
          {jobs.map(job => (
            <div 
              key={job.id} 
              className="p-4 bg-gray-50 rounded-lg"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-medium">{job.fileName}</h3>
                  <p className="text-sm text-gray-600">
                    Started: {formatDate(job.createdAt)}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 rounded-full text-sm ${
                    job.status === 'completed' ? 'bg-green-100 text-green-800' :
                    job.status === 'failed' ? 'bg-red-100 text-red-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                  </span>
                  {(job.status === 'importing' || job.status === 'geocoding') && (
                    <Button
                      variant="secondary"
                      disabled={cancelling === job.id}
                      onClick={() => handleCancel(job.id)}
                      className="flex items-center gap-1 bg-red-50 text-red-700 hover:bg-red-100 px-3 py-1.5 text-sm"
                    >
                      <XCircle className="w-4 h-4" />
                      {cancelling === job.id ? 'Cancelling...' : 'Cancel'}
                    </Button>
                  )}
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
                <div
                  className={`h-2.5 rounded-full ${
                    job.status === 'completed' ? 'bg-green-600' :
                    job.status === 'failed' ? 'bg-red-600' :
                    'bg-blue-600'
                  }`}
                  style={{ width: `${calculateProgress(job)}%` }}
                ></div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <div className="text-gray-600">Total</div>
                  <div className="font-medium">{job.stats.totalFacilities}</div>
                </div>
                <div>
                  <div className="text-gray-600">Processed</div>
                  <div className="font-medium">{job.stats.processedFacilities}</div>
                </div>
                <div>
                  <div className="text-gray-600">Geocoded</div>
                  <div className="font-medium">{job.stats.geocodedAddresses}</div>
                </div>
                <div>
                  <div className="text-gray-600">Needs Review</div>
                  <div className="font-medium">{job.stats.partialMatches}</div>
                </div>
              </div>

              {/* Error Message */}
              {job.error && (
                <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-lg">
                  {job.error}
                </div>
              )}
            </div>
          ))}

          {jobs.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              No import jobs found
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
