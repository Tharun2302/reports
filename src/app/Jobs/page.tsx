"use client";

import { useState, useMemo, useEffect, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Layers,
  CheckCircle,
  Clock,
  AlertTriangle,
} from "lucide-react";
import { useJobsData } from "@/hooks/useJobsData";
import type { JobItem } from "@/types/dashboard";
import DoughnutChartCard from "@/components/Reusables/Charts/DoughnutChartCard";
import JobsLeftPanel from "./JobsLeftPanel";
import styles from "./Jobs.module.css";

interface WorkspaceDetail {
  workspaceId: string;
  jobName: string;
  fromCloudName: string;
  toCloudName: string;
  fromMailId: string;
  toMailId: string;
  processStatus: string;
}

interface WorkspaceStats {
  total: number;
  processed: number;
  inProgress: number;
  conflict: number;
}

interface JobWorkspaceData {
  jobName: string;
  workspaces: WorkspaceDetail[];
  stats: WorkspaceStats;
}

interface FileStatusItem {
  processStatus: string;
  totalCount: number;
}

interface WorkspaceFileStatus {
  workspaceId: string;
  statusBreakdown: FileStatusItem[];
}

interface DataSizeItem {
  processStatus: string;
  totalSize: number;
}

interface WorkspaceDataSize {
  workspaceId: string;
  sizeBreakdown: DataSizeItem[];
}

interface ConflictItem {
  errorCode: string;
  statusCode: number;
  totalCount: number;
  totalRetries: number;
  maxRetry: number;
}

interface ConflictsBreakdownData {
  workspaceId: string;
  totalConflicts: number;
  conflicts: ConflictItem[];
}

const FILE_STATUS_COLORS: Record<string, string> = {
  PROCESSED: "#22c55e",
  IN_PROGRESS: "#3b82f6",
  NOT_PROCESSED: "#6b7eeb",
  CONFLICT: "#dc2626",
  SUSPENDED: "#ef4444",
  PROCESSED_WITH_SOME_CONFLICTS: "#f59e0b",
  CANCEL: "#9ca3af",
  COMPLETED: "#22c55e",
  FAILED: "#dc2626",
  NOT_STARTED: "#94a3b8",
};

const FILE_STATUS_DISPLAY: Record<string, string> = {
  PROCESSED: "Processed",
  IN_PROGRESS: "In Progress",
  NOT_PROCESSED: "Not Processed",
  CONFLICT: "Conflict",
  SUSPENDED: "Suspended",
  PROCESSED_WITH_SOME_CONFLICTS: "Processed With Some Conflicts",
  CANCEL: "Cancelled",
  COMPLETED: "Completed",
  FAILED: "Failed",
  NOT_STARTED: "Not Started",
};

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
}

function useJobWorkspaces(jobName: string | null) {
  const [data, setData] = useState<JobWorkspaceData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchWorkspaces = useCallback(async (name: string) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/jobs/${encodeURIComponent(name)}`);
      if (!res.ok) throw new Error("Failed to fetch");
      const json = await res.json();
      setData(json);
    } catch {
      setData(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (jobName) {
      fetchWorkspaces(jobName);
    } else {
      setData(null);
    }
  }, [jobName, fetchWorkspaces]);

  return { data, isLoading };
}

function useWorkspaceBreakdown(workspaceId: string | null, endpoint: string) {
  const [data, setData] = useState<WorkspaceFileStatus | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!workspaceId) {
      setData(null);
      return;
    }

    let cancelled = false;
    setIsLoading(true);

    fetch(`/api/workspace/${encodeURIComponent(workspaceId)}/${endpoint}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch");
        return res.json();
      })
      .then((json) => {
        if (!cancelled) setData(json);
      })
      .catch(() => {
        if (!cancelled) setData(null);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [workspaceId, endpoint]);

  return { data, isLoading };
}

function useWorkspaceDataSize(workspaceId: string | null) {
  const [data, setData] = useState<WorkspaceDataSize | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!workspaceId) {
      setData(null);
      return;
    }

    let cancelled = false;
    setIsLoading(true);

    fetch(`/api/workspace/${encodeURIComponent(workspaceId)}/datasize`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch");
        return res.json();
      })
      .then((json) => {
        if (!cancelled) setData(json);
      })
      .catch(() => {
        if (!cancelled) setData(null);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [workspaceId]);

  return { data, isLoading };
}

