import { NextRequest, NextResponse } from "next/server";
import { getHyperlinksCollection } from "@/lib/mongodb";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ workspaceId: string }> }
) {
  try {
    const { workspaceId } = await params;
    const decodedWorkspaceId = decodeURIComponent(workspaceId);
    const searchParams = request.nextUrl.searchParams;
    const dbName = searchParams.get("db") || "cloudfuze";

    const collection = await getHyperlinksCollection(dbName);

    const pipeline = [
      {
        $match: {
          $expr: {
            $eq: [{ $toString: "$moveWorkSpaceId" }, decodedWorkspaceId],
          },
        },
      },
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
      {
        $sort: {
          totalCount: -1 as const,
        },
      },
    ];

    const results = await collection.aggregate(pipeline).toArray();

    const statusBreakdown = results.map((item) => ({
      processStatus: (item.processStatus as string) || "UNKNOWN",
      totalCount: item.totalCount as number,
    }));

    return NextResponse.json({
      workspaceId: decodedWorkspaceId,
      statusBreakdown,
    });
  } catch (error) {
    console.error("Error fetching hyperlinks status:", error);
    return NextResponse.json(
      { error: "Failed to fetch hyperlinks status breakdown" },
      { status: 500 }
    );
  }
}
