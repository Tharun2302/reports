const { MongoClient } = require('mongodb');

const uri = 'mongodb://tharun:X6akpDpbpplogp4kpmlb8345@67.207.160.66:16560/admin';

async function checkDataSize() {
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    console.log('Connected to MongoDB successfully!\n');
    
    const db = client.db('cloudfuze');
    const collection = db.collection('MoveWorkSpaces');
    
    // Run the Metabase query
    const result = await collection.aggregate([
      {
        $match: {
          $and: [
            { _id: { $exists: true } }
          ]
        }
      },
      {
        $group: {
          _id: "$processStatus",
          totalFileSize: {
            $sum: { $ifNull: ["$dataSize", 0] }
          }
        }
      },
      {
        $project: {
          _id: 0,
          processStatus: "$_id",
          totalFileSize: 1
        }
      },
      {
        $sort: { totalFileSize: -1 }
      }
    ]).toArray();
    
    console.log('=== Migrated Data Size by Status ===');
    result.forEach(item => {
      const sizeInGB = item.totalFileSize / (1024 * 1024 * 1024);
      console.log(`${item.processStatus}: ${item.totalFileSize} bytes (${sizeInGB.toFixed(2)} GB)`);
    });
    
    console.log('\n=== Raw Result ===');
    console.log(JSON.stringify(result, null, 2));
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await client.close();
  }
}

checkDataSize();
