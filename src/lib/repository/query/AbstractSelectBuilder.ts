import { IEntity } from "@lib/entity/IEntity";
import { IField } from "@lib/entity/IField";
import { ISelectBuilder } from "./ISelectBuilder";
import { IWhereBuilder } from "./IWhereBuilder";
import { IQueryField, IQueryEntity, IQueryFieldOrder, ISql, IQueryOptions, AGGREGATE, TYPE_TABLE, TYPE_ORDER } from "./QueryBuilderTypes";
import QueryUtils from "./QueryBuilderUtils";

export abstract class AbstractSelectBuilder implements ISelectBuilder {
    fields: IQueryField[];
    entities: IQueryEntity[];
    where: IWhereBuilder;
    onJoin: IWhereBuilder;
    orderBy: IQueryFieldOrder[];
    groupBy: IQueryField[];
    limit: number;
    offset: number;
    having: IWhereBuilder;

    constructor () {
        this.fields = [];
        this.entities = [];
        this.where = null;
        this.onJoin = null;
        this.orderBy = [];
        this.groupBy = [];
        this.limit = 0;
        this.offset = 0;
        this.having = null;
    }

    getSql(): ISql {
        throw new Error("Method not implemented.");
    }

    add(alias: string, field: string, aliasField?: string): ISelectBuilder {
        this.fields.push({
            alias,
            name: field,
            aliasField
        });

        return this;
    }

    addCoalesce(alias: string, field: string, value: any, aliasField?: string): ISelectBuilder {
        this.fields.push({
            alias,
            name: field,
            coalesceValue: value,
            aliasField
        });
        return this;
    }

    addCoalesceSql(alias: string, field: string, aliasCoalesce: string, fieldCoalesce: string, aliasField?: string): ISelectBuilder {
        this.fields.push({
            alias,
            name: field,
            coalesceValueSql: {
                alias: aliasCoalesce,
                name: fieldCoalesce,
            },
            aliasField
        });
        return this;
    }

    addSum(alias: string, field: string, aliasField: string = undefined): ISelectBuilder {
        this.fields.push({
            alias,
            name: field,
            aggregate: AGGREGATE.SUM,
            aliasField: (aliasField || alias),
        });
        return this;
    }

    addMin(alias: string, field: string, aliasField: string = undefined): ISelectBuilder {
        this.fields.push({
            alias,
            name: field,
            aggregate: AGGREGATE.MIN,
            aliasField: (aliasField || alias),
        });
        return this;
    }

    addMax(alias: string, field: string, aliasField: string = undefined): ISelectBuilder {
        this.fields.push({
            alias,
            name: field,
            aggregate: AGGREGATE.MAX,
            aliasField: (aliasField || alias),
        });
        return this;
    }

    addAvg(alias: string, field: string, aliasField: string = undefined): ISelectBuilder {
        this.fields.push({
            alias,
            name: field,
            aggregate: AGGREGATE.AVG,
            aliasField: (aliasField || alias),
        });
        return this;
    }

    addCount(alias: string, aliasField: string = undefined): ISelectBuilder {
        this.fields.push({
            alias,
            name: "*",
            aggregate: AGGREGATE.COUNT,
            aliasField: (aliasField || alias),
        });
        return this;
    }

    addCountOver(): ISelectBuilder {
        return this;
    }

    private addEntity(entity: IEntity, alias: string, type: TYPE_TABLE, allFields?: boolean, aliasRef?: string): ISelectBuilder {
        this.entities.push({
            alias,
            entity,
            type,
        });

        this.where.addEntity(entity, alias, type);
        this.onJoin.addEntity(entity, alias, type);

        if (allFields) {
            for (const field of entity.fields) {
                this.add(alias, field.name);
            }            
        }

        if (aliasRef) {
            // Procura na tabela referencia se tem alguma referencia da tabela de join
            const entityRef = QueryUtils.getEntity(this.entities, aliasRef);

            if (!entityRef) {
                throw new Error("Alias '" + aliasRef + "' mencionado na clausula join não encontrada.");    
            }

            const foreignKey = entityRef.foreignKeys.find((fk) => fk.entity.getFullName() === entity.getFullName());

            if (foreignKey) {
                for (const idx in foreignKey.source) {
                    this.addOnJoin(alias, foreignKey.source[idx], aliasRef, foreignKey.target[idx]);
                }
            }
        }

        return this;
    }

    from(entity: IEntity, alias: string, allFields?: boolean): ISelectBuilder {
        return this.addEntity(entity, alias, TYPE_TABLE.FROM, allFields);
    }

    innerJoin(entity: IEntity, alias: string, allFields?: boolean, aliasRef?: string): ISelectBuilder {
        return this.addEntity(entity, alias, TYPE_TABLE.INNER_JOIN, allFields, aliasRef);
    }

    leftJoin(entity: IEntity, alias: string, allFields?: boolean, aliasRef?: string): ISelectBuilder {
        return this.addEntity(entity, alias, TYPE_TABLE.LEFT_JOIN, allFields, aliasRef);
    }

    rightJoin(entity: IEntity, alias: string, allFields?: boolean, aliasRef?: string): ISelectBuilder {
        return this.addEntity(entity, alias, TYPE_TABLE.RIGHT_JOIN, allFields, aliasRef);
    }

    crossJoin(entity: IEntity, alias: string, allFields?: boolean): ISelectBuilder {
        return this.addEntity(entity, alias, TYPE_TABLE.CROSS_JOIN, allFields);
    }

    applyWhere(where: object): ISelectBuilder {
        this.where.apply(where);
        return this;
    }

    addOnJoin(alias: string, field: string, aliasOther: string, fieldOther: string): ISelectBuilder {
        this.onJoin.addOnJoin(alias, field, aliasOther, fieldOther);
        return this;
    }

    applyOptions(options: IQueryOptions): ISelectBuilder {
        if (!options) return this;

        if (options.limit) { 
            this.limit = options.limit;
            this.offset = 0;
            if (options.page) {
                this.offset = (options.page - 1) * this.limit;
            }

            this.addCountOver();
        }

        if (options.orderBy) {
            let fieldEntity: IField;
            let alias: string;
            let fieldOrder: string;

            for (const idx in options.orderBy) {
                // Busca qual alias se encaixa no field
                fieldEntity = null;
                alias = "";
                fieldOrder = options.orderBy[idx];

                for (const idx in this.entities) {
                    fieldEntity = this.entities[idx].entity.getField(fieldOrder);

                    if (fieldEntity != null) {
                        alias = this.entities[idx].alias;
                        break;
                    }
                }

                if (fieldEntity == null) {
                    throw new Error("Campo " + fieldOrder + " não encontrado em nenhum entidade (Ordenação).");
                }

                const order : IQueryFieldOrder = {
                    alias,
                    name: fieldOrder,
                    order: (options.orderByDesc && options.orderByDesc.includes(fieldOrder) ? TYPE_ORDER.DESC : TYPE_ORDER.ASC),
                }            

                this.orderBy.push(order);
            }
        }

        return this;
    }    
}
