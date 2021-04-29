import { IQueryOptions } from "@lib/repository/query/QueryBuilderTypes";
import { IDataSecurityAuth } from "@lib/security/IConfigSecurityAuth";

export interface IDataRequest {
    session?: IDataSecurityAuth;
    data?: Object;
    condition?: Object;
    options?: IQueryOptions;
}

export interface IDataInfo {
    page: number;
    pageTotal: number;
    count: number;
}

export interface IResultAdapter {
    status: Boolean;
    data?: any;
    dataInfo?: IDataInfo;
    message?: String[];
}
