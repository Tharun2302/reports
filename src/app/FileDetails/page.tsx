"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import DoughnutChartCard from "@/components/Reusables/Charts/DoughnutChartCard";
import styles from "./FileDetails.module.css";

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
  VERSION_PROCESSED: "#3b82f6",
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
  VERSION_PROCESSED: "Version Processed",
};

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
}

interface FileRecord {
  moveWorkSpaceId: string;
  processStatus: string;
  sourceObjectName: string;
  destObjectName: string;
  fromCloudName: string;
  toCloudName: string;
  fileSize: number;
  sourceParent: string;
  destParent: string;
  sourcePath: string;
  destPath: string;
}

interface HyperlinkRecord {
  moveWorkSpaceId: string;
  sourceObjectName: string;
  sourceId: string;
  destId: string;
  links: number;
  destParent: string;
  sourceParent: string;
  objectSize: number;
  noOfConflictLinks: number;
  noOfProcessedLinks: number;
  processStatus: string;
  totalLinkReplaceCount: number;
  sourcePath: string;
}

interface PermissionRecord {
  moveWorkSpaceId: string;
  objectName: string;
  sourceId: string;
  destId: string;
  processStatus: string;
  sourcePath: string;
  destPath: string;
}

interface WorkspaceStatusRecord {
  workspaceId: string;
  fromMailId: string;
  toMailId: string;
  processStatus: string;
  processedFilesPercentage: string;
  processedCollabPercentage: string;
  processedHyperlinksPercentage: string;
}

