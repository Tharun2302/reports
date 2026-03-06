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
          processStatus: {
            $in: ["CONFLICT", "VERSION_CONFLICT", "MANUAL_FILE_RETRY"],
          },
        },
      },
      {
        $addFields: {
          errorCode: {
            $let: {
              vars: {
                codeMatch: {
                  $regexFind: {
                    input: { $ifNull: ["$errorDescription", ""] },
                    regex: { $literal: '"code"\\s*:\\s*"([^"]+)"' },
                  },
                },
              },
              in: {
                $cond: {
                  if: {
                    $and: [
                      { $ne: ["$$codeMatch", null] },
                      {
                        $gt: [
                          { $size: { $ifNull: ["$$codeMatch.captures", []] } },
                          0,
                        ],
                      },
                    ],
                  },
                  then: { $arrayElemAt: ["$$codeMatch.captures", 0] },
                  else: "Other",
                },
              },
            },
          },
        },
      },
      {
        $group: {
          _id: "$errorCode",
          totalCount: { $sum: 1 },
          totalRetries: { $sum: { $ifNull: ["$retry", 0] } },
          maxRetry: { $max: { $ifNull: ["$retry", 0] } },
          statusCode: { $first: { $ifNull: ["$statusCode", 0] } },
        },
      },
      {
        $project: {
          _id: 0,
          errorCode: "$_id",
          statusCode: 1,
          totalCount: 1,
          totalRetries: 1,
          maxRetry: 1,
        },
      },
      {
        $sort: {
          totalCount: -1 as const,
        },
      },
    ];

    const results = await collection.aggregate(pipeline).toArray();

    const conflicts = results.map((item) => ({
      errorCode: (item.errorCode as string) || "Other",
      statusCode: (item.statusCode as number) || 0,
      totalCount: item.totalCount as number,
      totalRetries: item.totalRetries as number,
      maxRetry: item.maxRetry as number,
    }));

    return NextResponse.json({
      workspaceId: decodedWorkspaceId,
      totalConflicts: conflicts.reduce((sum, c) => sum + c.totalCount, 0),
      conflicts,
    });
  } catch (error) {
    console.error("Error fetching conflicts breakdown:", error);
    return NextResponse.json(
      { error: "Failed to fetch conflicts breakdown" },
      { status: 500 }
    );
  }
}
