import { IEntity } from "@lib/entity/IEntity";
import { IQueryCondition, IQueryEntity, ISql, TYPE_TABLE } from "./QueryBuilderTypes";

export interface IWhereBuilder {
    conditions: IQueryCondition[];
    entities: IQueryEntity[];

    getSql(paramsCount: number, alias?: string): ISql;

    addEntity(entity: IEntity, alias: string, type: TYPE_TABLE): IWhereBuilder;

    add(alias: string, field: string, value: any): IWhereBuilder;
    addNotEqual(alias: string, field: string, value: any): IWhereBuilder;
    
    addLike(alias: string, field: string, value: string): IWhereBuilder;
    addNotLike(alias: string, field: string, value: string): IWhereBuilder;

    addIn(alias: string, field: string, value: any[]): IWhereBuilder;
    addNotIn(alias: string, field: string, value: any[]): IWhereBuilder;

    addMore(alias: string, field: string, value: any): IWhereBuilder;
    addMoreEqual(alias: string, field: string, value: any): IWhereBuilder;

    addLess(alias: string, field: string, value: any): IWhereBuilder;
    addLessEqual(alias: string, field: string, value: any): IWhereBuilder;

    addIsNull(alias: string, field: string): IWhereBuilder;
    addIsNotNull(alias: string, field: string): IWhereBuilder;

    addOnJoin(alias: string, field: string, aliasOther: string, fieldOther: string): IWhereBuilder;

    get(alias: string, aliasField: string): IQueryCondition;

    apply(where: object): IWhereBuilder;
}