import { NextRequest, NextResponse } from "next/server";
import { getJobsCollection } from "@/lib/mongodb";
import type { DashboardFilters, JobItem } from "@/types/dashboard";
import { Document } from "mongodb";

function buildMatchStage(filters: DashboardFilters): Document {
  const conditions: Document[] = [{ _id: { $exists: true } }];

  if (filters.userId) {
    conditions.push({ userId: filters.userId });
  }

  if (filters.fromCloudName) {
    conditions.push({ fromCloudName: filters.fromCloudName });
  }

  if (filters.toCloudName) {
    conditions.push({ toCloudName: filters.toCloudName });
  }

  if (filters.jobType) {
    conditions.push({ jobType: filters.jobType });
  }

  // Filter by jobStatus - support "ALL" to show all statuses
  if (filters.jobStatus && filters.jobStatus !== "ALL") {
    conditions.push({ jobStatus: filters.jobStatus });
  }

  if (filters.dateFrom || filters.dateTo) {
    const dateCondition: Document = {};
    if (filters.dateFrom) {
      dateCondition.$gte = new Date(filters.dateFrom);
    }
    if (filters.dateTo) {
      dateCondition.$lte = new Date(filters.dateTo);
    }
    conditions.push({ createdTime: dateCondition });
  }

  return { $and: conditions };
}

const STATUS_DISPLAY_NAMES: Record<string, string> = {
  COMPLETED: "Completed",
  IN_PROGRESS: "In Progress",
  STARTED: "Started",
  PARTIALLY_COMPLETED: "Partially Completed",
  SUSPENDED: "Suspended",
};

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const dbName = searchParams.get("db") || "cloudfuze";
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "500", 10);
    const skip = (page - 1) * limit;

    const filters: DashboardFilters = {
      userId: searchParams.get("userId") || undefined,
      fromCloudName: searchParams.get("fromCloudName") || undefined,
      toCloudName: searchParams.get("toCloudName") || undefined,
      jobType: (searchParams.get("jobType") as "ONETIME" | "DELTA") || undefined,
      jobStatus: searchParams.get("jobStatus") || undefined,
      dateFrom: searchParams.get("dateFrom") || undefined,
      dateTo: searchParams.get("dateTo") || undefined,
    };

    const collection = await getJobsCollection(dbName);
    const matchStage = buildMatchStage(filters);

    const pipeline = [
      { $match: matchStage },
      { $sort: { createdTime: -1 as const } },
      { $skip: skip },
      { $limit: limit },
      {
        $project: {
          _id: 1,
          jobName: 1,
          jobType: 1,
          jobStatus: 1,
          processedData: 1,
          totalData: 1,
          completedPairsCount: 1,
          totalPairsCount: 1,
          createdTime: 1,
          modifiedTime: 1,
          fromCloudName: 1,
          toCloudName: 1,
          userId: 1,
        },
      },
    ];

    const jobs = await collection.aggregate(pipeline).toArray();
    const totalCount = await collection.countDocuments(matchStage);

    const jobItems: JobItem[] = jobs.map((job) => ({
      id: job._id.toString(),
      jobName: job.jobName || "Unknown Job",
      jobType: job.jobType || "ONETIME",
      status: STATUS_DISPLAY_NAMES[job.jobStatus] || job.jobStatus || "Unknown",
      totalDataMigrated: (job.processedData || 0) / (1024 * 1024), // Convert to MB
      totalDataSize: (job.totalData || 0) / (1024 * 1024), // Convert to MB
      pairsMigrated: job.completedPairsCount || 0,
      totalPairs: job.totalPairsCount || 0,
      processedOn: job.modifiedTime
        ? new Date(job.modifiedTime).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })
        : job.createdTime
        ? new Date(job.createdTime).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })
        : "Unknown",
      fromCloudName: job.fromCloudName || "",
      toCloudName: job.toCloudName || "",
      userId: job.userId?.toString() || "",
    }));

    return NextResponse.json({
      jobs: jobItems,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching jobs:", error);
    return NextResponse.json(
      { error: "Failed to fetch jobs" },
      { status: 500 }
    );
  }
}
