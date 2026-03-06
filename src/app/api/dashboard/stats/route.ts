import { NextRequest, NextResponse } from "next/server";
import { getJobsCollection } from "@/lib/mongodb";
import type { DashboardFilters, DashboardStats, JobStatusCount } from "@/types/dashboard";
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

    const collection = await getJobsCollection(dbName);
    const matchStage = buildMatchStage(filters);

    const pipeline = [
      { $match: matchStage },
      {
        $group: {
          _id: "$jobStatus",
          totalCount: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          jobStatus: "$_id",
          totalCount: 1,
        },
      },
      {
        $sort: { totalCount: -1 as const },
      },
    ];

    const statusCounts = (await collection.aggregate(pipeline).toArray()) as JobStatusCount[];

    let totalJobs = 0;
    let completedJobs = 0;
    let inProgressJobs = 0;
    let partiallyCompletedJobs = 0;

    statusCounts.forEach((item) => {
      totalJobs += item.totalCount;

      switch (item.jobStatus) {
        case "COMPLETED":
          completedJobs += item.totalCount;
          break;
        case "IN_PROGRESS":
        case "STARTED":
          inProgressJobs += item.totalCount;
          break;
        case "PARTIALLY_COMPLETED":
          partiallyCompletedJobs += item.totalCount;
          break;
      }
    });

    const stats: DashboardStats = {
      totalJobs,
      completedJobs,
      inProgressJobs,
      partiallyCompletedJobs,
      statusBreakdown: statusCounts,
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard stats" },
      { status: 500 }
    );
  }
}
