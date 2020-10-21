
/* STATICS */
export const APP_NAME = 'published-resource-producer';
export const PUBLISHER_URI =`http://data.lblod.info/services/${APP_NAME}`;
export const SHARE_FOLDER = '/share';
export const QUEUE_FOLDER = '/queue';
export const LOG_QUEUE_PROCESS = true;

/* ENVIRONMENT VARIABLES */

export const LOG_INCOMING_DELTA = process.env.LOG_INCOMING_DELTA || false;
export const LOG_DELTA_ENRICH = process.env.LOG_DELTA_ENRICH || false;
export const LOG_OUTGOING_DELTA = process.env.LOG_OUTGOING_DELTA || false;
export const RELATIVE_FILE_PATH = process.env.RELATIVE_FILE_PATH || 'deltas';
export const FILE_GRAPH = process.env.FILE_GRAPH || 'http://mu.semte.ch/graphs/public';