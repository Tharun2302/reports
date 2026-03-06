export interface DashboardFilters {
  userId?: string;
  fromCloudName?: string;
  toCloudName?: string;
  jobType?: "ONETIME" | "DELTA";
  jobStatus?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface JobStatusCount {
  jobStatus: string;
  totalCount: number;
}

export interface DashboardStats {
  totalJobs: number;
  completedJobs: number;
  inProgressJobs: number;
  partiallyCompletedJobs: number;
  statusBreakdown: JobStatusCount[];
}

export interface WorkspaceStatusData {
  name: string;
  value: number;
  color: string;
}

export interface MigratedDataSize {
  name: string;
  value: number;
  color: string;
}

export interface ChartData {
  workspacesByStatus: WorkspaceStatusData[];
  migratedDataSize: MigratedDataSize[];
}

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
  fromCloudName: string;
  toCloudName: string;
  userId: string;
}

export interface FilterOptions {
  users: { id: string; email: string }[];
  fromClouds: string[];
  toClouds: string[];
  jobTypes: string[];
}
