import React, { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { migrateLegacyCollections } from '../../scripts/migrateLegacyCollections';
import { Shield } from 'lucide-react';

interface CollectionStats {
  name: string;
  count: number;
  status: 'legacy' | 'current';
}

interface CollectionConfig {
  name: string;
  status: 'legacy' | 'current';
}

export default function MigrationsPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<CollectionStats[]>([]);
  const [migrationLog, setMigrationLog] = useState<string[]>([]);

  // Get collection statistics
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const collections: CollectionConfig[] = [
          { name: 'pending_facilities', status: 'legacy' },
          { name: 'treatmentOptions', status: 'legacy' },
          { name: 'facilities', status: 'current' },
          { name: 'treatmentTypes', status: 'current' },
          { name: 'claims', status: 'current' }
        ];

        const stats = await Promise.all(
          collections.map(async ({ name, status }) => {
            const snapshot = await getDocs(collection(db, name));
            return {
              name,
              count: snapshot.size,
              status
            } as CollectionStats;
          })
        );

        setStats(stats);
      } catch (err) {
        const error = err as Error;
        console.error('Error fetching collection stats:', error);
        setError('Failed to fetch collection statistics');
      }
    };

    fetchStats();
  }, []);

  const handleMigrate = async () => {
    try {
      setLoading(true);
      setError(null);
      setMigrationLog(['Starting migration...']);

      // Add log listener
      const originalConsoleLog = console.log;
      console.log = (...args) => {
        setMigrationLog(prev => [...prev, args.join(' ')]);
        originalConsoleLog.apply(console, args);
      };

      // Run migration
      await migrateLegacyCollections();
      
      // Restore console.log
      console.log = originalConsoleLog;

      // Refresh stats
      const collections: CollectionConfig[] = [
        { name: 'pending_facilities', status: 'legacy' },
        { name: 'treatmentOptions', status: 'legacy' },
        { name: 'facilities', status: 'current' },
        { name: 'treatmentTypes', status: 'current' },
        { name: 'claims', status: 'current' }
      ];

      const updatedStats = await Promise.all(
        collections.map(async ({ name, status }) => {
          const snapshot = await getDocs(collection(db, name));
          return {
            name,
            count: snapshot.size,
            status
          } as CollectionStats;
        })
      );

      setStats(updatedStats);
      setMigrationLog(prev => [...prev, 'Migration completed successfully']);
    } catch (err) {
      const error = err as Error;
      console.error('Error running migration:', error);
      setError('Failed to run migration');
      setMigrationLog(prev => [...prev, `Error: ${error.message}`]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <div className="flex items-center gap-3 mb-8">
        <Shield className="w-8 h-8 text-blue-600" />
        <h1 className="text-2xl font-bold">Database Migrations</h1>
      </div>

      {/* Collection Stats */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-4">Collection Statistics</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {stats.map(({ name, count, status }) => (
            <div
              key={name}
              className={`p-4 rounded-lg ${
                status === 'legacy' 
                  ? 'bg-yellow-50 text-yellow-800'
                  : 'bg-blue-50 text-blue-800'
              }`}
            >
              <div className="font-medium">{name}</div>
              <div className="text-sm opacity-75">
                {count} documents
                {status === 'legacy' && ' (legacy)'}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Migration Controls */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-4">Run Migration</h2>
        <div className="space-y-4">
          <p className="text-gray-600">
            This will migrate all data from legacy collections to their new structure.
            Make sure to backup your database before proceeding.
          </p>
          <button
            onClick={handleMigrate}
            disabled={loading}
            className={`px-4 py-2 rounded-lg ${
              loading
                ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {loading ? 'Migrating...' : 'Start Migration'}
          </button>
        </div>
      </div>

      {/* Migration Log */}
      {migrationLog.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-4">Migration Log</h2>
          <div className="bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-sm">
            {migrationLog.map((log, index) => (
              <div key={index} className="whitespace-pre-wrap">
                {log}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="mt-4 p-4 bg-red-50 text-red-600 rounded-lg">
          {error}
        </div>
      )}
    </div>
  );
}
