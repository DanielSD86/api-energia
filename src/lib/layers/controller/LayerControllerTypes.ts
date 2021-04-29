export enum RESPONSE_STATUS {
    CREATED = 201,
    OK = 200,
    NO_CONTENT = 204,
    UNMODIFIED = 422,
    ERROR = 500,
    BAD_REQUEST = 400,
}

export enum OPTIONS_REQUEST {
    LIMIT = "limit",
    PAGE = "page",
    ORDERBY = "orderby",
    FORMAT = "format",
    INCLUDE = "include",
}

export const MAX_RECORDS_REQUEST = 100;
export const SESSION = "session";
