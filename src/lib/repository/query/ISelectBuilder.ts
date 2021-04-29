import { IEntity } from "@lib/entity/IEntity";
import { IWhereBuilder } from "./IWhereBuilder";
import { IQueryEntity, IQueryField, ISql, IQueryFieldOrder, IQueryOptions } from "./QueryBuilderTypes";

export interface ISelectBuilder {
    fields: IQueryField[];
    entities: IQueryEntity[];
    where: IWhereBuilder;
    onJoin: IWhereBuilder;
    orderBy: IQueryFieldOrder[];
    groupBy: IQueryField[];
    limit: number;
    offset: number;
    having: IWhereBuilder;

    getSql(): ISql;

    add(alias: string, field: string, aliasField?: string): ISelectBuilder;
	addCoalesce(alias: string, field: string, value: any, aliasField?: string): ISelectBuilder;
	addCoalesceSql(alias: string, field: string, aliasCoalesce: string, fieldCoalesce: string, aliasField?: string): ISelectBuilder;

	addSum(alias: string, field: string, aliasField: string): ISelectBuilder;
	addMin(alias: string, field: string, aliasField: string): ISelectBuilder;
	addMax(alias: string, field: string, aliasField: string): ISelectBuilder;
	addAvg(alias: string, field: string, aliasField: string): ISelectBuilder;
	addCount(alias: string, aliasField: string): ISelectBuilder;
    addCountOver(): ISelectBuilder;

	from(entity: IEntity, alias: string, allFields: boolean): ISelectBuilder;
	innerJoin(entity: IEntity, alias: string, allFields: boolean, aliasRef?: string): ISelectBuilder;
	leftJoin(entity: IEntity, alias: string, allFields: boolean, aliasRef?: string): ISelectBuilder;
	rightJoin(entity: IEntity, alias: string, allFields: boolean, aliasRef?: string): ISelectBuilder;
	crossJoin(entity: IEntity, alias: string, allFields: boolean): ISelectBuilder;
	
	applyWhere(where: object): ISelectBuilder;	
	applyOptions(options: IQueryOptions): ISelectBuilder;

    addOnJoin(alias: string, field: string, aliasOther: string, fieldOther: string): ISelectBuilder;
}
