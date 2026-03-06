import { NextRequest, NextResponse } from "next/server";
import { getJobsCollection } from "@/lib/mongodb";

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

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ jobName: string }> }
) {
  try {
    const { jobName } = await params;
    const decodedJobName = decodeURIComponent(jobName);
    const searchParams = request.nextUrl.searchParams;
    const dbName = searchParams.get("db") || "cloudfuze";

    const collection = await getJobsCollection(dbName);

    const pipeline = [
      {
        $match: {
          jobName: decodedJobName,
        },
      },
      {
        $project: {
          _id: 0,
          jobName: 1,
          listOfMoveWorkspaceId: 1,
        },
      },
      {
        $unwind: "$listOfMoveWorkspaceId",
      },
      {
        $lookup: {
          from: "MoveWorkSpaces",
          let: { wid: "$listOfMoveWorkspaceId" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: [{ $toString: "$_id" }, "$$wid"],
                },
              },
            },
            {
              $project: {
                _id: 1,
                fromCloudName: 1,
                toCloudName: 1,
                fromMailId: 1,
                toMailId: 1,
                processStatus: 1,
              },
            },
          ],
          as: "workspace",
        },
      },
      {
        $unwind: {
          path: "$workspace",
          preserveNullAndEmptyArrays: false,
        },
      },
      {
        $project: {
          _id: 0,
          workspaceId: "$workspace._id",
          jobName: 1,
          fromCloudName: "$workspace.fromCloudName",
          toCloudName: "$workspace.toCloudName",
          fromMailId: "$workspace.fromMailId",
          toMailId: "$workspace.toMailId",
          processStatus: "$workspace.processStatus",
        },
      },
      {
        $sort: {
          workspaceId: 1 as const,
        },
      },
    ];

    const results = await collection.aggregate(pipeline).toArray();

    const workspaces: WorkspaceDetail[] = results.map((ws) => ({
      workspaceId: ws.workspaceId?.toString() || "",
      jobName: ws.jobName || "",
      fromCloudName: ws.fromCloudName || "",
      toCloudName: ws.toCloudName || "",
      fromMailId: ws.fromMailId || "",
      toMailId: ws.toMailId || "",
      processStatus: ws.processStatus || "",
    }));

    const stats: WorkspaceStats = {
      total: workspaces.length,
      processed: 0,
      inProgress: 0,
      conflict: 0,
    };

    workspaces.forEach((ws) => {
      switch (ws.processStatus) {
        case "PROCESSED":
        case "PROCESSED_WITH_SOME_CONFLICTS":
          stats.processed++;
          break;
        case "IN_PROGRESS":
        case "NOT_PROCESSED":
          stats.inProgress++;
          break;
        case "CONFLICT":
        case "SUSPENDED":
          stats.conflict++;
          break;
      }
    });

    return NextResponse.json({
      jobName: decodedJobName,
      workspaces,
      stats,
    });
  } catch (error) {
    console.error("Error fetching job workspaces:", error);
    return NextResponse.json(
      { error: "Failed to fetch job workspace details" },
      { status: 500 }
    );
  }
}
