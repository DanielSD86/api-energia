import { IEntity } from "@lib/entity/IEntity";
import { ISql } from "./QueryBuilderTypes";

export interface IDmlBuilder {
    getSqlInsert(entity: IEntity, data: object): ISql;
    getSqlInserts(entity: IEntity, data: object[]): ISql;
    getSqlUpdate(entity: IEntity, data: object, where: object): ISql;
    getSqlDelete(entity: IEntity, where: object): ISql;
}