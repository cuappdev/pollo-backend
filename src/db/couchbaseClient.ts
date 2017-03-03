import * as couchbase from 'couchbase';
import * as Promise from 'bluebird';

class CouchbaseClient {

  // Points to the couchbase cluster
  private cluster: couchbase.Cluster;

  constructor() {
    var db_host: string = process.env['DB_HOST'];
    var db_port: number = process.env['DB_PORT'];
    this.cluster = new couchbase.Cluster(
      'couchbase://' + db_host + ':' + db_port);
  }

  /** Opens a disposable AsyncBucket, on the provided bucketName */
  public openAsyncBucket(bucketName: string): Promise.Disposer<couchbase.AsyncBucket> {
    return new Promise((fulfill, reject) => {
      // Assumes a single password for all buckets in the couchbase cluster.
      var bucket_password: string = 'BUCKET_PASSWORD' in process.env
        ? process.env['BUCKET_PASSWORD'] : '';
      return fulfill(Promise.promisifyAll(
        this.cluster.openBucket(bucketName, bucket_password)
      ) as couchbase.AsyncBucket); // Force BucketAsync type
    }).disposer((bucket: couchbase.AsyncBucket, promise: Promise<any>) => {
      // Ensures that we disconnect from couchbase no matter what happens.
      bucket.disconnect();
    });
  }

  /**
   * Opens a clusterManager on the couchbase cluster, for creating and removing
   * buckets.
   */
  public openAsyncClusterManager(): Promise.Disposer<couchbase.AsyncClusterManager> {
    return new Promise((fulfill, reject) => {
      var db_username = process.env['DB_USERNAME'];
      var db_password = process.env['DB_PASSWORD'];
      return fulfill(Promise.promisifyAll(
        this.cluster.manager(db_username, db_password)
      ) as couchbase.AsyncClusterManager);
    });
  }

}

const couchbaseClient: CouchbaseClient = new CouchbaseClient();
export default couchbaseClient;
