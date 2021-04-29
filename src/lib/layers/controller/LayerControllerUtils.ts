import { TYPE_FORMAT, } from "@lib/repository/IOptionsQuery";
import { IQueryOptions } from "@lib/repository/query/QueryBuilderTypes";
import { IDataSecurityAuth, LOGIN, PASSWORD } from "@lib/security/IConfigSecurityAuth";
import { Request } from "express";
import { MAX_RECORDS_REQUEST, OPTIONS_REQUEST, SESSION } from "./LayerControllerTypes";

export class LayerControllerUtils {
    static async getData(request: Request): Promise<Object> {
        return request.body;
    }

    static async getCondition(request: Request): Promise<Object> {
        const condition = {};

        for (let propName in request.params) {
            condition[propName] = request.params[propName];
        }

        for (let propName in request.query) {
            if (OPTIONS_REQUEST[propName.toUpperCase()]) continue;
            
            condition[propName] = request.query[propName];
        }

        return condition;
    }

    static async getSession(request: Request): Promise<IDataSecurityAuth> {
        const session = ( request[SESSION] || {} );

        // Outros dados que podem vir na sessão
        if (request.headers[LOGIN]) session.login = request.headers[LOGIN];
        if (request.headers[PASSWORD]) session.senha = request.headers[PASSWORD];

        return session;
    }

    static async getOptions(request: Request, isForceMaxRecorsRequest: boolean): Promise<IQueryOptions> {
        let result: IQueryOptions = {
            format: TYPE_FORMAT.JSON,
            includes: [],
            orderBy: [],
            orderByDesc: [],
            limit: 0,
            page: 0,
        };

        for (let propName in request.query) {
            if (OPTIONS_REQUEST[propName] > 0) continue;
            const value = request.query[propName];

            switch (OPTIONS_REQUEST[propName.toUpperCase()]) {
                case OPTIONS_REQUEST.FORMAT:
                    result.format = TYPE_FORMAT[String(value)];
                    break;
                case OPTIONS_REQUEST.ORDERBY:
                    const splitOrder = String(value).split(",");
                    for (const idx in splitOrder) {
                        if (String(splitOrder[idx]).endsWith("-desc")) {                           
                            result.orderBy.push(
                                String(splitOrder[idx]).split("-")[0]
                            );
                            result.orderByDesc.push(
                                String(splitOrder[idx]).split("-")[0]
                            );
                        } else if (String(splitOrder[idx]).endsWith("-asc")) {
                            result.orderBy.push(
                                String(splitOrder[idx]).split("-")[0]
                            );
                        } else {
                            result.orderBy.push(splitOrder[idx]);
                        }
                    }
                    break;
                case OPTIONS_REQUEST.INCLUDE:
                    result.includes = String(value).split(",");
                    break;
                default:
                    result[propName] = parseInt(String(value));
            }
        }

        if (isForceMaxRecorsRequest) {
            if (!result.limit || result.limit === 0 || result.limit > MAX_RECORDS_REQUEST) {
                result.limit = MAX_RECORDS_REQUEST;
            }
        }

        return result;
    }
}
