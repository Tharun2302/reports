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
    const processStatus = searchParams.get("processStatus");
    const dbName = searchParams.get("db") || "cloudfuze";

    if (!processStatus) {
      return NextResponse.json(
        { error: "processStatus query parameter is required" },
        { status: 400 }
      );
    }

    const collection = await getFileFolderInfoCollection(dbName);

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
          processStatus: 1,
          sourceObjectName: 1,
          destObjectName: 1,
          fromCloudName: 1,
          toCloudName: 1,
          fileSize: 1,
          sourceParent: 1,
          destParent: 1,
          sourcePath: 1,
          destPath: 1,
        },
      },
    ];

    const results = await collection.aggregate(pipeline).toArray();

    const files = results.map((item) => ({
      moveWorkSpaceId: item.moveWorkSpaceId?.toString() || "",
      processStatus: (item.processStatus as string) || "",
      sourceObjectName: (item.sourceObjectName as string) || "",
      destObjectName: (item.destObjectName as string) || "",
      fromCloudName: (item.fromCloudName as string) || "",
      toCloudName: (item.toCloudName as string) || "",
      fileSize: (item.fileSize as number) || 0,
      sourceParent: (item.sourceParent as string) || "",
      destParent: (item.destParent as string) || "",
      sourcePath: (item.sourcePath as string) || "",
      destPath: (item.destPath as string) || "",
    }));

    return NextResponse.json({
      workspaceId: decodedWorkspaceId,
      processStatus,
      totalCount: files.length,
      files,
    });
  } catch (error) {
    console.error("Error fetching file details:", error);
    return NextResponse.json(
      { error: "Failed to fetch file details" },
      { status: 500 }
    );
  }
}
