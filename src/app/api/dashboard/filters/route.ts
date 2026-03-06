import { NextRequest, NextResponse } from "next/server";
import { getJobsCollection, getDatabase } from "@/lib/mongodb";
import type { FilterOptions } from "@/types/dashboard";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const dbName = searchParams.get("db") || "cloudfuze";

    const collection = await getJobsCollection(dbName);
    const db = await getDatabase(dbName);

    // Get unique fromCloudNames
    const fromClouds = await collection.distinct("fromCloudName");

    // Get unique toCloudNames
    const toClouds = await collection.distinct("toCloudName");

    // Get unique jobTypes
    const jobTypes = await collection.distinct("jobType");

    // Get unique userIds and fetch user details
    const userIds = await collection.distinct("userId");
    
    // Try to get user emails from Users collection
    const usersCollection = db.collection("Users");
    const users: { id: string; email: string }[] = [];

    for (const userId of userIds) {
      if (userId) {
        try {
          const user = await usersCollection.findOne(
            { _id: userId },
            { projection: { primaryEmail: 1 } }
          );
          users.push({
            id: userId.toString(),
            email: user?.primaryEmail || userId.toString(),
          });
        } catch {
          users.push({
            id: userId.toString(),
            email: userId.toString(),
          });
        }
      }
    }

    const filterOptions: FilterOptions = {
      users,
      fromClouds: fromClouds.filter(Boolean) as string[],
      toClouds: toClouds.filter(Boolean) as string[],
      jobTypes: jobTypes.filter(Boolean) as string[],
    };

    return NextResponse.json(filterOptions);
  } catch (error) {
    console.error("Error fetching filter options:", error);
    return NextResponse.json(
      { error: "Failed to fetch filter options" },
      { status: 500 }
    );
  }
}
