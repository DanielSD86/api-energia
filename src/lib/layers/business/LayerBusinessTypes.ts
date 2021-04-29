import { ILayerBusiness } from "./ILayerBusiness";

export enum OPERATION_BUSINESS {
    CREATE,
    UPDATE,
    DELETE,
    DISABLE,
    QUERY,
}

export const OPERATION_CUSTOM = {
    ALL: "ALL",
    ID: "ID",
};

export enum TYPE_ASSOCIATE {
    ONE_TO_MORE,
    ONE_TO_ONE,
    KEY_VALUE,
}

export const ROWS_COUNT_QUERY = "rows_count_query";
export const OPERATION_ASSOCIATE = "operation_associate";

export interface IAssociateBusiness {
    name: string,
    business: ILayerBusiness,
    type: TYPE_ASSOCIATE,
    ignoreFieldsOnValidate: string[],
    source?: string[];
    target?: string[];
}
