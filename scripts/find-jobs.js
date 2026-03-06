const { MongoClient } = require('mongodb');

const uri = 'mongodb://tharun:X6akpDpbpplogp4kpmlb8345@67.207.160.66:16560/admin';

async function findJobsCollection() {
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    console.log('Connected to MongoDB successfully!\n');
    
    const db = client.db('cloudfuze');
    
    // Check collections that likely contain job data
    const collectionsToCheck = [
      'MoveJobDetails',
      'MoveWorkSpaces', 
      'MoveWorkSpaceStatus',
      'AgentWorkSpaceStatus',
      'WorkSpaceReport',
      'DeltaScheduler',
      'Scheduler'
    ];
    
    for (const colName of collectionsToCheck) {
      console.log(`\n=== Checking ${colName} ===`);
      const collection = db.collection(colName);
      const count = await collection.countDocuments();
      console.log(`Document count: ${count}`);
      
      if (count > 0) {
        const sample = await collection.findOne();
        console.log('Fields:', Object.keys(sample));
        
        // Check if it has JobStatus field
        if (sample.JobStatus || sample.jobStatus || sample.status) {
          console.log('*** HAS STATUS FIELD ***');
          console.log('Sample:', JSON.stringify(sample, null, 2).substring(0, 3000));
        }
        
        // Check for jobType
        if (sample.jobType || sample.JobType) {
          console.log('*** HAS JOB TYPE FIELD ***');
        }
        
        // Check for cloud names
        if (sample.fromCloudName || sample.toCloudName) {
          console.log('*** HAS CLOUD NAME FIELDS ***');
        }
      }
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await client.close();
  }
}

findJobsCollection();
