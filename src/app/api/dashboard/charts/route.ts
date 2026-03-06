import { NextRequest, NextResponse } from "next/server";
import { getWorkspacesCollection } from "@/lib/mongodb";
import type { DashboardFilters, ChartData } from "@/types/dashboard";
import { Document } from "mongodb";

const WORKSPACE_STATUS_COLORS: Record<string, string> = {
  PROCESSED: "#22c55e",
  IN_PROGRESS: "#6b7eeb",
  NOT_PROCESSED: "#3b82f6",
  CONFLICT: "#dc2626",
  SUSPENDED: "#ef4444",
  PROCESSED_WITH_SOME_CONFLICTS: "#f59e0b",
  CANCEL: "#9ca3af",
};

const WORKSPACE_STATUS_DISPLAY_NAMES: Record<string, string> = {
  PROCESSED: "Processed",
  IN_PROGRESS: "In Progress",
  NOT_PROCESSED: "Not Processed",
  CONFLICT: "Conflict",
  SUSPENDED: "Suspended",
  PROCESSED_WITH_SOME_CONFLICTS: "Processed With Some Conflicts",
  CANCEL: "Cancelled",
};

function buildWorkspaceMatchStage(filters: DashboardFilters): Document {
  const conditions: Document[] = [{ _id: { $exists: true } }];

  if (filters.fromCloudName) {
    conditions.push({ fromCloudName: filters.fromCloudName });
  }

  if (filters.toCloudName) {
    conditions.push({ toCloudName: filters.toCloudName });
  }

  if (filters.jobType) {
    const isDelta = filters.jobType === "DELTA";
    conditions.push({ deltaMigration: isDelta });
  }

  if (filters.userId) {
    conditions.push({ ownerEmailId: filters.userId });
  }

  return { $and: conditions };
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const dbName = searchParams.get("db") || "cloudfuze";

    const filters: DashboardFilters = {
      userId: searchParams.get("userId") || undefined,
      fromCloudName: searchParams.get("fromCloudName") || undefined,
      toCloudName: searchParams.get("toCloudName") || undefined,
      jobType: (searchParams.get("jobType") as "ONETIME" | "DELTA") || undefined,
      dateFrom: searchParams.get("dateFrom") || undefined,
      dateTo: searchParams.get("dateTo") || undefined,
    };

    // Get workspaces by status from MoveWorkSpaces collection
    const workspacesCollection = await getWorkspacesCollection(dbName);
    const workspaceMatchStage = buildWorkspaceMatchStage(filters);

    const workspaceStatusPipeline = [
      { $match: workspaceMatchStage },
      {
        $group: {
          _id: "$processStatus",
          totalCount: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          processStatus: "$_id",
          totalCount: 1,
        },
      },
      { $sort: { totalCount: -1 as const } },
    ];

    const workspaceStatusResults = await workspacesCollection
      .aggregate(workspaceStatusPipeline)
      .toArray();

    // Map each status separately (no grouping)
    const workspacesByStatus = workspaceStatusResults.map((item) => {
      const status = item.processStatus as string;
      const displayName = WORKSPACE_STATUS_DISPLAY_NAMES[status] || status;
      const color = WORKSPACE_STATUS_COLORS[status] || "#6b7eeb";
      
      return {
        name: displayName,
        value: item.totalCount as number,
        color,
      };
    });

    // Get migrated data size from MoveWorkSpaces collection
    const dataSizePipeline = [
      { $match: workspaceMatchStage },
      {
        $group: {
          _id: "$processStatus",
          totalFileSize: {
            $sum: { $ifNull: ["$dataSize", 0] },
          },
        },
      },
      {
        $project: {
          _id: 0,
          processStatus: "$_id",
          totalFileSize: 1,
        },
      },
      { $sort: { totalFileSize: -1 as const } },
    ];

    const dataSizeResults = await workspacesCollection.aggregate(dataSizePipeline).toArray();

    // Map each status to data size (convert bytes to GB)
    const migratedDataSize = dataSizeResults
      .filter((item) => (item.totalFileSize as number) > 0)
      .map((item) => {
        const status = item.processStatus as string;
        const displayName = WORKSPACE_STATUS_DISPLAY_NAMES[status] || status;
        const color = WORKSPACE_STATUS_COLORS[status] || "#6b7eeb";
        const sizeInGB = ((item.totalFileSize as number) * 1.073741824e-9);

        return {
          name: displayName,
          value: Math.round(sizeInGB * 100) / 100,
          color,
        };
      });

    const chartData: ChartData = {
      workspacesByStatus,
      migratedDataSize,
    };

    return NextResponse.json(chartData);
  } catch (error) {
    console.error("Error fetching chart data:", error);
    return NextResponse.json(
      { error: "Failed to fetch chart data" },
      { status: 500 }
    );
  }
}
