import { NextRequest, NextResponse } from "next/server";
import { getWorkspacesCollection } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ workspaceId: string }> }
) {
  try {
    const { workspaceId } = await params;
    const decodedWorkspaceId = decodeURIComponent(workspaceId);
    const searchParams = request.nextUrl.searchParams;
    const dbName = searchParams.get("db") || "cloudfuze";

    const collection = await getWorkspacesCollection(dbName);

    let objectId: ObjectId;
    try {
      objectId = new ObjectId(decodedWorkspaceId);
    } catch {
      return NextResponse.json(
        { error: "Invalid workspace ID format" },
        { status: 400 }
      );
    }

    const pipeline = [
      {
        $match: {
          _id: objectId,
        },
      },
      {
        $group: {
          _id: "$processStatus",
          totalSize: {
            $sum: {
              $ifNull: ["$dataSize", 0],
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          processStatus: "$_id",
          totalSize: 1,
        },
      },
      {
        $sort: {
          totalSize: -1 as const,
        },
      },
    ];

    const results = await collection.aggregate(pipeline).toArray();

    const sizeBreakdown = results.map((item) => ({
      processStatus: (item.processStatus as string) || "UNKNOWN",
      totalSize: item.totalSize as number,
    }));

    return NextResponse.json({
      workspaceId: decodedWorkspaceId,
      sizeBreakdown,
    });
  } catch (error) {
    console.error("Error fetching workspace size:", error);
    return NextResponse.json(
      { error: "Failed to fetch workspace size breakdown" },
      { status: 500 }
    );
  }
}
