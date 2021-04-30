import { IEntity } from "@lib/entity/IEntity";
import { IWhereBuilder } from "./IWhereBuilder";
import { IQueryCondition, IQueryEntity, ISql, SYMBOL_COMPARE, TYPE_TABLE, } from "./QueryBuilderTypes";
import QueryUtils from "./QueryBuilderUtils";

export abstract class AbstractWhereBuilder implements IWhereBuilder {
    conditions: IQueryCondition[];
    entities: IQueryEntity[];

    whereOr: IWhereBuilder[];

    constructor() {
        this.conditions = [];
        this.entities = [];
        this.whereOr = [];
    }
    
    getEntity(alias: string): IQueryEntity{
        for (const idx in this.entities) {
            if (this.entities[idx].alias === alias) {
                return this.entities[idx];
            }
        }

        return null;
    }

    getSql(paramsCount: number, alias?: string): ISql {
        throw new Error("Method not implemented.");
    }

    addEntity(entity: IEntity, alias: string, type: TYPE_TABLE = TYPE_TABLE.FROM): IWhereBuilder {
        this.entities.push({
            alias,
            entity,
            type
        });

        return this;
    }

    addCustomCondition(condition: IQueryCondition): IWhereBuilder {
        this.conditions.push(condition);
        return this;
    }

    private addConditionEntity(alias: string, field: string, aliasOther: string, fieldOther: string, symbol: SYMBOL_COMPARE = SYMBOL_COMPARE.EQUAL): IWhereBuilder {
        const entity = this.getEntity(alias);
        const entityOther = this.getEntity(aliasOther);

        if (entity === null || entityOther === null) {
            throw new Error("Entidade não atribuida na condição.");
        }

        const fieldEntity = entity.entity.getField(field);
        const fieldEntityOther = entityOther.entity.getField(fieldOther);

        if (fieldEntity === null) {
            console.log(alias, entity, field, aliasOther, entityOther, fieldOther);
            

            throw new Error("Campo " + field + " não encontrado para entidade " + entity.entity.name + ".");
        }

        if (fieldEntityOther === null) {
            throw new Error("Campo " + fieldEntityOther + " não encontrado para entidade " + entityOther.entity.name + ".");
        }

        this.conditions.push({ 
            alias,
            name: field,
            symbol,
            valueSql: {
                alias: aliasOther,
                name: fieldOther,
            }
        });

        return this;
    }

    private addCondition(alias: string, field: string, value: any, symbol: SYMBOL_COMPARE = SYMBOL_COMPARE.EQUAL): IWhereBuilder {
        const entity = this.getEntity(alias);

        if (entity === null) {
            throw new Error("Entidade não atribuida na condição.");
        }

        const fieldEntity = entity.entity.getField(field);

        if (fieldEntity === null) {
            throw new Error("Campo " + field + " não encontrado para entidade " + entity.entity.name + ".");
        }

        const valueCustom = QueryUtils.getValue(fieldEntity, value);        

        this.conditions.push({ 
            alias,
            name: field,
            value: valueCustom,
            symbol,
        });

        return this;
    }

    addOnJoin(alias: string, field: string, aliasOther: string, fieldOther: string): IWhereBuilder {
        return this.addConditionEntity(alias, field, aliasOther, fieldOther);
    }

    add(alias: string, field: string, value: any): IWhereBuilder {
        return this.addCondition(alias, field, value);
    }

    addNotEqual(alias: string, field: string, value: any): IWhereBuilder {
        return this.addCondition(alias, field, value, SYMBOL_COMPARE.NOT_EQUAL);
    }

    addIn(alias: string, field: string, value: any[]): IWhereBuilder {
        return this.addCondition(alias, field, value, SYMBOL_COMPARE.IN);
    }

    addNotIn(alias: string, field: string, value: any[]): IWhereBuilder {
        return this.addCondition(alias, field, value, SYMBOL_COMPARE.NOT_IN);
    }

