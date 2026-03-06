import { NextRequest, NextResponse } from "next/server";
import { getCollabarationDetailsCollection } from "@/lib/mongodb";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ workspaceId: string }> }
) {
  try {
    const { workspaceId } = await params;
    const decodedWorkspaceId = decodeURIComponent(workspaceId);
    const searchParams = request.nextUrl.searchParams;
    const processStatus = searchParams.get("processStatus");
    const dbName = searchParams.get("db") || "cloudfuze";

    if (!processStatus) {
      return NextResponse.json(
        { error: "processStatus query parameter is required" },
        { status: 400 }
      );
    }

    const collection = await getCollabarationDetailsCollection(dbName);

    const pipeline = [
      {
        $match: {
          $expr: {
            $and: [
              {
                $eq: [{ $toString: "$moveWorkSpaceId" }, decodedWorkspaceId],
              },
              {
                $eq: ["$processStatus", processStatus],
              },
            ],
          },
        },
      },
      {
        $project: {
          _id: 0,
          moveWorkSpaceId: 1,
          objectName: 1,
          sourceId: 1,
          destId: 1,
          processStatus: 1,
          sourcePath: 1,
          destPath: 1,
        },
      },
    ];

    const results = await collection.aggregate(pipeline).toArray();

    const permissions = results.map((item) => ({
      moveWorkSpaceId: item.moveWorkSpaceId?.toString() || "",
      objectName: (item.objectName as string) || "",
      sourceId: (item.sourceId as string) || "",
      destId: (item.destId as string) || "",
      processStatus: (item.processStatus as string) || "",
      sourcePath: (item.sourcePath as string) || "",
      destPath: (item.destPath as string) || "",
    }));

    return NextResponse.json({
      workspaceId: decodedWorkspaceId,
      processStatus,
      totalCount: permissions.length,
      permissions,
    });
  } catch (error) {
    console.error("Error fetching permissions details:", error);
    return NextResponse.json(
      { error: "Failed to fetch permissions details" },
      { status: 500 }
    );
  }
}
