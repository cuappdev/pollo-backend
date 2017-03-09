import * as couchbase from 'couchbase';
import * as Promise from 'bluebird';
import * as util from 'util';

import * as constants from '../helpers/constants';

class CouchbaseClient {

  // Points to the couchbase cluster.
  private cluster: couchbase.Cluster;
  // For cluster management.
  private managementCluster: couchbase.Cluster;

  constructor() {
    let db_host: string = process.env[constants.DB_HOST];
    this.cluster = new couchbase.Cluster(util.format('memcached://%s/', db_host));
    this.managementCluster = new couchbase.Cluster(util.format('couchbase://%s/', db_host));
  }

  /** Opens a disposable AsyncBucket, on the provided bucketName */
  public openAsyncBucket(bucketName: string): Promise.Disposer<couchbase.AsyncBucket> {
    // Assumes a single password for all buckets in the couchbase cluster.
    let bucket_password: string = constants.BUCKET_PASSWORD in process.env
      ? process.env[constants.BUCKET_PASSWORD] : '';
    return Promise.resolve(
      Promise.promisifyAll(this.cluster.openBucket(
        bucketName, bucket_password)) as couchbase.AsyncBucket
    ).disposer((bucket, promise) => {
      // Ensures that we disconnect from couchbase no matter what happens.
      bucket.disconnect();
    });
  }

  /**
   * Opens a clusterManager on the couchbase cluster, for creating and removing
   * buckets.
   */
  public openAsyncClusterManager(): Promise.Disposer<couchbase.AsyncClusterManager> {
    let db_username: string = process.env[constants.DB_USERNAME];
    let db_password: string = process.env[constants.DB_PASSWORD];
    return Promise.resolve(
      Promise.promisifyAll(this.cluster.manager(
        db_username, db_password)) as couchbase.AsyncClusterManager
    ).disposer((manager, promise) => { /* No disposing needed for Cluster Manager */ });
  }

  /**
   * Opens an AsyncBucketManager on the provided bucket name, used for creating
   * indexes & views.
   */
  public openAsyncBucketManager(bucketName: string): Promise.Disposer<couchbase.AsyncBucketManager> {
    let bucketPassword: string = constants.BUCKET_PASSWORD in process.env
      ? process.env[constants.BUCKET_PASSWORD] : '';
    return Promise.resolve(
      Promise.promisifyAll(this.managementCluster.openBucket(
        bucketName, bucketPassword).manager()) as couchbase.AsyncBucketManager
    ).disposer((manager, promise) => {
      // To access private variables
      (manager as any)._bucket.disconnect();
    })
  }

}

export const couchbaseClient = new CouchbaseClient();
