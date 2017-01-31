'use strict';

const Steamer = (() => {
  const DEFAULT_CHUNK_SIZE = 256 * 1024; // 256KB
  const DEFAULT_TTL = 60 * 60 * 24 * 7; // 1 week in seconds. 60s*60m*24h*7d

  const DB_NAME = 'steamer';
  const DB_VERSION = 1;
  const DB_UPLOADS_OBJECT_STORE = 'uploads';

  /**
   * Database states.
   */
  const IDLE = 0;
  const INITIALIZING = 1;
  const READY = 2;

  let dbState = IDLE;

  /**
   * Database instance.
   */
  let db = null;

  const Deferred = function Deferred() {
    this.promise = new Promise((resolve, reject) => {
      this.resolve = resolve;
      this.reject = reject;
    });

    return this;
  };

  const createInitialSchema = model => {
    // The object store hosting uploads metadata will contain entries like:
    // { filename: <String> (primary key),
    //   sessionId: <String>,
    //   ttl: <Date>,
    //   bytesSent: <Number>
    // }
    model.createObjectStore(DB_UPLOADS_OBJECT_STORE, { keyPath: 'filename' });
  };

  /**
   * Prepare the database. This may include opening the database and upgrading
   * it to the latest schema version.
   *
   * @return {Promise(object)} - Returns a Promise that resolves with a database
   *                             instance ready to use.
   */
  const ensureDB = () => {
    if (db) {
      return Promise.resolve(db);
    }

    let deferred = new Deferred();
    deferreds.push(deferred);

    if (dbState === INITIALIZING) {
      return deferred.promise;
    }

    dbState = INITIALIZING;

    const indexedDB = typeof window == 'object' ?
                      (window.indexedDB || window.webkitIndexedDB ||
                       window.mozIndexedDB || window.msIndexedDB) :
                      (indexedDB || webkitIndexedDB ||
                       mozIndexedDB || msIndexedDB);
    if (!indexedDB) {
      return Promise.reject('No IndexedDB available');
    }

    new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      request.onsuccess = event => {
        db = event.target.result;
        resolve(db);
      };
      request.onerror = event => {
        reject(`Error openning database ${event.target.errorCode}`);
      };
      request.onblocked = () => {
        reject(`Database is blocked`);
      };
      request.onupgradeneeded = event => {
        // For now, just create initial schema. If we change the db version,
        // we'll need to implement the upgrade path here.
        createInitialSchema(event.target.result);
      };
    }).then(db => {
      while (deferreds.length) {
        deferreds.pop().resolve(db);
      }
      dbState = READY;
    }).catch(error => {
      while (deferreds.length) {
        deferreds.pop().reject(error);
      }
    });
  };

  class Steamer {
    /**
     * Create a Steamer instance.
     *
     * @constructs Steamer
     *
     * @param {string} aFileName - Local path to the file to be uploaded.
     * @param {object} aCallbacks - Callbacks map.
     * @param {object} aConfig - Object containing config options such as:
     *                           + chunkSize - Number of bytes for each file
     *                                         chunk.
     *                           + ttl - Upload's time to live. When expired,
     *                                   the upload will be removed from the
     *                                   local db.
     * @param {object} aMetadata - Object containing meta information about the
     *                             upload.
     */
    constructor(aFilename, aCallbacks, aConfig, aMetadata) {
      if (!aFilename) {
        throw new Error('Missing mandatory file name');
      }

      if (!aCallbacks) {
        throw new Error('Missing mandatory callbacks');
      }

      this.filename = aFilename;
      this.config = Object.assign({
        chunkSize: DEFAULT_CHUNK_SIZE,
        ttl: DEFAULT_TTL
      }, aConfig);

      this.metadata = aMetadata;
      this.callbacks = aCallbacks;

      ensureDB().then(model => {
        // XXX check if resumable -> trigger onready callback.
      });
    }

    finish() {
    }

    next() {
    }
  };

  return Steamer;
})();

export default Steamer;
