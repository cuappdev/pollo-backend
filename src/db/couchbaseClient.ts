import * as couchbase from 'couchbase';
import * as Promise from 'bluebird';

import * as constants from '../helpers/constants';

class CouchbaseClient {

  // Points to the couchbase cluster
  private cluster: couchbase.Cluster;

  constructor() {
    let db_host: string = process.env[constants.DB_HOST];
    let db_port: number = process.env[constants.DB_PORT];
    this.cluster = new couchbase.Cluster(
      'couchbase://' + db_host + ':' + db_port + '/');
  }

  /** Opens a disposable AsyncBucket, on the provided bucketName */
  public openAsyncBucket(bucketName: string): Promise.Disposer<couchbase.AsyncBucket> {
    return new Promise(
      (fulfill: (bucket: couchbase.AsyncBucket) => void, reject) => {
        // Assumes a single password for all buckets in the couchbase cluster.
        let bucket_password: string = constants.BUCKET_PASSWORD in process.env
          ? process.env[constants.BUCKET_PASSWORD] : '';
        return fulfill(Promise.promisifyAll(
          this.cluster.openBucket(bucketName, bucket_password)
        ) as couchbase.AsyncBucket); // Force BucketAsync type
      }).disposer((bucket, promise) => {
        // Ensures that we disconnect from couchbase no matter what happens.
        bucket.disconnect();
      });
  }

  /**
   * Opens a clusterManager on the couchbase cluster, for creating and removing
   * buckets.
   */
  public openAsyncClusterManager(): couchbase.AsyncClusterManager {
    let db_username: string = process.env[constants.DB_USERNAME];
    let db_password: string = process.env[constants.DB_PASSWORD];
    return Promise.promisifyAll(
      this.cluster.manager(db_username, db_password)) as couchbase.AsyncClusterManager;
  }

}

export const couchbaseClient = new CouchbaseClient();
