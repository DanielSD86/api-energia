export enum TYPE_LOG {
    SQL = "SQL",
    MAIL = "MAIL",
    API = "API",
    IO = "IO"
}

export interface ILogs {
    error(error: Error): Promise<void>;
    warning(message: string): Promise<void>;
}