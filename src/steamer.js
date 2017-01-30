'use strict';

const DEFAULT_CHUNK_SIZE = 256 * 1024; // 256KB
const DEFAULT_TTL = 60 * 60 * 24 * 7; // 1 week in seconds. 60s x 60m x 24h x 7d

class Steamer {
  /**
   * Create a Steamer instance.
   *
   * @constructs Steamer
   *
   * @param {object} aCallbacks - Callbacks map.
   * @param {string} aFileName - Local path to the file to be uploaded.
   * @param {object} aConfig - Object containing configuration options such as:
   *                           + chunkSize - Number of bytes for each file
   *                                         chunk.
   *                           + ttl - Upload's time to live. When expired, the
   *                                   upload will be removed from the local db.
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
  }
};

export default Steamer;
