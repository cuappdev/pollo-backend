/* Declares any additional type definitions for the project */
import * as couchbase from 'couchbase';
import * as Promise from 'bluebird';

declare module 'couchbase' {

  /*
   * Declares all **Async methods that result from invoking PromisifyAll on a
   * couchbase.Bucket object.
   */
  export interface AsyncBucket extends Bucket {
    /**
     * Similar to Bucket#upsert, but instead of setting a new key, it appends data to the existing key. Note that this function only makes sense when the stored data is a string; 'appending' to a JSON document may result in parse errors when the document is later retrieved.
     * @param key The target document key.
     * @param fragment The document's contents to append.
     */
    appendAsync(key: any | Buffer, fragment: any): Promise<Bucket.OpCallback>;

    /**
     *
     * @param key The target document key.
     * @param fragment The document's contents to append.
     * @param options The options object.
     */
    appendAsync(key: any | Buffer, fragment: any, options: AppendOptions): Promise<Bucket.OpCallback>;

    /**
     * Increments or decrements a key's numeric value.
     * Note that JavaScript does not support 64-bit integers (while libcouchbase and the server do). You might receive an inaccurate value if the number is greater than 53-bits (JavaScript's maximum integer precision).
     * @param key The target document key.
     * @param delta The amount to add or subtract from the counter value. This value may be any non-zero integer.
     */
    counterAsync(key: any | Buffer, delta: number): Promise<Bucket.OpCallback>;

    /**
     *
     * @param key The target document key.
     * @param delta The amount to add or subtract from the counter value. This value may be any non-zero integer.
     * @param options The options object.
     */
    counterAsync(key: any | Buffer, delta: number, options: CounterOptions): Promise<Bucket.OpCallback>;

    /**
     * Retrieves a document.
     * @param key The target document key.
     */
    getAsync(key: any | Buffer): Promise<Bucket.OpCallback>;

    /**
     * @param key The target document key.
     * @param options The options object.
     */
    getAsync(key: any | Buffer, options: any): Promise<Bucket.OpCallback>;

    /**
     * Lock the document on the server and retrieve it. When an document is locked, its CAS changes and subsequent operations on the document (without providing the current CAS) will fail until the lock is no longer held.
     * This function behaves identically to Bucket#get in that it will return the value. It differs in that the document is also locked. This ensures that attempts by other client instances to access this document while the lock is held will fail.
     * Once locked, a document can be unlocked either by explicitly calling Bucket#unlock or by performing a storage operation (e.g. Bucket#upsert, Bucket#replace, Bucket::append) with the current CAS value. Note that any other lock operations on this key will fail while a document is locked.
     * @param key The target document key.
     */
    getAndLockAsync(key: any): Promise<Bucket.OpCallback>;

    /**
     * Lock the document on the server and retrieve it. When an document is locked, its CAS changes and subsequent operations on the document (without providing the current CAS) will fail until the lock is no longer held.
     * This function behaves identically to Bucket#get in that it will return the value. It differs in that the document is also locked. This ensures that attempts by other client instances to access this document while the lock is held will fail.
     * Once locked, a document can be unlocked either by explicitly calling Bucket#unlock or by performing a storage operation (e.g. Bucket#upsert, Bucket#replace, Bucket::append) with the current CAS value. Note that any other lock operations on this key will fail while a document is locked.
     * @param key The target document key.
     * @param options The options object.
     */
    getAndLockAsync(key: any, options: GetAndLockOptions): Promise<Bucket.OpCallback>;

    /**
     * Retrieves a document and updates the expiry of the item at the same time.
     * @param key The target document key.
     * @param expiry The expiration time to use. If a value of 0 is provided, then the current expiration time is cleared and the key is set to never expire. Otherwise, the key is updated to expire in the time provided (in seconds).
     * @param options The options object.
     */
    getAndTouchAsync(key: any | Buffer, expiry: number, options: any): Promise<Bucket.OpCallback>;

    /**
     * Retrieves a document and updates the expiry of the item at the same time.
     * @param key The target document key.
     * @param expiry The expiration time to use. If a value of 0 is provided, then the current expiration time is cleared and the key is set to never expire. Otherwise, the key is updated to expire in the time provided (in seconds).
     */
    getAndTouchAsync(key: any | Buffer, expiry: number): Promise<Bucket.OpCallback>;

    /**
     * Retrieves a list of keys
     * @param keys The target document keys.
     */
    getMultiAsync(key: any[] | Buffer[]): Promise<Bucket.MultiGetCallback>;

    /**
     * Get a document from a replica server in your cluster.
     * @param key The target document key.
     */
    getReplicaAsync(key: any | Buffer): Promise<Bucket.OpCallback>;

    /**
    * Get a document from a replica server in your cluster.
    * @param key The target document key.
    * @param options The options object.
    */
    getReplicaAsync(key: any | Buffer, options: GetReplicaOptions): Promise<Bucket.OpCallback>;

