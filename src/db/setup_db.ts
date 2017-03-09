/**
 * A standalone script for configuring the local couchbase database.
 */

// Read .env file
import * as dotenv from 'dotenv';
dotenv.config();

import {CreateBucketOptions, AsyncClusterManager} from 'couchbase';
import * as Promise from 'bluebird';
import * as util from 'util';

import {couchbaseClient} from './couchbaseClient';
import * as constants from '../helpers/constants';

// How we want to setup these buckets.
let bucket_options = {
  bucketType: 'couchbase',
  ramQuotaMB: 100,
  replicaNumber: 0,
  saslPassword: constants.BUCKET_PASSWORD in process.env
    ? process.env[constants.BUCKET_PASSWORD] : '',
} as CreateBucketOptions;

/**
 * Deletes buckets that already exist in the cluster.
 * @param clusterManager
 * @return AsyncClusterManager
 */
let deleteExistingBuckets = (
  clusterManager: AsyncClusterManager): Promise<any> => {
  return clusterManager.listBucketsAsync().then((rows) => {
    // Delete existing buckets.
    console.log('Deleting existing buckets...');
    return Promise.each(rows, (row) => {
      return clusterManager.removeBucketAsync(row.name);
    });
  });
}

/**
 * Create clicker buckets.
 * @param clusterManager
 * @return AsyncClusterManager
 */
let createClickerBuckets = (
  clusterManager: AsyncClusterManager): Promise<any> => {
  console.log('Adding clicker buckets...');
  return Promise.each(constants.BUCKETS, (name) => {
    console.log(util.format("  Adding bucket %s", name))
    return clusterManager.createBucketAsync(name, bucket_options);
  });
}

let createIndexes = (): Promise<any> => {
  console.log('Adding primary key index to each bucket');
  return Promise.each(constants.BUCKETS, (name) => {
    console.log(util.format("  Adding primary key to bucket %s", name))
    let creationDelay = 1000;
    let loopCreateIndex = () => {
      // Keep attempting to create an index w/ an exponential delay.
      return Promise.delay(creationDelay *= 2).then(() => {
        return Promise.using(couchbaseClient.openAsyncBucketManager(name), (manager) => {
          return manager.createPrimaryIndexAsync()
          // Repeat index creation recursively if we get an error.
          .error(loopCreateIndex);
        });
      });
    };
    return loopCreateIndex();
  });
}

let main = (): void => {
  Promise.using(couchbaseClient.openAsyncClusterManager(), (clusterManager) => {
    return deleteExistingBuckets(clusterManager)
      .then(() => createClickerBuckets(clusterManager));
  }).then(createIndexes).then(() => {
    return console.log('Setup completed, buckets successfully created');
  }).done();
}

// Runs the main function only on invocation, not import.
if (require.main === module) {
  main();
}
