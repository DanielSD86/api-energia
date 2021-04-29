import { TYPE_CASE, TYPE_FIELD } from "@lib/entity/EntityConsts";
import { IEntity } from "@lib/entity/IEntity";
import { IField } from "@lib/entity/IField";
import { StringUtils } from "@lib/utils/StringUtils";
import { IQueryEntity, IQueryFieldSql, SYMBOL_COMPARE, } from "./QueryBuilderTypes";

export default class QueryUtils {
    static getValue(field: IField, value: any): Object {
        if (value === null) return null;
        if (value === undefined) return undefined;

        switch(field.type) {
            case TYPE_FIELD.TEXT:
                switch(field.typeCase) {
                    case TYPE_CASE.LOWER:
                        return String(value).toLowerCase();
                    case TYPE_CASE.NORMAL:
                        return String(value);
                    case TYPE_CASE.NUMBERONLY:
                        return StringUtils.getNumberOnly(value);
                    default:
                        return String(value).toUpperCase();
                }
            case TYPE_FIELD.BIGINTEGER:
            case TYPE_FIELD.INTEGER:
                return parseInt(String(value));
            case TYPE_FIELD.BIGDECIMAL:
            case TYPE_FIELD.DECIMAL:
                return parseFloat(String(value));
            case TYPE_FIELD.BOOLEAN:
                return (value === true || value === "S" || value === "s" || value === 1 || value === "Y" || value === "y");
            default:
                return value;
        }
    }

    static getInitialsEntity(entity: IEntity) {
        let name = entity.schema.substr(0, 1);

        let useNext = true;     

        for (const idx in Array.from(entity.name)) {
            if (useNext) {
                name += entity.name[idx]; 
                useNext = false;
            }

            if (entity.name[idx] == "_") {
                useNext = true; 
            }
        }

        return name;
    }

    static getEntity(entities: IQueryEntity[], alias: string): IEntity {
        const resultEntities = entities.filter(
            (entity) => entity.alias === alias
        );

        if (resultEntities.length == 0) return null;
        return resultEntities[0].entity;
    }

    static getFieldSymbolSql(name: string): IQueryFieldSql {
        let fieldName = name.toLowerCase();
        let symbol = SYMBOL_COMPARE.EQUAL;

        if (fieldName.endsWith("_like")) {
            fieldName = fieldName.replace("_like", "");
            symbol = SYMBOL_COMPARE.LIKE;
        } else if (fieldName.endsWith("_not_like")) {
            fieldName = fieldName.replace("_not_like", "");
            symbol = SYMBOL_COMPARE.NOT_LIKE;
        } else if (fieldName.endsWith("_more_equal")) {
            fieldName = fieldName.replace("_more_equal", "");
            symbol = SYMBOL_COMPARE.MORE_EQUAL;
        } else if (fieldName.endsWith("_more")) {
            fieldName = fieldName.replace("_more", "");
            symbol = SYMBOL_COMPARE.MORE;
        } else if (fieldName.endsWith("_less_equal")) {
            fieldName = fieldName.replace("_less_equal", "");
            symbol = SYMBOL_COMPARE.LESS_EQUAL;
        } else if (fieldName.endsWith("_less")) {
            fieldName = fieldName.replace("_less", "");
            symbol = SYMBOL_COMPARE.LESS;
        } else if (fieldName.endsWith("_is_null")) {
            fieldName = fieldName.replace("_is_null", "");
            symbol = SYMBOL_COMPARE.IS;
        } else if (fieldName.endsWith("_is_not_null")) {
            fieldName = fieldName.replace("_is_not_null", "");
            symbol = SYMBOL_COMPARE.NOT_IS;
        } else if (fieldName.endsWith("_not_equal")) {
            fieldName = fieldName.replace("_not_equal", "");
            symbol = SYMBOL_COMPARE.NOT_EQUAL;
        } else if (fieldName.endsWith("_not_in")) {
            fieldName = fieldName.replace("_not_in", "");
            symbol = SYMBOL_COMPARE.NOT_IN;
        } else if (fieldName.endsWith("_in")) {
            fieldName = fieldName.replace("_in", "");
            symbol = SYMBOL_COMPARE.IN;
        }

        return {
            name: fieldName,
            symbol,
        };
    }
}
