import { NextRequest, NextResponse } from "next/server";
import { getWorkspacesCollection } from "@/lib/mongodb";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const processStatus = searchParams.get("processStatus") || "ALL";
    const dbName = searchParams.get("db") || "cloudfuze";

    const collection = await getWorkspacesCollection(dbName);

    const matchStages = [{ $match: { _id: { $exists: true } } }];

    if (processStatus && processStatus !== "ALL") {
      matchStages.push({
        $match: { processStatus: processStatus } as Record<string, unknown>,
      });
    }

    const pipeline = [
      ...matchStages,
      {
        $addFields: {
          workspaceIdString: { $toString: "$_id" },
        },
      },
      {
        $lookup: {
          from: "FileFolderInfo",
          let: { wid: "$workspaceIdString" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: [{ $toString: "$moveWorkSpaceId" }, "$$wid"],
                },
              },
            },
            {
              $group: {
                _id: null,
                totalFiles: { $sum: 1 },
                processedFiles: {
                  $sum: {
                    $cond: [
                      {
                        $in: [
                          { $toUpper: "$processStatus" },
                          ["PROCESSED", "PROCESSED_WITH_SOME_CONFLICTS"],
                        ],
                      },
                      1,
                      0,
                    ],
                  },
                },
              },
            },
          ],
          as: "fileStats",
        },
      },
      {
        $lookup: {
          from: "CollabarationDetails",
          let: { wid: "$workspaceIdString" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: [{ $toString: "$moveWorkSpaceId" }, "$$wid"],
                },
              },
            },
            {
              $group: {
                _id: null,
                totalCollabs: { $sum: 1 },
                processedCollabs: {
                  $sum: {
                    $cond: [
                      {
                        $in: [
                          { $toUpper: "$processStatus" },
                          ["PROCESSED", "PROCESSED_WITH_SOME_CONFLICTS"],
                        ],
                      },
                      1,
                      0,
                    ],
                  },
                },
              },
            },
          ],
          as: "collabStats",
        },
      },
      {
        $lookup: {
          from: "HyperLinks",
          let: { wid: "$workspaceIdString" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: [{ $toString: "$moveWorkSpaceId" }, "$$wid"],
                },
              },
            },
            {
              $group: {
                _id: null,
                totalLinks: { $sum: 1 },
                processedLinks: {
                  $sum: {
                    $cond: [
                      {
                        $in: [
                          { $toUpper: "$processStatus" },
                          ["PROCESSED", "PROCESSED_WITH_SOME_CONFLICTS"],
                        ],
                      },
                      1,
                      0,
                    ],
                  },
                },
              },
            },
          ],
          as: "linkStats",
        },
      },
      {
        $addFields: {
          totalFiles: {
            $ifNull: [{ $arrayElemAt: ["$fileStats.totalFiles", 0] }, 0],
          },
          processedFiles: {
            $ifNull: [
              { $arrayElemAt: ["$fileStats.processedFiles", 0] },
              0,
            ],
          },
          totalCollabs: {
            $ifNull: [
              { $arrayElemAt: ["$collabStats.totalCollabs", 0] },
              0,
            ],
          },
          processedCollabs: {
            $ifNull: [
              { $arrayElemAt: ["$collabStats.processedCollabs", 0] },
              0,
            ],
          },
          totalLinks: {
            $ifNull: [{ $arrayElemAt: ["$linkStats.totalLinks", 0] }, 0],
          },
          processedLinks: {
            $ifNull: [
              { $arrayElemAt: ["$linkStats.processedLinks", 0] },
              0,
            ],
          },
        },
      },
      {
        $addFields: {
          processedFilesPercentage: {
            $cond: [
              { $gt: ["$totalFiles", 0] },
              {
                $round: [
                  {
                    $multiply: [
                      { $divide: ["$processedFiles", "$totalFiles"] },
                      100,
                    ],
                  },
                  2,
                ],
              },
              0,
            ],
          },
          processedCollabPercentage: {
            $cond: [
              { $gt: ["$totalCollabs", 0] },
              {
                $round: [
                  {
                    $multiply: [
                      { $divide: ["$processedCollabs", "$totalCollabs"] },
                      100,
                    ],
                  },
                  2,
                ],
              },
              0,
            ],
          },
          processedHyperlinksPercentage: {
            $cond: [
              { $gt: ["$totalLinks", 0] },
              {
                $round: [
                  {
                    $multiply: [
                      { $divide: ["$processedLinks", "$totalLinks"] },
                      100,
                    ],
                  },
                  2,
                ],
              },
              0,
            ],
          },
        },
      },
      {
        $project: {
          _id: 1,
          fromMailId: 1,
          toMailId: 1,
          processStatus: 1,
          processedFilesPercentage: {
            $concat: [{ $toString: "$processedFilesPercentage" }, "%"],
          },
          processedCollabPercentage: {
            $concat: [{ $toString: "$processedCollabPercentage" }, "%"],
          },
          processedHyperlinksPercentage: {
            $concat: [
              { $toString: "$processedHyperlinksPercentage" },
              "%",
            ],
          },
        },
      },
      { $limit: 1048575 },
    ];

    const results = await collection.aggregate(pipeline).toArray();

    const workspaces = results.map((item) => ({
      workspaceId: item._id?.toString() || "",
      fromMailId: (item.fromMailId as string) || "",
      toMailId: (item.toMailId as string) || "",
      processStatus: (item.processStatus as string) || "",
      processedFilesPercentage:
        (item.processedFilesPercentage as string) || "0%",
      processedCollabPercentage:
        (item.processedCollabPercentage as string) || "0%",
      processedHyperlinksPercentage:
        (item.processedHyperlinksPercentage as string) || "0%",
    }));

    return NextResponse.json({
      processStatus,
      totalCount: workspaces.length,
      workspaces,
    });
  } catch (error) {
    console.error("Error fetching workspace status details:", error);
    return NextResponse.json(
      { error: "Failed to fetch workspace status details" },
      { status: 500 }
    );
  }
}
