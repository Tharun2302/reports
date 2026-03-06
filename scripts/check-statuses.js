const { MongoClient } = require('mongodb');

const uri = 'mongodb://tharun:X6akpDpbpplogp4kpmlb8345@67.207.160.66:16560/admin';

async function checkStatuses() {
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    console.log('Connected to MongoDB successfully!\n');
    
    const db = client.db('cloudfuze');
    const collection = db.collection('MoveJobDetails');
    
    // Get all unique job statuses with counts
    const statusCounts = await collection.aggregate([
      {
        $group: {
          _id: "$jobStatus",
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]).toArray();
    
    console.log('=== Job Status Counts ===');
    statusCounts.forEach(s => console.log(`${s._id}: ${s.count}`));
    
    // Get all unique job types
    const jobTypes = await collection.aggregate([
      {
        $group: {
          _id: "$jobType",
          count: { $sum: 1 }
        }
      }
    ]).toArray();
    
    console.log('\n=== Job Type Counts ===');
    jobTypes.forEach(j => console.log(`${j._id}: ${j.count}`));
    
    // Get all unique fromCloudName
    const fromClouds = await collection.aggregate([
      {
        $group: {
          _id: "$fromCloudName",
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]).toArray();
    
    console.log('\n=== From Cloud Names ===');
    fromClouds.forEach(c => console.log(`${c._id}: ${c.count}`));
    
    // Get all unique toCloudName
    const toClouds = await collection.aggregate([
      {
        $group: {
          _id: "$toCloudName",
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]).toArray();
    
    console.log('\n=== To Cloud Names ===');
    toClouds.forEach(c => console.log(`${c._id}: ${c.count}`));
    
    // Get total count
    const totalCount = await collection.countDocuments();
    console.log(`\n=== Total Jobs: ${totalCount} ===`);
    
    // Test the exact query from Metabase (without filters)
    const result = await collection.aggregate([
      {
        "$match": {
          "$and": [
            { "_id": { "$exists": true } }
          ]
        }
      },
      {
        "$group": {
          "_id": "$jobStatus",
          "totalCount": { "$sum": 1 }
        }
      },
      {
        "$project": {
          "_id": 0,
          "jobStatus": "$_id",
          "totalCount": 1
        }
      },
      {
        "$sort": {
          "totalCount": -1
        }
      }
    ]).toArray();
    
    console.log('\n=== Metabase Query Result ===');
    console.log(JSON.stringify(result, null, 2));
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await client.close();
  }
}

checkStatuses();
