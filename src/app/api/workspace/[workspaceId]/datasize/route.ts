import { NextRequest, NextResponse } from "next/server";
import { getFileFolderInfoCollection } from "@/lib/mongodb";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ workspaceId: string }> }
) {
  try {
    const { workspaceId } = await params;
    const decodedWorkspaceId = decodeURIComponent(workspaceId);
    const searchParams = request.nextUrl.searchParams;
    const dbName = searchParams.get("db") || "cloudfuze";

    const collection = await getFileFolderInfoCollection(dbName);

    const pipeline = [
      {
        $match: {
          $expr: {
            $eq: [{ $toString: "$moveWorkSpaceId" }, decodedWorkspaceId],
          },
        },
      },
      {
        $project: {
          processStatus: 1,
          size: "$fileSize",
        },
      },
      {
        $unionWith: {
          coll: "HyperLinks",
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: [
                    { $toString: "$moveWorkSpaceId" },
                    decodedWorkspaceId,
                  ],
                },
              },
            },
            {
              $project: {
                processStatus: 1,
                size: "$objectSize",
              },
            },
          ],
        },
      },
      {
        $group: {
          _id: "$processStatus",
          totalSize: { $sum: "$size" },
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
    console.error("Error fetching data size breakdown:", error);
    return NextResponse.json(
      { error: "Failed to fetch data size breakdown" },
      { status: 500 }
    );
  }
}
