const { ChronicleSession } = require('../../node_modules/appdev/build/bundle');

const chroniclePollo = new ChronicleSession(
    process.env.CHRONICLE_ACCESS_KEY,
    process.env.CHRONICLE_SECRET_KEY,
    'Pollo',
);

const errorType = {
    date: { type: 'INT64' },
    message: { type: 'UTF8' },
    stackTrace: { type: 'UTF8' },
};

/**
 * Get stack trace at this location
 * @returns {string} The stack trace
 */
function getStackTrace(): string {
    return Error().stack || (() => {
        const obj = {};
        Error.captureStackTrace(obj, getStackTrace);
        return obj.stack;
    });
}

/**
 * Log error to Chronicle if production
 * @param {string} msg The error message
 */
function logError(msg: string) {
    const st = getStackTrace();
    const env = process.env.NODE_ENV || 'development';

    if (env === 'production') {
        const log = {
            date: Date.now(),
            message: msg,
            stackTrace: st,
        };
        chroniclePollo.log('error', errorType, log);
    }

    return new Error(msg);
}

export default {
    logError,
};
