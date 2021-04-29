export enum LEVEL_LOG_DB {
    NONE = "NONE",
    DML = "DML",
    ANALYTIC = "ANALYTIC",
}

export default interface IConfigRepository {
    connectionString: string;
    applicationName?: string;
    levelLog?: LEVEL_LOG_DB;
    tenant?: string;
}
