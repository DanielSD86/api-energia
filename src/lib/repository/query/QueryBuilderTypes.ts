import { IEntity } from "@lib/entity/IEntity";
import { TYPE_FORMAT } from "@lib/repository/IOptionsQuery";

export enum AGGREGATE {
    SUM = "SUM",
    MIN = "MIN",
    MAX = "MAX",
    AVG = "AVG",
    COUNT = "COUNT",
}

export enum SYMBOL_COMPARE {
    EQUAL = "=",
    NOT_EQUAL = "<>",
    MORE = ">",
    MORE_EQUAL = ">=",
    LESS = "<",
    LESS_EQUAL = "<=",
    IN = "IN",
    NOT_IN = "NOT IN",
    LIKE = "LIKE",
    NOT_LIKE = "NOT LIKE",
    IS = "IS",
    NOT_IS = "NOT IS",
}

export enum TYPE_TABLE {
    FROM = "FROM",
    INNER_JOIN = "INNER JOIN",
    LEFT_JOIN = "LEFT JOIN",
    RIGHT_JOIN = "RIGHT JOIN",
    CROSS_JOIN = "CROSS JOIN",
}

export enum TYPE_ORDER {
    DESC = "DESC",
    ASC = "ASC",
}

export interface ISql {
    sql: string;
    values?: any[];
}

export interface IQueryFieldSql {
    name: string;
    symbol: SYMBOL_COMPARE;
}

export interface IQueryEntity {
    entity: IEntity;
    alias: string;
    type?: TYPE_TABLE;
}

export interface IQueryFieldBasic {
    alias: string;
    aliasField?: string;
    name: string;
}

export interface IQueryField extends IQueryFieldBasic {    
    coalesceValueSql?: IQueryFieldBasic;
    coalesceValue?: any;
    aggregate?: AGGREGATE;
}

export interface IQueryCondition extends IQueryField {    
    symbol: SYMBOL_COMPARE;
    value?: any;
    valueSql?: IQueryField;
}

export interface IQueryFieldOrder extends IQueryField {    
    order: TYPE_ORDER;
}

export interface IQueryOptions {
    limit?: number;
    page?: number;
    orderBy?: string[];
    orderByDesc?: string[];
    format?: TYPE_FORMAT;
    includes?: string[];
}