    addMore(alias: string, field: string, value: any): IWhereBuilder {
        return this.addCondition(alias, field, value, SYMBOL_COMPARE.MORE);
    }

    addMoreEqual(alias: string, field: string, value: any): IWhereBuilder {
        return this.addCondition(alias, field, value, SYMBOL_COMPARE.MORE_EQUAL);
    }

    addLess(alias: string, field: string, value: any): IWhereBuilder {
        return this.addCondition(alias, field, value, SYMBOL_COMPARE.LESS);
    }

    addLessEqual(alias: string, field: string, value: any): IWhereBuilder {
        return this.addCondition(alias, field, value, SYMBOL_COMPARE.LESS_EQUAL);
    }

    addIsNull(alias: string, field: string): IWhereBuilder {
        return this.addCondition(alias, field, null, SYMBOL_COMPARE.IS);
    }

    addIsNotNull(alias: string, field: string): IWhereBuilder {
        return this.addCondition(alias, field, null, SYMBOL_COMPARE.NOT_IS);
    }

    addLike(alias: string, field: string, value: string): IWhereBuilder {
        const valueCustom = value.replace(/\+/g, "%");
        return this.addCondition(alias, field, valueCustom, SYMBOL_COMPARE.LIKE);
    }
    addNotLike(alias: string, field: string, value: string): IWhereBuilder {
        const valueCustom = value.replace(/\+/g, "%");
        return this.addCondition(alias, field, valueCustom, SYMBOL_COMPARE.NOT_LIKE);
    }

    get(alias: string, aliasField: string): IQueryCondition {
        for (const idx in this.conditions) {
            if (this.conditions[idx].alias === alias && aliasField === (this.conditions[idx].aliasField || this.conditions[idx].name)) {
                return this.conditions[idx];
            }
        }
        return null;
    }

    apply(where: object): IWhereBuilder {
        for (const fieldName in where) {            
            const field = QueryUtils.getFieldSymbolSql(fieldName);

            // Busca qual alias se encaixa no field
            let fieldEntity = null;
            let alias = "";

            for (const idx in this.entities) {
                fieldEntity = this.entities[idx].entity.getField(field.name);

                if (fieldEntity != null) { 
                    alias = this.entities[idx].alias;
                    break;
                }
            }

            if (fieldEntity == null) {
                throw new Error("Campo " + field.name + " não encontrado em nenhum entidade.");
            }

            const value = where[fieldName];

            switch (field.symbol) {
                case SYMBOL_COMPARE.NOT_EQUAL:
                    this.addNotEqual(alias, field.name, value);
                    break;
                case SYMBOL_COMPARE.IN:
                    this.addIn(alias, field.name, value);
                    break;
                case SYMBOL_COMPARE.NOT_IN:
                    this.addNotIn(alias, field.name, value);
                    break;
                case SYMBOL_COMPARE.MORE:
                    this.addMore(alias, field.name, value);
                    break;
                case SYMBOL_COMPARE.MORE_EQUAL:
                    this.addMoreEqual(alias, field.name, value);
                    break;
                case SYMBOL_COMPARE.LESS:
                    this.addLess(alias, field.name, value);
                    break;
                case SYMBOL_COMPARE.LESS_EQUAL:
                    this.addLessEqual(alias, field.name, value);
                    break;
                case SYMBOL_COMPARE.LIKE:
                    this.addLike(alias, field.name, value);
                    break;
                case SYMBOL_COMPARE.NOT_LIKE:
                    this.addNotLike(alias, field.name, value);
                    break;
                case SYMBOL_COMPARE.IS:
                    this.addIsNull(alias, field.name);
                case SYMBOL_COMPARE.NOT_IS:
                    this.addIsNotNull(alias, field.name);
                default:
                    this.add(alias, field.name, value);
                    break;
            }
        }

        return this;
    }
}
