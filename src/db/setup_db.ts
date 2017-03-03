/**
 * A standalone script for configuring the local couchbase database.
 */

// Read .env file
import * as dotenv from 'dotenv';
dotenv.config();

import {AsyncClusterManager} from 'couchbase'
import {couchbaseClient} from './couchbaseClient';
import * as Promise from 'bluebird';

// The couchbase buckets that we're setting up.
let bucket_names = ['users', 'classes'];
// How we want to setup these buckets.
let bucket_options = {
  bucketType: 'couchbase',
  ramQuotaMB: 100,
  replicaNumber: 1,
  saslPassword: 'BUCKET_PASSWORD' in process.env ? process.env['BUCKET_PASSWORD'] : '',
};

let main = (): void => {
  let clusterManager = couchbaseClient.openAsyncClusterManager()
  clusterManager.listBucketsAsync().then((rows) => {
    // Delete existing buckets.
    console.log('Deleting existing buckets...');
    return Promise.each(rows, (row) => {
      return clusterManager.removeBucketAsync(row.name);
    });
  }).then(() => {
    console.log('Adding clicker buckets...');
    Promise.each(bucket_names, (name) => {
      return clusterManager.createBucketAsync(name, bucket_options);
    });
  }).then(() => {
    console.log('Setup completed, buckets successfully created');
  }).done();
}

// Runs the main function only on invocation, not import.
if (require.main === module) {
    main();
}
