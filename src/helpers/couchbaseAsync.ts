import * as couchbase from 'couchbase';
import * as Promise from 'bluebird';

class CouchbaseAsync {

  // Points to the couchbase cluster
  private cluster: couchbase.Cluster;

  constructor() {
    var db_host: string = process.env['DB_HOST'];
    var db_port: number = process.env['DB_PORT'];
    this.cluster = new couchbase.Cluster(
      'couchbase://' + db_host + ':' + db_port);
  }

  /* Opens a disposable bucket to couchbase as a Promise */
  public openBucketAsync(): Promise.Disposer<couchbase.Bucket> {
    return new Promise((fulfill, reject) => {
      // Open the couchbase bucket. If the bucket has a password then use
      // the password.
      var db_bucket: string = process.env['DB_BUCKET'];
      var db_password: string = 'DB_BUCKET_PASSWORD' in process.env
        ? process.env['DB_BUCKET_PASSWORD'] : '';
      return fulfill(
        Promise.promisifyAll(this.cluster.openBucket(db_bucket, db_password)));
    }).disposer((bucket: any, promise: Promise<any>) => {
      // Ensures that we disconnect from couchbase no matter what happens.
      bucket.disconnect();
    });
  }

}

const couchbaseAsync: CouchbaseAsync = new CouchbaseAsync();
export default couchbaseAsync;
