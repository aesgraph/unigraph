/**
 * Simple utility to track failed file loads to prevent repeated attempts
 */

// Set of paths that have already failed to load
const failedPaths = new Set<string>();

// Set of paths currently being loaded (to prevent concurrent duplicate requests)
const loadingPaths = new Set<string>();

export const FailedLoadTracker = {
  /**
   * Mark a path as failed
   * @param path The path that failed to load
   */
  markAsFailed: (path: string): void => {
    failedPaths.add(path);
    loadingPaths.delete(path);
  },

  /**
   * Check if a path has previously failed
   * @param path The path to check
   * @returns True if the path has previously failed to load
   */
  hasFailed: (path: string): boolean => {
    return failedPaths.has(path);
  },

  /**
   * Mark a path as currently being loaded
   * @param path The path being loaded
   * @returns True if the path wasn't already being loaded
   */
  markAsLoading: (path: string): boolean => {
    if (loadingPaths.has(path)) {
      return false;
    }
    loadingPaths.add(path);
    return true;
  },

  /**
   * Check if a path is currently being loaded
   * @param path The path to check
   * @returns True if the path is currently being loaded
   */
  isLoading: (path: string): boolean => {
    return loadingPaths.has(path);
  },

  /**
   * Mark a path as finished loading
   * @param path The path that finished loading
   */
  markAsFinished: (path: string): void => {
    loadingPaths.delete(path);
  },

  /**
   * Clear the failed paths record
   * @param path Optional specific path to clear, or all paths if not provided
   */
  clearFailedPaths: (path?: string): void => {
    if (path) {
      failedPaths.delete(path);
    } else {
      failedPaths.clear();
    }
  },
};
