import * as couchbase from 'couchbase';
import * as Promise from 'bluebird';
import * as util from 'util';

import * as constants from '../helpers/constants';

class CouchbaseClient {

  // For singleton pattern
  private static _instance: CouchbaseClient;

  public static get getInstance() {
    return this._instance || (this._instance = new this());
  }

  private constructor() {
  }

  private getCluster(): couchbase.Cluster {
    let db_host: string = process.env[constants.DB_HOST];
    return new couchbase.Cluster(util.format('couchbase://%s/', db_host));
  }

  private getManagementCluster() {
    let db_host: string = process.env[constants.DB_HOST];
    return new couchbase.Cluster(util.format('couchbase://%s/', db_host));
  }

  /** Opens a disposable AsyncBucket, on the provided bucketName */
  public openAsyncBucket(bucketName: string): Promise.Disposer<couchbase.AsyncBucket> {
    // Assumes a single password for all buckets in the couchbase cluster.
    let bucket_password: string = constants.BUCKET_PASSWORD in process.env
      ? process.env[constants.BUCKET_PASSWORD] : '';
    return Promise.resolve(
      Promise.promisifyAll(this.getCluster().openBucket(
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
      Promise.promisifyAll(this.getManagementCluster().manager(
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
      Promise.promisifyAll(this.getManagementCluster().openBucket(
        bucketName, bucketPassword).manager()) as couchbase.AsyncBucketManager
    ).disposer((manager, promise) => {
      // To access private variables
      (manager as any)._bucket.disconnect();
    })
  }

}

export const couchbaseClient = CouchbaseClient.getInstance;