function useConflictsBreakdown(workspaceId: string | null) {
  const [data, setData] = useState<ConflictsBreakdownData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!workspaceId) {
      setData(null);
      return;
    }

    let cancelled = false;
    setIsLoading(true);

    fetch(
      `/api/workspace/${encodeURIComponent(workspaceId)}/conflicts-breakdown`
    )
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch");
        return res.json();
      })
      .then((json) => {
        if (!cancelled) setData(json);
      })
      .catch(() => {
        if (!cancelled) setData(null);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [workspaceId]);

  return { data, isLoading };
}

const STATUS_CODE_LABELS: Record<number, string> = {
  200: "Success",
  201: "Created",
  400: "Bad Request",
  401: "Unauthorized",
  403: "Forbidden",
  404: "Not Found",
  408: "Request Timeout",
  409: "Conflict",
  429: "Rate Limit",
  500: "Error Not Retriable",
  502: "Bad Gateway",
  503: "Service Unavailable",
  504: "Gateway Timeout",
  0: "Unknown",
};

const RETRY_LIMIT_CODES = new Set([429, 502, 503]);
const MAX_RETRIES = 5;

function JobsContent() {
  const searchParams = useSearchParams();
  const statusFilter = searchParams.get("status") || undefined;

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const { jobs, isLoading, error } = useJobsData({ jobStatus: statusFilter });

  const filteredJobs = useMemo(() => {
    if (!searchQuery.trim()) return jobs;
    const q = searchQuery.toLowerCase().trim();
    return jobs.filter((job) => job.jobName.toLowerCase().includes(q));
  }, [searchQuery, jobs]);

  const selectedJob = selectedJobId
    ? jobs.find((j) => j.id === selectedJobId)
    : null;

  const { data: wsData, isLoading: wsLoading } = useJobWorkspaces(
    selectedJob?.jobName ?? null
  );

  if (error) {
    return (
      <div className={styles.jobsLayout}>
        <div className={styles.errorMessage}>Error loading jobs: {error}</div>
      </div>
    );
  }

  return (
    <div className={styles.jobsLayout}>
      <JobsLeftPanel
        jobs={filteredJobs}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedJobId={selectedJobId}
        onSelectJob={setSelectedJobId}
        isLoading={isLoading}
        statusFilter={statusFilter}
      />
      <section className={styles.jobsRight} aria-label="Job details">
        {selectedJob ? (
          <JobDetailPanel
            job={selectedJob}
            wsData={wsData}
            wsLoading={wsLoading}
          />
        ) : (
          <div className={styles.jobsRightEmpty}>
            <p className={styles.jobsPlaceholder}>
              Select a job to view details
            </p>
          </div>
        )}
      </section>
    </div>
  );
}

const JobsPage = () => {
  return (
    <Suspense
      fallback={
        <div className={styles.jobsLayout}>
          <div className={styles.jobsLoading}>Loading...</div>
        </div>
      }
    >
      <JobsContent />
    </Suspense>
  );
};

const PROCESS_STATUS_COLORS: Record<string, string> = {
  PROCESSED: "#22c55e",
  IN_PROGRESS: "#3b82f6",
  NOT_PROCESSED: "#6b7eeb",
  CONFLICT: "#dc2626",
  SUSPENDED: "#ef4444",
  PROCESSED_WITH_SOME_CONFLICTS: "#f59e0b",
  CANCEL: "#9ca3af",
};