    /**
     * Identical to Bucket#upsert but will fail if the document already exists.
     * @param key The target document key.
     * @param value The document's contents.
     */
    insertAsync(key: any | Buffer, value: any): Promise<Bucket.OpCallback>;

    /**
     * Identical to Bucket#upsert but will fail if the document already exists.
     * @param key The target document key.
     * @param value The document's contents.
     * @param options The options object.
     */
    insertAsync(key: any | Buffer, value: any, options: InsertOptions): Promise<Bucket.OpCallback>;

    /**
     * Like Bucket#append, but prepends data to the existing value.
     * @param key The target document key.
     * @param fragment The document's contents to prepend.
     */
    prependAsync(key: any, fragment: any): Promise<Bucket.OpCallback>;

    /**
     * Like Bucket#append, but prepends data to the existing value.
     * @param key The target document key.
     * @param fragment The document's contents to prepend.
     * @param options The options object.
     */
    prependAsync(key: any, fragment: any, options: PrependOptions): Promise<Bucket.OpCallback>;

    /**
     * Executes a previously prepared query object. This could be a ViewQuery or a N1qlQuery.
     * Note: N1qlQuery queries are currently an uncommitted interface and may be subject to change in 2.0.0's final release.
     * @param query The query to execute.
     */
    queryAsync(query: ViewQuery | N1qlQuery): Promise<Bucket.QueryCallback>;

    /**
     * Executes a previously prepared query object. This could be a ViewQuery or a N1qlQuery.
     * Note: N1qlQuery queries are currently an uncommitted interface and may be subject to change in 2.0.0's final release.
     * @param query The query to execute.
     * @param params A list or map to do replacements on a N1QL query.
     */
    queryAsync(query: ViewQuery | N1qlQuery, params: Object | Array<any>): Promise<Bucket.QueryCallback>;

    /**
     * Deletes a document on the server.
     * @param key The target document key.
     */
    removeAsync(key: any | Buffer): Promise<Bucket.OpCallback>;

    /**
     * Deletes a document on the server.
     * @param key The target document key.
     * @param options The options object.
     */
    removeAsync(key: any | Buffer, options: RemoveOptions): Promise<Bucket.OpCallback>;

    /**
     * Identical to Bucket#upsert, but will only succeed if the document exists already (i.e. the inverse of Bucket#insert).
     * @param key The target document key.
     * @param value The document's contents.
     */
    replaceAsync(key: any | Buffer, value: any): Promise<Bucket.OpCallback>;

    /**
     * Identical to Bucket#upsert, but will only succeed if the document exists already (i.e. the inverse of Bucket#insert).
     * @param key The target document key.
     * @param value The document's contents.
     * @param options The options object.
     */
    replaceAsync(key: any | Buffer, value: any, options: ReplaceOptions): Promise<Bucket.OpCallback>;

    /**
     * Update the document expiration time.
     * @param key The target document key.
     * @param expiry The expiration time to use. If a value of 0 is provided, then the current expiration time is cleared and the key is set to never expire. Otherwise, the key is updated to expire in the time provided (in seconds). Values larger than 302460*60 seconds (30 days) are interpreted as absolute times (from the epoch).
     * @param options The options object.
     */
    touchAsync(key: any | Buffer, expiry: number, options: TouchOptions): Promise<Bucket.OpCallback>;

    /**
     * Unlock a previously locked document on the server. See the Bucket#lock method for more details on locking.
     * @param key The target document key.
     * @param cas The CAS value returned when the key was locked. This operation will fail if the CAS value provided does not match that which was the result of the original lock operation.
     */
    unlockAsync(key: any | Buffer, cas: Bucket.CAS): Promise<Bucket.OpCallback>;

    /**
     * Unlock a previously locked document on the server. See the Bucket#lock method for more details on locking.
     * @param key The target document key.
     * @param cas The CAS value returned when the key was locked. This operation will fail if the CAS value provided does not match that which was the result of the original lock operation.
     * @param options The options object.
     */
    unlockAsync(key: any | Buffer, cas: Bucket.CAS, options: any): Promise<Bucket.OpCallback>;

    /**
     * Stores a document to the bucket.
     * @param key The target document key.
     * @param value The document's contents.
     */
    upsertAsync(key: any | Buffer, value: any): Promise<Bucket.OpCallback>;

    /**
     * Stores a document to the bucket.
     * @param key The target document key.
     * @param value The document's contents.
     * @param options The options object.
     */
    upsertAsync(key: any | Buffer, value: any, options: UpsertOptions): Promise<Bucket.OpCallback>;

  }

  export interface AsyncClusterManager extends ClusterManager {

    /**
     * @param name
     */
    createBucketAsync(name: string): Promise<Function>;

    /**
     * @param name
     * @param opts
     */
    createBucketAsync(name: string, opts: any): Promise<Function>;

    listBucketsAsync(): Promise<Function>;

    /**
     * @param name
     */
    removeBucketAsync(name: string): Promise<Function>;

  }

}
