const { MongoClient } = require('mongodb');

const uri = 'mongodb://tharun:X6akpDpbpplogp4kpmlb8345@67.207.160.66:16560/admin';

async function checkWorkspaces() {
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    console.log('Connected to MongoDB successfully!\n');
    
    const db = client.db('cloudfuze');
    const collection = db.collection('MoveWorkSpaces');
    
    // Get all unique processStatus values with counts
    const statusCounts = await collection.aggregate([
      {
        $match: {
          $and: [{ _id: { $exists: true } }]
        }
      },
      {
        $group: {
          _id: "$processStatus",
          totalCount: { $sum: 1 }
        }
      },
      {
        $project: {
          _id: 0,
          processStatus: "$_id",
          totalCount: 1
        }
      },
      { $sort: { totalCount: -1 } }
    ]).toArray();
    
    console.log('=== MoveWorkSpaces Process Status Counts ===');
    console.log(JSON.stringify(statusCounts, null, 2));
    
    // Also check sample document
    const sample = await collection.findOne();
    console.log('\n=== Sample Document Fields ===');
    console.log('Keys:', Object.keys(sample));
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await client.close();
  }
}

checkWorkspaces();
