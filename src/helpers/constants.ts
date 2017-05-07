/**
 * Declare any string constants used throughout the project.
 */

// For connecting to the database.
export const DB_HOST = 'DB_HOST';
export const DB_PORT = 'DB_PORT';
export const DB_USERNAME = 'DB_USERNAME';
export const DB_PASSWORD = 'DB_PASSWORD';
export const BUCKET_PASSWORD = 'BUCKET_PASSWORD';

// Relevant buckets.
export const CLICKER_BUCKET = 'clicker';
export const BUCKETS = [CLICKER_BUCKET];

// Simple auth.
export const SIMPLE_AUTHS = "SIMPLE_AUTHS";

// For google auth.
export const GOOGLE_CLIENT_IDS = 'GOOGLE_CLIENT_IDS';


// Common error messages
export const MALFORMED_MESSAGE = "Malformed message received";
export const UNAUTHORIZED_MESSAGE = "Unauthorized request received";

// Keys for different schema objects
export const USERS_BUCKET_KEY = '%s:netid';
export const CLASSES_BUCKET_KEY = '%s:courseId';
export const QUESTION_BUCKET_KEY = '%s:questionId';

// Keys for counters
export const COURSE_ID_COUNTER = "courseIdCounter";
export const LECTURE_ID_COUNTER = "%s:course:lectureIdCounter";
export const QUESTION_ID_COUNTER = "questionIdCounter"

// Passport strategies
export const GOOGLE_STRATEGY = "google-strategy";
export const SIMPLE_STRATEGY = "simple-strategy";
