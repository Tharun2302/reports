export interface JobItem {
  id: string;
  jobName: string;
  jobType: string;
  status: string;
  totalDataMigrated: number;
  totalDataSize: number;
  pairsMigrated: number;
  totalPairs: number;
  processedOn: string;
}

export const JOBS_DUMMY_DATA: JobItem[] = [
  { id: "1", jobName: "Onetime-BFB-SharePoint-Sep.29.2025-16", jobType: "ONETIME", status: "In Progress", totalDataMigrated: 12.17, totalDataSize: 100.47, pairsMigrated: 0, totalPairs: 1, processedOn: "Sep 29, 2025" },
  { id: "2", jobName: "Delta-BFB-SharePoint-Sep.28.2025-15", jobType: "DELTA", status: "In Progress", totalDataMigrated: 45.3, totalDataSize: 120.8, pairsMigrated: 0, totalPairs: 1, processedOn: "Sep 28, 2025" },
  { id: "3", jobName: "Onetime-BFB-OneDrive-Sep.27.2025-14", jobType: "ONETIME", status: "In Progress", totalDataMigrated: 78.5, totalDataSize: 200.3, pairsMigrated: 0, totalPairs: 1, processedOn: "Sep 27, 2025" },
  { id: "4", jobName: "Delta-BFB-Teams-Sep.26.2025-13", jobType: "DELTA", status: "In Progress", totalDataMigrated: 23.7, totalDataSize: 89.4, pairsMigrated: 0, totalPairs: 1, processedOn: "Sep 26, 2025" },
  { id: "5", jobName: "Onetime-BFB-Exchange-Sep.25.2025-12", jobType: "ONETIME", status: "In Progress", totalDataMigrated: 56.2, totalDataSize: 156.7, pairsMigrated: 0, totalPairs: 1, processedOn: "Sep 25, 2025" },
  { id: "6", jobName: "Delta-BFB-SharePoint-Sep.24.2025-11", jobType: "DELTA", status: "In Progress", totalDataMigrated: 34.8, totalDataSize: 98.2, pairsMigrated: 0, totalPairs: 1, processedOn: "Sep 24, 2025" },
  { id: "7", jobName: "Onetime-BFB-OneDrive-Sep.23.2025-10", jobType: "ONETIME", status: "In Progress", totalDataMigrated: 67.4, totalDataSize: 178.9, pairsMigrated: 0, totalPairs: 1, processedOn: "Sep 23, 2025" },
  { id: "8", jobName: "Delta-BFB-Teams-Sep.22.2025-09", jobType: "DELTA", status: "In Progress", totalDataMigrated: 12.5, totalDataSize: 67.3, pairsMigrated: 0, totalPairs: 1, processedOn: "Sep 22, 2025" },
  { id: "9", jobName: "Onetime-BFB-Exchange-Sep.21.2025-08", jobType: "ONETIME", status: "In Progress", totalDataMigrated: 89.1, totalDataSize: 234.6, pairsMigrated: 0, totalPairs: 1, processedOn: "Sep 21, 2025" },
  { id: "10", jobName: "Delta-BFB-SharePoint-Sep.20.2025-07", jobType: "DELTA", status: "In Progress", totalDataMigrated: 43.2, totalDataSize: 112.8, pairsMigrated: 0, totalPairs: 1, processedOn: "Sep 20, 2025" },
  { id: "11", jobName: "Onetime-BFB-OneDrive-Sep.19.2025-06", jobType: "ONETIME", status: "In Progress", totalDataMigrated: 71.6, totalDataSize: 189.4, pairsMigrated: 0, totalPairs: 1, processedOn: "Sep 19, 2025" },
  { id: "12", jobName: "Delta-BFB-Teams-Sep.18.2025-05", jobType: "DELTA", status: "In Progress", totalDataMigrated: 28.9, totalDataSize: 95.7, pairsMigrated: 0, totalPairs: 1, processedOn: "Sep 18, 2025" },
  { id: "13", jobName: "Onetime-BFB-Exchange-Sep.17.2025-04", jobType: "ONETIME", status: "In Progress", totalDataMigrated: 54.3, totalDataSize: 167.2, pairsMigrated: 0, totalPairs: 1, processedOn: "Sep 17, 2025" },
  { id: "14", jobName: "Delta-BFB-SharePoint-Sep.16.2025-03", jobType: "DELTA", status: "In Progress", totalDataMigrated: 36.7, totalDataSize: 103.5, pairsMigrated: 0, totalPairs: 1, processedOn: "Sep 16, 2025" },
  { id: "15", jobName: "Onetime-BFB-OneDrive-Sep.15.2025-02", jobType: "ONETIME", status: "In Progress", totalDataMigrated: 62.8, totalDataSize: 175.3, pairsMigrated: 0, totalPairs: 1, processedOn: "Sep 15, 2025" },
  { id: "16", jobName: "Onetime-BFB-Teams-Sep.14.2025-01", jobType: "ONETIME", status: "Processed With Some Conflicts", totalDataMigrated: 145.8, totalDataSize: 156.2, pairsMigrated: 1, totalPairs: 1, processedOn: "Sep 14, 2025" },
  { id: "17", jobName: "Delta-BFB-Exchange-Sep.13.2025-50", jobType: "DELTA", status: "Processed With Some Conflicts", totalDataMigrated: 234.5, totalDataSize: 245.8, pairsMigrated: 1, totalPairs: 1, processedOn: "Sep 13, 2025" },
  { id: "18", jobName: "Onetime-BFB-SharePoint-Sep.12.2025-49", jobType: "ONETIME", status: "Processed With Some Conflicts", totalDataMigrated: 187.3, totalDataSize: 198.6, pairsMigrated: 1, totalPairs: 1, processedOn: "Sep 12, 2025" },
  { id: "19", jobName: "Delta-BFB-OneDrive-Sep.11.2025-48", jobType: "DELTA", status: "Processed With Some Conflicts", totalDataMigrated: 312.4, totalDataSize: 325.7, pairsMigrated: 1, totalPairs: 1, processedOn: "Sep 11, 2025" },
  { id: "20", jobName: "Onetime-BFB-Teams-Sep.10.2025-47", jobType: "ONETIME", status: "Processed With Some Conflicts", totalDataMigrated: 156.9, totalDataSize: 167.2, pairsMigrated: 1, totalPairs: 1, processedOn: "Sep 10, 2025" },
  { id: "21", jobName: "Delta-BFB-Exchange-Sep.09.2025-46", jobType: "DELTA", status: "Processed With Some Conflicts", totalDataMigrated: 278.6, totalDataSize: 289.3, pairsMigrated: 1, totalPairs: 1, processedOn: "Sep 09, 2025" },
  { id: "22", jobName: "Onetime-BFB-SharePoint-Sep.08.2025-45", jobType: "ONETIME", status: "Processed With Some Conflicts", totalDataMigrated: 198.7, totalDataSize: 209.4, pairsMigrated: 1, totalPairs: 1, processedOn: "Sep 08, 2025" },
  { id: "23", jobName: "Delta-BFB-OneDrive-Sep.07.2025-44", jobType: "DELTA", status: "Processed With Some Conflicts", totalDataMigrated: 267.3, totalDataSize: 278.9, pairsMigrated: 1, totalPairs: 1, processedOn: "Sep 07, 2025" },
  { id: "24", jobName: "Onetime-BFB-Teams-Sep.06.2025-43", jobType: "ONETIME", status: "Processed With Some Conflicts", totalDataMigrated: 143.2, totalDataSize: 154.6, pairsMigrated: 1, totalPairs: 1, processedOn: "Sep 06, 2025" },
  { id: "25", jobName: "Delta-BFB-Exchange-Sep.05.2025-42", jobType: "DELTA", status: "Processed With Some Conflicts", totalDataMigrated: 289.4, totalDataSize: 300.8, pairsMigrated: 1, totalPairs: 1, processedOn: "Sep 05, 2025" },
  { id: "26", jobName: "Onetime-BFB-SharePoint-Sep.04.2025-41", jobType: "ONETIME", status: "Processed With Some Conflicts", totalDataMigrated: 176.5, totalDataSize: 187.3, pairsMigrated: 1, totalPairs: 1, processedOn: "Sep 04, 2025" },
  { id: "27", jobName: "Delta-BFB-OneDrive-Sep.03.2025-40", jobType: "DELTA", status: "Processed With Some Conflicts", totalDataMigrated: 254.8, totalDataSize: 265.4, pairsMigrated: 1, totalPairs: 1, processedOn: "Sep 03, 2025" },
  { id: "28", jobName: "Onetime-BFB-Teams-Sep.02.2025-39", jobType: "ONETIME", status: "Processed With Some Conflicts", totalDataMigrated: 165.7, totalDataSize: 176.9, pairsMigrated: 1, totalPairs: 1, processedOn: "Sep 02, 2025" },
  { id: "29", jobName: "Delta-BFB-Exchange-Sep.01.2025-38", jobType: "DELTA", status: "Processed With Some Conflicts", totalDataMigrated: 298.3, totalDataSize: 309.7, pairsMigrated: 1, totalPairs: 1, processedOn: "Sep 01, 2025" },
  { id: "30", jobName: "Onetime-BFB-SharePoint-Aug.31.2025-37", jobType: "ONETIME", status: "Processed With Some Conflicts", totalDataMigrated: 189.6, totalDataSize: 200.2, pairsMigrated: 1, totalPairs: 1, processedOn: "Aug 31, 2025" },
  { id: "31", jobName: "Delta-BFB-OneDrive-Aug.30.2025-36", jobType: "DELTA", status: "Processed With Some Conflicts", totalDataMigrated: 243.7, totalDataSize: 254.3, pairsMigrated: 1, totalPairs: 1, processedOn: "Aug 30, 2025" },
  { id: "32", jobName: "Onetime-BFB-Teams-Aug.29.2025-35", jobType: "ONETIME", status: "Processed With Some Conflicts", totalDataMigrated: 158.4, totalDataSize: 169.8, pairsMigrated: 1, totalPairs: 1, processedOn: "Aug 29, 2025" },
  { id: "33", jobName: "Delta-BFB-Exchange-Aug.28.2025-34", jobType: "DELTA", status: "Processed With Some Conflicts", totalDataMigrated: 276.5, totalDataSize: 287.9, pairsMigrated: 1, totalPairs: 1, processedOn: "Aug 28, 2025" },
  { id: "34", jobName: "Onetime-BFB-SharePoint-Aug.27.2025-33", jobType: "ONETIME", status: "Processed With Some Conflicts", totalDataMigrated: 194.8, totalDataSize: 205.6, pairsMigrated: 1, totalPairs: 1, processedOn: "Aug 27, 2025" },
  { id: "35", jobName: "Delta-BFB-OneDrive-Aug.26.2025-32", jobType: "DELTA", status: "Processed With Some Conflicts", totalDataMigrated: 267.9, totalDataSize: 278.5, pairsMigrated: 1, totalPairs: 1, processedOn: "Aug 26, 2025" },
  { id: "36", jobName: "Onetime-BFB-Teams-Aug.25.2025-31", jobType: "ONETIME", status: "Conflict", totalDataMigrated: 45.2, totalDataSize: 150, pairsMigrated: 0, totalPairs: 1, processedOn: "Aug 25, 2025" },
  { id: "37", jobName: "Delta-BFB-Exchange-Aug.24.2025-30", jobType: "DELTA", status: "Conflict", totalDataMigrated: 67.8, totalDataSize: 185.3, pairsMigrated: 0, totalPairs: 1, processedOn: "Aug 24, 2025" },
  { id: "38", jobName: "Onetime-BFB-SharePoint-Aug.23.2025-29", jobType: "ONETIME", status: "Conflict", totalDataMigrated: 34.5, totalDataSize: 142.7, pairsMigrated: 0, totalPairs: 1, processedOn: "Aug 23, 2025" },
  { id: "39", jobName: "Delta-BFB-OneDrive-Aug.22.2025-28", jobType: "DELTA", status: "Conflict", totalDataMigrated: 89.3, totalDataSize: 198.6, pairsMigrated: 0, totalPairs: 1, processedOn: "Aug 22, 2025" },
  { id: "40", jobName: "Onetime-BFB-Teams-Aug.21.2025-27", jobType: "ONETIME", status: "Conflict", totalDataMigrated: 56.7, totalDataSize: 167.4, pairsMigrated: 0, totalPairs: 1, processedOn: "Aug 21, 2025" },
  { id: "41", jobName: "Delta-BFB-Exchange-Aug.20.2025-26", jobType: "DELTA", status: "Conflict", totalDataMigrated: 78.4, totalDataSize: 192.8, pairsMigrated: 0, totalPairs: 1, processedOn: "Aug 20, 2025" },
  { id: "42", jobName: "Onetime-BFB-SharePoint-Aug.19.2025-25", jobType: "ONETIME", status: "Conflict", totalDataMigrated: 42.6, totalDataSize: 156.3, pairsMigrated: 0, totalPairs: 1, processedOn: "Aug 19, 2025" },
  { id: "43", jobName: "Delta-BFB-OneDrive-Aug.18.2025-24", jobType: "DELTA", status: "Conflict", totalDataMigrated: 93.5, totalDataSize: 203.9, pairsMigrated: 0, totalPairs: 1, processedOn: "Aug 18, 2025" },
  { id: "44", jobName: "Onetime-BFB-Teams-Aug.17.2025-23", jobType: "ONETIME", status: "Conflict", totalDataMigrated: 61.2, totalDataSize: 174.8, pairsMigrated: 0, totalPairs: 1, processedOn: "Aug 17, 2025" },
  { id: "45", jobName: "Delta-BFB-Exchange-Aug.16.2025-22", jobType: "DELTA", status: "Conflict", totalDataMigrated: 73.9, totalDataSize: 188.5, pairsMigrated: 0, totalPairs: 1, processedOn: "Aug 16, 2025" },
  { id: "46", jobName: "Onetime-BFB-SharePoint-Aug.15.2025-21", jobType: "ONETIME", status: "Completed", totalDataMigrated: 245.8, totalDataSize: 245.8, pairsMigrated: 1, totalPairs: 1, processedOn: "Aug 15, 2025" },
  { id: "47", jobName: "Delta-BFB-OneDrive-Aug.14.2025-20", jobType: "DELTA", status: "Completed", totalDataMigrated: 312.4, totalDataSize: 312.4, pairsMigrated: 1, totalPairs: 1, processedOn: "Aug 14, 2025" },
  { id: "48", jobName: "Onetime-BFB-Teams-Aug.13.2025-19", jobType: "ONETIME", status: "Completed", totalDataMigrated: 189.7, totalDataSize: 189.7, pairsMigrated: 1, totalPairs: 1, processedOn: "Aug 13, 2025" },
  { id: "49", jobName: "Delta-BFB-Exchange-Aug.12.2025-18", jobType: "DELTA", status: "Completed", totalDataMigrated: 267.3, totalDataSize: 267.3, pairsMigrated: 1, totalPairs: 1, processedOn: "Aug 12, 2025" },
  { id: "50", jobName: "Onetime-BFB-SharePoint-Aug.11.2025-17", jobType: "ONETIME", status: "Completed", totalDataMigrated: 198.6, totalDataSize: 198.6, pairsMigrated: 1, totalPairs: 1, processedOn: "Aug 11, 2025" },
];
