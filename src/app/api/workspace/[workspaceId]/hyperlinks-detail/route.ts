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
    const processStatus = searchParams.get("processStatus");
    const dbName = searchParams.get("db") || "cloudfuze";

    if (!processStatus) {
      return NextResponse.json(
        { error: "processStatus query parameter is required" },
        { status: 400 }
      );
    }

    const collection = await getHyperlinksCollection(dbName);

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
          sourceObjectName: 1,
          sourceId: 1,
          destId: 1,
          links: 1,
          destParent: 1,
          sourceParent: 1,
          objectSize: 1,
          noOfConflictLinks: 1,
          noOfProcessedLinks: 1,
          processStatus: 1,
          totalLinkReplaceCount: 1,
          sourcePath: 1,
        },
      },
    ];

    const results = await collection.aggregate(pipeline).toArray();

    const hyperlinks = results.map((item) => ({
      moveWorkSpaceId: item.moveWorkSpaceId?.toString() || "",
      sourceObjectName: (item.sourceObjectName as string) || "",
      sourceId: (item.sourceId as string) || "",
      destId: (item.destId as string) || "",
      links: (item.links as number) || 0,
      destParent: (item.destParent as string) || "",
      sourceParent: (item.sourceParent as string) || "",
      objectSize: (item.objectSize as number) || 0,
      noOfConflictLinks: (item.noOfConflictLinks as number) || 0,
      noOfProcessedLinks: (item.noOfProcessedLinks as number) || 0,
      processStatus: (item.processStatus as string) || "",
      totalLinkReplaceCount: (item.totalLinkReplaceCount as number) || 0,
      sourcePath: (item.sourcePath as string) || "",
    }));

    return NextResponse.json({
      workspaceId: decodedWorkspaceId,
      processStatus,
      totalCount: hyperlinks.length,
      hyperlinks,
    });
  } catch (error) {
    console.error("Error fetching hyperlinks details:", error);
    return NextResponse.json(
      { error: "Failed to fetch hyperlinks details" },
      { status: 500 }
    );
  }
}
