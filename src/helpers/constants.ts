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
export const USERS_BUCKET = 'users';
export const CLASSES_BUCKET = 'classes';
export const QUESTIONS_BUCKETS = 'questions';
export const BUCKETS = [USERS_BUCKET, CLASSES_BUCKET, QUESTIONS_BUCKETS];

// For google auth.
export const GOOGLE_CLIENT_ID = 'GOOGLE_CLIENT_ID';


// Common error messages
export const MALFORMED_MESSAGE = "Malformed message received";
export const UNAUTHORIZED_MESSAGE = "Unauthorized request received";

// Keys for tables
export const USERS_BUCKET_KEY = 'netid:%s';
export const CLASSES_BUCKET_KEY = 'courseId:%s';

// Keys for counters
export const COURSE_ID_COUNTER = "courseIdCounter"
export const LECTURE_ID_COUNTER = "courseId%s:lectureIdCounter"