function JobDetailPanel({
  job,
  wsData,
  wsLoading,
}: {
  job: JobItem;
  wsData: JobWorkspaceData | null;
  wsLoading: boolean;
}) {
  const [selectedWorkspace, setSelectedWorkspace] = useState("all");
  const [clickedWorkspaceId, setClickedWorkspaceId] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    setClickedWorkspaceId(null);
  }, [wsData]);

  const activeWorkspaceId = useMemo(() => {
    if (clickedWorkspaceId) return clickedWorkspaceId;
    if (selectedWorkspace !== "all") return selectedWorkspace;
    if (wsData?.workspaces?.length === 1) return wsData.workspaces[0].workspaceId;
    return null;
  }, [clickedWorkspaceId, selectedWorkspace, wsData]);

  const DISPLAY_TO_STATUS: Record<string, string> = useMemo(
    () =>
      Object.fromEntries(
        Object.entries(FILE_STATUS_DISPLAY).map(([k, v]) => [v, k])
      ),
    []
  );

  const handleFileStatusClick = useCallback(
    (point: { name: string }) => {
      const rawStatus = DISPLAY_TO_STATUS[point.name] || point.name;
      if (!activeWorkspaceId) return;
      const params = new URLSearchParams({
        workspaceId: activeWorkspaceId,
        processStatus: rawStatus,
        jobName: job.jobName,
        type: "files",
      });
      router.push(`/FileDetails?${params.toString()}`);
    },
    [activeWorkspaceId, DISPLAY_TO_STATUS, router, job.jobName]
  );

  const handleHyperlinksClick = useCallback(
    (point: { name: string }) => {
      const rawStatus = DISPLAY_TO_STATUS[point.name] || point.name;
      if (!activeWorkspaceId) return;
      const params = new URLSearchParams({
        workspaceId: activeWorkspaceId,
        processStatus: rawStatus,
        jobName: job.jobName,
        type: "hyperlinks",
      });
      router.push(`/FileDetails?${params.toString()}`);
    },
    [activeWorkspaceId, DISPLAY_TO_STATUS, router, job.jobName]
  );

  const handlePermissionsClick = useCallback(
    (point: { name: string }) => {
      const rawStatus = DISPLAY_TO_STATUS[point.name] || point.name;
      if (!activeWorkspaceId) return;
      const params = new URLSearchParams({
        workspaceId: activeWorkspaceId,
        processStatus: rawStatus,
        jobName: job.jobName,
        type: "permissions",
      });
      router.push(`/FileDetails?${params.toString()}`);
    },
    [activeWorkspaceId, DISPLAY_TO_STATUS, router, job.jobName]
  );

  const { data: fileStatusData, isLoading: fileStatusLoading } =
    useWorkspaceBreakdown(activeWorkspaceId, "status");

  const { data: hyperlinksData, isLoading: hyperlinksLoading } =
    useWorkspaceBreakdown(activeWorkspaceId, "hyperlinks");

  const { data: collabData, isLoading: collabLoading } =
    useWorkspaceBreakdown(activeWorkspaceId, "collaborations");

  const { data: dataSizeData, isLoading: dataSizeLoading } =
    useWorkspaceDataSize(activeWorkspaceId);

  const { data: conflictsData, isLoading: conflictsLoading } =
    useConflictsBreakdown(activeWorkspaceId);

  const toChartData = useCallback(
    (statusData: WorkspaceFileStatus | null) => {
      if (!statusData?.statusBreakdown) return [];
      return statusData.statusBreakdown.map((item) => ({
        name: FILE_STATUS_DISPLAY[item.processStatus] || item.processStatus,
        value: item.totalCount,
        color: FILE_STATUS_COLORS[item.processStatus] || "#6b7eeb",
      }));
    },
    []
  );

  const fileStatusChartData = useMemo(
    () => toChartData(fileStatusData),
    [fileStatusData, toChartData]
  );
  const hyperlinksChartData = useMemo(
    () => toChartData(hyperlinksData),
    [hyperlinksData, toChartData]
  );
  const collabChartData = useMemo(
    () => toChartData(collabData),
    [collabData, toChartData]
  );

  const dataSizeChartData = useMemo(() => {
    if (!dataSizeData?.sizeBreakdown) return [];
    return dataSizeData.sizeBreakdown
      .filter((item) => item.totalSize > 0)
      .map((item) => ({
        name: FILE_STATUS_DISPLAY[item.processStatus] || item.processStatus,
        value: item.totalSize,
        color: FILE_STATUS_COLORS[item.processStatus] || "#6b7eeb",
      }));
  }, [dataSizeData]);

  const stats = wsData?.stats ?? {
    total: 0,
    processed: 0,
    inProgress: 0,
    conflict: 0,
  };

  const workspaceOptions = useMemo(() => {
    if (!wsData?.workspaces) return [];
    return wsData.workspaces.map((ws) => ({
      id: ws.workspaceId,
      label: `${ws.fromMailId} → ${ws.toMailId}`,
    }));
  }, [wsData]);

  const displayedWorkspaces = useMemo(() => {
    if (!wsData?.workspaces) return [];
    if (selectedWorkspace === "all") return wsData.workspaces;
    return wsData.workspaces.filter(
      (ws) => ws.workspaceId === selectedWorkspace
    );
  }, [wsData, selectedWorkspace]);

  const handleWorkspaceIdClick = useCallback((wsId: string) => {
    setClickedWorkspaceId((prev) => (prev === wsId ? null : wsId));
  }, []);

  return (
    <>
      {/* Dropdowns row */}
      <div className={styles.jobDetailDropdowns}>
        <div className={styles.jobDetailDropdownGroup}>
          <label className={styles.jobDetailDropdownLabel}>Workspace</label>
          <select
            className={styles.jobDetailDropdownSelect}
            value={selectedWorkspace}
            onChange={(e) => setSelectedWorkspace(e.target.value)}
          >
            <option value="all">All Workspaces</option>
            {workspaceOptions.map((ws) => (
              <option key={ws.id} value={ws.id}>
                {ws.label}
              </option>
            ))}
          </select>
        </div>
        <div className={styles.jobDetailDropdownGroup}>
          <label className={styles.jobDetailDropdownLabel}>Type</label>
          <select className={styles.jobDetailDropdownSelect}>
            <option>All Types</option>
          </select>
        </div>
      </div>

      {/* Content area */}
      <div className={styles.jobDetailContent}>
        <h3 className={styles.jobDetailTitle}>{job.jobName} Summary</h3>

        {wsLoading ? (
          <div className={styles.jobsLoading}>Loading workspace data...</div>
        ) : (
          <>
            {/* Stat cards */}
            <div className={styles.jobStatCards}>
              <div className={styles.jobStatCard}>
                <div
                  className={styles.jobStatCardIcon}
                  style={{ backgroundColor: "#eff6ff" }}
                >
                  <Layers size={18} style={{ color: "#3b82f6" }} />
                </div>
                <div className={styles.jobStatCardInfo}>
                  <p className={styles.jobStatCardLabel}>Total Workspaces</p>
                  <p className={styles.jobStatCardValue}>{stats.total}</p>
                </div>
              </div>

              <div className={styles.jobStatCard}>
                <div
                  className={styles.jobStatCardIcon}
                  style={{ backgroundColor: "#f0fdf4" }}
                >
                  <CheckCircle size={18} style={{ color: "#22c55e" }} />
                </div>
                <div className={styles.jobStatCardInfo}>
                  <p className={styles.jobStatCardLabel}>
                    Processed Workspaces
                  </p>
                  <p className={styles.jobStatCardValue}>{stats.processed}</p>
                </div>
              </div>

              <div className={styles.jobStatCard}>
                <div
                  className={styles.jobStatCardIcon}
                  style={{ backgroundColor: "#fff7ed" }}
                >
                  <Clock size={18} style={{ color: "#f59e0b" }} />
                </div>
                <div className={styles.jobStatCardInfo}>
                  <p className={styles.jobStatCardLabel}>
                    In Progress Workspaces
                  </p>
                  <p className={styles.jobStatCardValue}>{stats.inProgress}</p>
                </div>
              </div>

              <div className={styles.jobStatCard}>
                <div
                  className={styles.jobStatCardIcon}
                  style={{ backgroundColor: "#fef2f2" }}
                >
                  <AlertTriangle size={18} style={{ color: "#ef4444" }} />
                </div>
                <div className={styles.jobStatCardInfo}>
                  <p className={styles.jobStatCardLabel}>
                    Conflict Workspaces
                  </p>
                  <p className={styles.jobStatCardValue}>{stats.conflict}</p>
                </div>
              </div>
            </div>

            {/* Workspace Details Table */}
            <div className={styles.wsTableSection}>
              <h4 className={styles.wsTableTitle}>
                Workspace Details{" "}
                <span className={styles.wsTableCount}>
                  {displayedWorkspaces.length} row
                  {displayedWorkspaces.length !== 1 ? "s" : ""}
                </span>
              </h4>
              <div className={styles.wsTableWrap}>
                <table className={styles.wsTable}>
                  <thead>
                    <tr>
                      <th>workspaceId</th>
                      <th>fromCloudName</th>
                      <th>toCloudName</th>
                      <th>fromMailId</th>
                      <th>toMailId</th>
                      <th>processStatus</th>
                    </tr>
                  </thead>
                  <tbody>
                    {displayedWorkspaces.length === 0 ? (
                      <tr>
                        <td colSpan={6} className={styles.wsTableEmpty}>
                          No workspaces found
                        </td>
                      </tr>
                    ) : (
                      displayedWorkspaces.map((ws) => (
                        <tr
                          key={ws.workspaceId}
                          className={
                            clickedWorkspaceId === ws.workspaceId
                              ? styles.wsTableRowSelected
                              : undefined
                          }
                        >
                          <td className={styles.wsTableId}>
                            <button
                              type="button"
                              className={styles.wsTableIdBtn}
                              onClick={() =>
                                handleWorkspaceIdClick(ws.workspaceId)
                              }
                              title="Click to view breakdown charts for this workspace"
                            >
                              {ws.workspaceId}
                            </button>
                          </td>
                          <td>{ws.fromCloudName}</td>
                          <td>{ws.toCloudName}</td>
                          <td className={styles.wsTableEmail}>
                            {ws.fromMailId}
                          </td>
                          <td className={styles.wsTableEmail}>
                            {ws.toMailId}
                          </td>
                          <td>
                            <span
                              className={styles.wsTableStatus}
                              style={{
                                color:
                                  PROCESS_STATUS_COLORS[ws.processStatus] ||
                                  "#6b7eeb",
                              }}
                            >
                              {ws.processStatus}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pie Charts - Side by Side */}
            <div className={styles.chartsRow}>
              {/* File/Folder Status Pie Chart */}
              <div className={styles.chartCol}>
                {activeWorkspaceId ? (
                  fileStatusLoading ? (
                    <div className={styles.jobsLoading}>
                      Loading file status data...
                    </div>
                  ) : fileStatusChartData.length > 0 ? (
                    <DoughnutChartCard
                      title="File/Folder Status Breakdown"
                      subtitle={`Workspace: ${activeWorkspaceId}`}
                      data={fileStatusChartData}
                      customHeight={300}
                      customWidth={null}
                      showDataLabels={true}
                      showLegend={true}
                      onPointClick={handleFileStatusClick}
                    />
                  ) : (
                    <div className={styles.fileStatusEmpty}>
                      No file/folder data found for this workspace
                    </div>
                  )
                ) : (
                  <div className={styles.fileStatusPrompt}>
                    Select a workspace to view file/folder status breakdown
                  </div>
                )}
              </div>

              {/* Hyperlinks Status Pie Chart */}
              <div className={styles.chartCol}>
                {activeWorkspaceId ? (
                  hyperlinksLoading ? (
                    <div className={styles.jobsLoading}>
                      Loading hyperlinks data...
                    </div>
                  ) : hyperlinksChartData.length > 0 ? (
                    <DoughnutChartCard
                      title="Hyperlinks Status Breakdown"
                      subtitle={`Workspace: ${activeWorkspaceId}`}
                      data={hyperlinksChartData}
                      customHeight={300}
                      customWidth={null}
                      showDataLabels={true}
                      showLegend={true}
                      onPointClick={handleHyperlinksClick}
                    />
                  ) : (
                    <div className={styles.fileStatusEmpty}>
                      No hyperlinks data found for this workspace
                    </div>
                  )
                ) : (
                  <div className={styles.fileStatusPrompt}>
                    Select a workspace to view hyperlinks status breakdown
                  </div>
                )}
              </div>
            </div>

            {/* Row 2: Permissions & Data Size */}
            <div className={styles.chartsRow}>
              {/* Permissions Pie Chart (CollabarationDetails) */}
              <div className={styles.chartCol}>
                {activeWorkspaceId ? (
                  collabLoading ? (
                    <div className={styles.jobsLoading}>
                      Loading permissions data...
                    </div>
                  ) : collabChartData.length > 0 ? (
                    <DoughnutChartCard
                      title="Permissions Status Breakdown"
                      subtitle={`Workspace: ${activeWorkspaceId}`}
                      data={collabChartData}
                      customHeight={300}
                      customWidth={null}
                      showDataLabels={true}
                      showLegend={true}
                      onPointClick={handlePermissionsClick}
                    />
                  ) : (
                    <div className={styles.fileStatusEmpty}>
                      No permissions data found for this workspace
                    </div>
                  )
                ) : (
                  <div className={styles.fileStatusPrompt}>
                    Select a workspace to view permissions status breakdown
                  </div>
                )}
              </div>

              {/* Data Size Pie Chart (FileFolderInfo + HyperLinks) */}
              <div className={styles.chartCol}>
                {activeWorkspaceId ? (
                  dataSizeLoading ? (
                    <div className={styles.jobsLoading}>
                      Loading data size...
                    </div>
                  ) : dataSizeChartData.length > 0 ? (
                    <DoughnutChartCard
                      title="Data Size Breakdown"
                      subtitle={`Workspace: ${activeWorkspaceId}`}
                      data={dataSizeChartData}
                      customHeight={300}
                      customWidth={null}
                      showDataLabels={true}
                      showLegend={true}
                      valueFormatter={formatBytes}
                    />
                  ) : (
                    <div className={styles.fileStatusEmpty}>
                      No data size information for this workspace
                    </div>
                  )
                ) : (
                  <div className={styles.fileStatusPrompt}>
                    Select a workspace to view data size breakdown
                  </div>
                )}
              </div>
            </div>

            {/* Conflicts Breakdown */}
            {activeWorkspaceId && (
              <div className={styles.conflictsSection}>
                <h4 className={styles.conflictsTitle}>Conflicts Breakdown</h4>
                {conflictsLoading ? (
                  <div className={styles.jobsLoading}>
                    Loading conflicts data...
                  </div>
                ) : conflictsData &&
                  conflictsData.conflicts.length > 0 ? (
                  <div className={styles.conflictsList}>
                    {conflictsData.conflicts.map((conflict, idx) => {
                      const isRetryLimitExceeded =
                        RETRY_LIMIT_CODES.has(conflict.statusCode);
                      const isNotRetriable = conflict.statusCode === 500;
                      const hasRetryProgress =
                        !isRetryLimitExceeded &&
                        !isNotRetriable &&
                        conflict.totalRetries > 0 &&
                        conflict.totalRetries < conflict.totalCount;

                      return (
                        <div
                          key={idx}
                          className={styles.conflictRow}
                        >
                          <div className={styles.conflictLeft}>
                            <span className={styles.conflictCode}>
                              {conflict.statusCode ?? "—"}
                            </span>
                            <div className={styles.conflictInfo}>
                              <span className={styles.conflictLabel}>
                                {conflict.errorCode}{" "}
                                <span className={styles.conflictCount}>
                                  ({conflict.totalCount.toLocaleString()})
                                </span>
                              </span>
                              <span className={styles.conflictRetries}>
                                {conflict.totalRetries} Retries in last 24
                                hours
                              </span>
                            </div>
                          </div>
                          <div className={styles.conflictRight}>
                            {isRetryLimitExceeded ? (
                              <div className={styles.conflictExceeded}>
                                <span
                                  className={
                                    styles.conflictExceededLabel
                                  }
                                >
                                  Retry Limit Exceeded
                                </span>
                                <span
                                  className={styles.conflictExceededSub}
                                >
                                  Try after 24 hours
                                </span>
                              </div>
                            ) : isNotRetriable ? null : hasRetryProgress ? (
                              <div className={styles.conflictProgress}>
                                <div
                                  className={
                                    styles.conflictProgressBar
                                  }
                                >
                                  <div
                                    className={
                                      styles.conflictProgressFill
                                    }
                                    style={{
                                      width: `${Math.min(
                                        (conflict.totalRetries /
                                          conflict.totalCount) *
                                          100,
                                        100
                                      )}%`,
                                    }}
                                  />
                                </div>
                                <span
                                  className={
                                    styles.conflictProgressLabel
                                  }
                                >
                                  {conflict.totalRetries.toLocaleString()}{" "}
                                  out of{" "}
                                  {conflict.totalCount.toLocaleString()}{" "}
                                  Retried
                                </span>
                              </div>
                            ) : (
                              <button
                                type="button"
                                className={styles.conflictRetryBtn}
                              >
                                ↻ Retry
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : activeWorkspaceId ? (
                  <div className={styles.fileStatusEmpty}>
                    No conflicts found for this workspace
                  </div>
                ) : null}
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}

export default JobsPage;
