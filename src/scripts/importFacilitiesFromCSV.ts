import Papa from 'papaparse';
import { Client } from '@googlemaps/google-maps-services-js';
import { importService } from '../services/imports/importService';

interface CSVRow {
  'Facility Name': string;
  'Facility Website': string;
  'Facility Address': string;
}

/**
 * Import facilities from CSV file
 * @param file CSV file with columns: Facility Name, Facility Website, Facility Address
 * @param userId ID of user performing the import
 * @returns Import job ID
 */
export async function importFacilitiesFromCSV(file: File, userId: string): Promise<string> {
  // Parse CSV
  const parseResult = await new Promise<Papa.ParseResult<CSVRow>>((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: resolve,
      error: reject
    });
  });

  // Validate CSV structure
  const requiredColumns = ['Facility Name', 'Facility Website', 'Facility Address'];
  const missingColumns = requiredColumns.filter(col => 
    !parseResult.meta.fields?.includes(col)
  );

  if (missingColumns.length > 0) {
    throw new Error(`Missing required columns: ${missingColumns.join(', ')}`);
  }

  // Validate data
  const validationErrors: string[] = [];
  parseResult.data.forEach((row, index) => {
    if (!row['Facility Name']?.trim()) {
      validationErrors.push(`Row ${index + 1}: Missing facility name`);
    }
    if (!row['Facility Address']?.trim()) {
      validationErrors.push(`Row ${index + 1}: Missing facility address`);
    }
    if (row['Facility Website'] && !isValidUrl(row['Facility Website'])) {
      validationErrors.push(`Row ${index + 1}: Invalid website URL`);
    }
  });

  if (validationErrors.length > 0) {
    throw new Error('CSV validation failed:\n' + validationErrors.join('\n'));
  }

  // Create import job
  const jobId = await importService.createImportJob({
    fileName: file.name,
    userId,
    totalFacilities: parseResult.data.length
  });

  // Start import process
  await importService.importBasicData(jobId, parseResult.data);

  // Start address processing in background
  importService.processAddresses(jobId).catch(error => {
    console.error('Error processing addresses:', error);
  });

  return jobId;
}

/**
 * Validate URL format
 */
function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Example usage:
 * 
 * ```typescript
 * // In your component:
 * async function handleFileUpload(event: React.ChangeEvent<HTMLInputElement>) {
 *   const file = event.target.files?.[0];
 *   if (!file) return;
 * 
 *   try {
 *     const jobId = await importFacilitiesFromCSV(file, userId);
 *     console.log('Import started:', jobId);
 *   } catch (error) {
 *     console.error('Import failed:', error);
 *   }
 * }
 * ```
 * 
 * CSV Format:
 * ```csv
 * Facility Name,Facility Website,Facility Address
 * "Recovery Center A","https://example.com","123 Main St, City, State 12345"
 * "Recovery Center B","https://example.org","456 Oak Ave, Town, State 67890"
 * ```
 */