function WorkspacesTable({
  workspaces,
  statusColor,
  onWorkspaceClick,
  selectedWsId,
}: {
  workspaces: WorkspaceStatusRecord[];
  statusColor: string;
  onWorkspaceClick?: (wsId: string) => void;
  selectedWsId?: string | null;
}) {
  return (
    <div className={styles.tableWrap}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>#</th>
            <th>workspaceId</th>
            <th>fromMailId</th>
            <th>toMailId</th>
            <th>processStatus</th>
            <th>Files %</th>
            <th>Permissions %</th>
            <th>Hyperlinks %</th>
          </tr>
        </thead>
        <tbody>
          {workspaces.map((item, idx) => (
            <tr
              key={idx}
              className={
                selectedWsId === item.workspaceId
                  ? styles.selectedRow
                  : undefined
              }
            >
              <td className={styles.rowNum}>{idx + 1}</td>
              <td>
                <button
                  className={styles.wsIdBtn}
                  onClick={() => onWorkspaceClick?.(item.workspaceId)}
                  title={item.workspaceId}
                >
                  {item.workspaceId}
                </button>
              </td>
              <td className={styles.emailCell}>{item.fromMailId}</td>
              <td className={styles.emailCell}>{item.toMailId}</td>
              <td>
                <span className={styles.statusTag} style={{ color: statusColor }}>
                  {item.processStatus}
                </span>
              </td>
              <td className={styles.percentCell}>
                {item.processedFilesPercentage}
              </td>
              <td className={styles.percentCell}>
                {item.processedCollabPercentage}
              </td>
              <td className={styles.percentCell}>
                {item.processedHyperlinksPercentage}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function FilesTable({
  files,
  statusColor,
}: {
  files: FileRecord[];
  statusColor: string;
}) {
  return (
    <div className={styles.tableWrap}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>#</th>
            <th>sourceObjectName</th>
            <th>destObjectName</th>
            <th>fromCloudName</th>
            <th>toCloudName</th>
            <th>fileSize</th>
            <th>sourceParent</th>
            <th>destParent</th>
            <th>sourcePath</th>
            <th>destPath</th>
            <th>processStatus</th>
          </tr>
        </thead>
        <tbody>
          {files.map((file, idx) => (
            <tr key={idx}>
              <td className={styles.rowNum}>{idx + 1}</td>
              <td>{file.sourceObjectName}</td>
              <td>{file.destObjectName}</td>
              <td>{file.fromCloudName}</td>
              <td>{file.toCloudName}</td>
              <td className={styles.sizeCell}>
                {formatBytes(file.fileSize)}
              </td>
              <td className={styles.pathCell} title={file.sourceParent}>
                {file.sourceParent}
              </td>
              <td className={styles.pathCell} title={file.destParent}>
                {file.destParent}
              </td>
              <td className={styles.pathCell} title={file.sourcePath}>
                {file.sourcePath}
              </td>
              <td className={styles.pathCell} title={file.destPath}>
                {file.destPath}
              </td>
              <td>
                <span className={styles.statusTag} style={{ color: statusColor }}>
                  {file.processStatus}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function HyperlinksTable({
  hyperlinks,
  statusColor,
}: {
  hyperlinks: HyperlinkRecord[];
  statusColor: string;
}) {
  return (
    <div className={styles.tableWrap}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>#</th>
            <th>sourceObjectName</th>
            <th>sourceId</th>
            <th>destId</th>
            <th>links</th>
            <th>destParent</th>
            <th>sourceParent</th>
            <th>objectSize</th>
            <th>noOfConflictLinks</th>
            <th>noOfProcessedLinks</th>
            <th>totalLinkReplaceCount</th>
            <th>sourcePath</th>
            <th>processStatus</th>
          </tr>
        </thead>
        <tbody>
          {hyperlinks.map((item, idx) => (
            <tr key={idx}>
              <td className={styles.rowNum}>{idx + 1}</td>
              <td>{item.sourceObjectName}</td>
              <td className={styles.pathCell} title={item.sourceId}>
                {item.sourceId}
              </td>
              <td className={styles.pathCell} title={item.destId}>
                {item.destId}
              </td>
              <td>{item.links}</td>
              <td className={styles.pathCell} title={item.destParent}>
                {item.destParent}
              </td>
              <td className={styles.pathCell} title={item.sourceParent}>
                {item.sourceParent}
              </td>
              <td className={styles.sizeCell}>
                {formatBytes(item.objectSize)}
              </td>
              <td>{item.noOfConflictLinks}</td>
              <td>{item.noOfProcessedLinks}</td>
              <td>{item.totalLinkReplaceCount}</td>
              <td className={styles.pathCell} title={item.sourcePath}>
                {item.sourcePath}
              </td>
              <td>
                <span className={styles.statusTag} style={{ color: statusColor }}>
                  {item.processStatus}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function PermissionsTable({
  permissions,
  statusColor,
}: {
  permissions: PermissionRecord[];
  statusColor: string;
}) {
  return (
    <div className={styles.tableWrap}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>#</th>
            <th>objectName</th>
            <th>sourceId</th>
            <th>destId</th>
            <th>sourcePath</th>
            <th>destPath</th>
            <th>processStatus</th>
          </tr>
        </thead>
        <tbody>
          {permissions.map((item, idx) => (
            <tr key={idx}>
              <td className={styles.rowNum}>{idx + 1}</td>
              <td>{item.objectName}</td>
              <td className={styles.pathCell} title={item.sourceId}>
                {item.sourceId}
              </td>
              <td className={styles.pathCell} title={item.destId}>
                {item.destId}
              </td>
              <td className={styles.pathCell} title={item.sourcePath}>
                {item.sourcePath}
              </td>
              <td className={styles.pathCell} title={item.destPath}>
                {item.destPath}
              </td>
              <td>
                <span className={styles.statusTag} style={{ color: statusColor }}>
                  {item.processStatus}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function FileDetailsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const workspaceId = searchParams.get("workspaceId") || "";
  const processStatus = searchParams.get("processStatus") || "";
  const jobName = searchParams.get("jobName") || "";
  const type = searchParams.get("type") || "files";

  const ENDPOINT_MAP: Record<string, string> = {
    files: "files",
    hyperlinks: "hyperlinks-detail",
    permissions: "permissions-detail",
    workspaces: "WORKSPACES_SPECIAL",
  };

  const TITLE_MAP: Record<string, string> = {
    files: "File/Folder Details",
    hyperlinks: "Hyperlinks Details",
    permissions: "Permissions Details",
    workspaces: "Workspaces Status Details",
  };

  const pageTitle = TITLE_MAP[type] || "Details";
  const endpoint = ENDPOINT_MAP[type] || "files";

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedWsId, setSelectedWsId] = useState<string | null>(null);
  const [wsSizeData, setWsSizeData] = useState<
    { processStatus: string; totalSize: number }[] | null
  >(null);
  const [wsSizeLoading, setWsSizeLoading] = useState(false);
  const [fileSizeData, setFileSizeData] = useState<
    { processStatus: string; totalSize: number }[] | null
  >(null);
  const [fileSizeLoading, setFileSizeLoading] = useState(false);
  const [fileStatusData, setFileStatusData] = useState<
    { processStatus: string; totalCount: number }[] | null
  >(null);
  const [fileStatusLoading, setFileStatusLoading] = useState(false);
  const [hyperlinksStatusData, setHyperlinksStatusData] = useState<
    { processStatus: string; totalCount: number }[] | null
  >(null);
  const [hyperlinksStatusLoading, setHyperlinksStatusLoading] = useState(false);
  const [permStatusData, setPermStatusData] = useState<
    { processStatus: string; totalCount: number }[] | null
  >(null);
  const [permStatusLoading, setPermStatusLoading] = useState(false);

  const handleWorkspaceClick = useCallback((wsId: string) => {
    setSelectedWsId((prev) => (prev === wsId ? null : wsId));
  }, []);

  const DISPLAY_TO_RAW = Object.fromEntries(
    Object.entries(FILE_STATUS_DISPLAY).map(([k, v]) => [v, k])
  );

  const handleFileStatusPieClick = useCallback(
    (point: { name: string }) => {
      if (!selectedWsId) return;
      const rawStatus = DISPLAY_TO_RAW[point.name] || point.name;
      const params = new URLSearchParams({
        workspaceId: selectedWsId,
        processStatus: rawStatus,
        type: "files",
      });
      router.push(`/FileDetails?${params.toString()}`);
    },
    [selectedWsId, DISPLAY_TO_RAW, router]
  );

  const handleHyperlinksPieClick = useCallback(
    (point: { name: string }) => {
      if (!selectedWsId) return;
      const rawStatus = DISPLAY_TO_RAW[point.name] || point.name;
      const params = new URLSearchParams({
        workspaceId: selectedWsId,
        processStatus: rawStatus,
        type: "hyperlinks",
      });
      router.push(`/FileDetails?${params.toString()}`);
    },
    [selectedWsId, DISPLAY_TO_RAW, router]
  );

  const handlePermPieClick = useCallback(
    (point: { name: string }) => {
      if (!selectedWsId) return;
      const rawStatus = DISPLAY_TO_RAW[point.name] || point.name;
      const params = new URLSearchParams({
        workspaceId: selectedWsId,
        processStatus: rawStatus,
        type: "permissions",
      });
      router.push(`/FileDetails?${params.toString()}`);
    },
    [selectedWsId, DISPLAY_TO_RAW, router]
  );

  useEffect(() => {
    if (!selectedWsId) {
      setWsSizeData(null);
      setFileSizeData(null);
      setFileStatusData(null);
      setHyperlinksStatusData(null);
      setPermStatusData(null);
      return;
    }

    let cancelled = false;
    setWsSizeLoading(true);
    setFileSizeLoading(true);
    setFileStatusLoading(true);
    setHyperlinksStatusLoading(true);
    setPermStatusLoading(true);

    fetch(
      `/api/workspace/${encodeURIComponent(selectedWsId)}/workspace-size`
    )
      .then((res) => {
        if (!res.ok) throw new Error("Failed");
        return res.json();
      })
      .then((json) => {
        if (!cancelled) setWsSizeData(json.sizeBreakdown ?? []);
      })
      .catch(() => {
        if (!cancelled) setWsSizeData(null);
      })
      .finally(() => {
        if (!cancelled) setWsSizeLoading(false);
      });

    fetch(
      `/api/workspace/${encodeURIComponent(selectedWsId)}/datasize`
    )
      .then((res) => {
        if (!res.ok) throw new Error("Failed");
        return res.json();
      })
      .then((json) => {
        if (!cancelled) setFileSizeData(json.sizeBreakdown ?? []);
      })
      .catch(() => {
        if (!cancelled) setFileSizeData(null);
      })
      .finally(() => {
        if (!cancelled) setFileSizeLoading(false);
      });

    fetch(
      `/api/workspace/${encodeURIComponent(selectedWsId)}/status`
    )
      .then((res) => {
        if (!res.ok) throw new Error("Failed");
        return res.json();
      })
      .then((json) => {
        if (!cancelled) setFileStatusData(json.statusBreakdown ?? []);
      })
      .catch(() => {
        if (!cancelled) setFileStatusData(null);
      })
      .finally(() => {
        if (!cancelled) setFileStatusLoading(false);
      });

    fetch(
      `/api/workspace/${encodeURIComponent(selectedWsId)}/hyperlinks`
    )
      .then((res) => {
        if (!res.ok) throw new Error("Failed");
        return res.json();
      })
      .then((json) => {
        if (!cancelled) setHyperlinksStatusData(json.statusBreakdown ?? []);
      })
      .catch(() => {
        if (!cancelled) setHyperlinksStatusData(null);
      })
      .finally(() => {
        if (!cancelled) setHyperlinksStatusLoading(false);
      });

    fetch(
      `/api/workspace/${encodeURIComponent(selectedWsId)}/collaborations`
    )
      .then((res) => {
        if (!res.ok) throw new Error("Failed");
        return res.json();
      })
      .then((json) => {
        if (!cancelled) setPermStatusData(json.statusBreakdown ?? []);
      })
      .catch(() => {
        if (!cancelled) setPermStatusData(null);
      })
      .finally(() => {
        if (!cancelled) setPermStatusLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [selectedWsId]);

  const toSizeChartData = useCallback(
    (sizeData: { processStatus: string; totalSize: number }[] | null) =>
      (sizeData ?? [])
        .filter((item) => item.totalSize > 0)
        .map((item) => ({
          name:
            FILE_STATUS_DISPLAY[item.processStatus] || item.processStatus,
          value: item.totalSize,
          color: FILE_STATUS_COLORS[item.processStatus] || "#6b7eeb",
        })),
    []
  );

  const wsSizeChartData = toSizeChartData(wsSizeData);
  const fileSizeChartData = toSizeChartData(fileSizeData);

  const toCountChartData = useCallback(
    (countData: { processStatus: string; totalCount: number }[] | null) =>
      (countData ?? [])
        .filter((item) => item.totalCount > 0)
        .map((item) => ({
          name: FILE_STATUS_DISPLAY[item.processStatus] || item.processStatus,
          value: item.totalCount,
          color: FILE_STATUS_COLORS[item.processStatus] || "#6b7eeb",
        })),
    []
  );

  const fileStatusChartData = toCountChartData(fileStatusData);
  const hyperlinksStatusChartData = toCountChartData(hyperlinksStatusData);
  const permStatusChartData = toCountChartData(permStatusData);

  useEffect(() => {
    if (!processStatus) {
      setError("Missing processStatus");
      setIsLoading(false);
      return;
    }
    if (type !== "workspaces" && !workspaceId) {
      setError("Missing workspaceId");
      setIsLoading(false);
      return;
    }

    let cancelled = false;
    setIsLoading(true);
    setError(null);

    let url: string;
    if (type === "workspaces") {
      url = `/api/workspaces/status-detail?processStatus=${encodeURIComponent(processStatus)}`;
    } else {
      url = `/api/workspace/${encodeURIComponent(workspaceId)}/${endpoint}?processStatus=${encodeURIComponent(processStatus)}`;
    }

    fetch(url)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch details");
        return res.json();
      })
      .then((json) => {
        if (!cancelled) setData(json);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [workspaceId, processStatus, endpoint, type]);

  const statusDisplay =
    FILE_STATUS_DISPLAY[processStatus] || processStatus;
  const statusColor =
    FILE_STATUS_COLORS[processStatus] || "#6b7eeb";

  const totalCount = data?.totalCount ?? 0;
  const DATA_KEY_MAP: Record<string, string> = {
    files: "files",
    hyperlinks: "hyperlinks",
    permissions: "permissions",
    workspaces: "workspaces",
  };
  const records = data?.[DATA_KEY_MAP[type] || "files"] ?? [];

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <button className={styles.backBtn} onClick={() => router.back()}>
          <ArrowLeft size={18} />
          Back
        </button>
        <div className={styles.headerInfo}>
          <h2 className={styles.title}>{pageTitle}</h2>
          {jobName && (
            <p className={styles.subtitle}>Job: {jobName}</p>
          )}
          {workspaceId && (
            <p className={styles.subtitle}>
              Workspace: <span className={styles.mono}>{workspaceId}</span>
            </p>
          )}
          <p className={styles.subtitle}>
            Status:{" "}
            <span
              className={styles.statusBadge}
              style={{ color: statusColor }}
            >
              {statusDisplay}
            </span>
            {data && (
              <span className={styles.rowCount}>
                {" "}
                &mdash; {totalCount} row
                {totalCount !== 1 ? "s" : ""}
              </span>
            )}
          </p>
        </div>
      </div>

      <div className={styles.tableContainer}>
        {isLoading ? (
          <div className={styles.loading}>Loading details...</div>
        ) : error ? (
          <div className={styles.error}>{error}</div>
        ) : records.length > 0 ? (
          type === "workspaces" ? (
            <>
              <WorkspacesTable
                workspaces={records}
                statusColor={statusColor}
                onWorkspaceClick={handleWorkspaceClick}
                selectedWsId={selectedWsId}
              />
              {selectedWsId && (
                <div className={styles.wsSizeSection}>
                  <div className={styles.chartsRow}>
                    <div className={styles.chartCol}>
                      {wsSizeLoading ? (
                        <div className={styles.loading}>
                          Loading workspace data size...
                        </div>
                      ) : wsSizeChartData.length > 0 ? (
                        <DoughnutChartCard
                          title="Workspace Data Size Breakdown"
                          subtitle={`Workspace: ${selectedWsId}`}
                          data={wsSizeChartData}
                          customHeight={320}
                          customWidth={null}
                          showDataLabels={true}
                          showLegend={true}
                          valueFormatter={formatBytes}
                        />
                      ) : (
                        <div className={styles.empty}>
                          No workspace data size info
                        </div>
                      )}
                    </div>

                    <div className={styles.chartCol}>
                      {fileSizeLoading ? (
                        <div className={styles.loading}>
                          Loading file data size...
                        </div>
                      ) : fileSizeChartData.length > 0 ? (
                        <DoughnutChartCard
                          title="File/Folder + Hyperlinks Size Breakdown"
                          subtitle={`Workspace: ${selectedWsId}`}
                          data={fileSizeChartData}
                          customHeight={320}
                          customWidth={null}
                          showDataLabels={true}
                          showLegend={true}
                          valueFormatter={formatBytes}
                        />
                      ) : (
                        <div className={styles.empty}>
                          No file/hyperlinks size info
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Row 2: File/Folder Status & HyperLinks Status */}
                  <div className={styles.chartsRow}>
                    <div className={styles.chartCol}>
                      {fileStatusLoading ? (
                        <div className={styles.loading}>
                          Loading file status data...
                        </div>
                      ) : fileStatusChartData.length > 0 ? (
                        <DoughnutChartCard
                          title="File/Folder Status Breakdown"
                          subtitle={`Workspace: ${selectedWsId}`}
                          data={fileStatusChartData}
                          customHeight={320}
                          customWidth={null}
                          showDataLabels={true}
                          showLegend={true}
                          onPointClick={handleFileStatusPieClick}
                        />
                      ) : (
                        <div className={styles.empty}>
                          No file/folder status data
                        </div>
                      )}
                    </div>

                    <div className={styles.chartCol}>
                      {hyperlinksStatusLoading ? (
                        <div className={styles.loading}>
                          Loading hyperlinks status data...
                        </div>
                      ) : hyperlinksStatusChartData.length > 0 ? (
                        <DoughnutChartCard
                          title="HyperLinks Status Breakdown"
                          subtitle={`Workspace: ${selectedWsId}`}
                          data={hyperlinksStatusChartData}
                          customHeight={320}
                          customWidth={null}
                          showDataLabels={true}
                          showLegend={true}
                          onPointClick={handleHyperlinksPieClick}
                        />
                      ) : (
                        <div className={styles.empty}>
                          No hyperlinks status data
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Row 3: Permissions Status */}
                  <div className={styles.chartsRow}>
                    <div className={styles.chartCol}>
                      {permStatusLoading ? (
                        <div className={styles.loading}>
                          Loading permissions status data...
                        </div>
                      ) : permStatusChartData.length > 0 ? (
                        <DoughnutChartCard
                          title="Permissions Status Breakdown"
                          subtitle={`Workspace: ${selectedWsId}`}
                          data={permStatusChartData}
                          customHeight={320}
                          customWidth={null}
                          showDataLabels={true}
                          showLegend={true}
                          onPointClick={handlePermPieClick}
                        />
                      ) : (
                        <div className={styles.empty}>
                          No permissions status data
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : type === "hyperlinks" ? (
            <HyperlinksTable
              hyperlinks={records}
              statusColor={statusColor}
            />
          ) : type === "permissions" ? (
            <PermissionsTable
              permissions={records}
              statusColor={statusColor}
            />
          ) : (
            <FilesTable files={records} statusColor={statusColor} />
          )
        ) : (
          <div className={styles.empty}>No details found</div>
        )}
      </div>
    </div>
  );
}

export default function FileDetailsPage() {
  return (
    <Suspense
      fallback={
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: "100%",
            color: "#9ca3af",
          }}
        >
          Loading...
        </div>
      }
    >
      <FileDetailsContent />
    </Suspense>
  );
}
