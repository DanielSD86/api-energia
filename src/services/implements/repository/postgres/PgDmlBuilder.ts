import { IEntity } from "@lib/entity/IEntity";
import { IDmlBuilder } from "@lib/repository/query/IDmlBuilder";
import { ISql } from "@lib/repository/query/QueryBuilderTypes";
import QueryUtils from "@lib/repository/query/QueryBuilderUtils";
import { PgWhereBuilder } from "./PgWhereBuilder";

export class PgDmlBuilder implements IDmlBuilder {
    getSqlInsert(entity: IEntity, data: object): ISql {
        let { sql, values }: ISql = { sql: "", values: [] };
        let paramsCount = 0,
            sqlFields = "",
            sqlValues = "";

        sql = "INSERT INTO " + entity.schema + "." + entity.name;

        for (const fieldName in data) {
            const field = entity.getField(fieldName);

            if (field === null) continue;

            paramsCount++;
            sqlFields += ", " + fieldName;
            sqlValues += ", $" + paramsCount;

            const value = QueryUtils.getValue(field, data[fieldName]);

            values.push(value);
        }

        sqlFields = sqlFields.substr(2);
        sqlValues = sqlValues.substr(2);

        sql += "(" + sqlFields + ") VALUES (" + sqlValues + ") RETURNING *";

        return {
            sql,
            values,
        };
    }

    getSqlInserts(entity: IEntity, data: object[]): ISql {
        let { sql, values }: ISql = { sql: "", values: [] };
        let paramsCount = 0,
            sqlFields = "",
            sqlValues = "",
            sqlValueRow = "",
            rowData = {};

        sql = "INSERT INTO " + entity.schema + "." + entity.name;

        for (const idx in data) {
            sqlValueRow = "";
            rowData = data[idx];

            for (const fieldName in rowData) {
                const field = entity.getField(fieldName);

                if (field === null) continue;

                paramsCount++;
                sqlFields += ", " + fieldName;
                sqlValueRow += ", $" + paramsCount;

                const value = QueryUtils.getValue(field, rowData[fieldName]);

                values.push(value);
            }

            sqlValues += ", (" + sqlValueRow + ")";
        }

        sqlFields = sqlFields.substr(2);
        sqlValues = sqlValues.substr(2);

        sql += "(" + sqlFields + ") VALUES " + sqlValues;

        return {
            sql,
            values,
        };
    }

    getSqlUpdate(entity: IEntity, data: object, where: object): ISql {
        let { sql, values }: ISql = { sql: "", values: [] };

        let paramsCount = 0,
            sqlFields = "";

        sql = "UPDATE " + entity.schema + "." + entity.name + " a SET ";

        for (const fieldName in data) {
            const field = entity.getField(fieldName);

            if (field === null) continue;

            paramsCount++;
            sqlFields += ", " + fieldName + " = $" + paramsCount;

            const value = QueryUtils.getValue(field, data[fieldName]);

            values.push(value);
        }

        sqlFields = sqlFields.substr(2);

        const whereBuilder: PgWhereBuilder = new PgWhereBuilder();
        whereBuilder.addEntity(entity, "a").apply(where);

        const { sql: sqlWhere, values: valuesWhere } = whereBuilder.getSql(
            paramsCount
        );

        sql += sqlFields + " WHERE " + sqlWhere + " RETURNING *";
        values = values.concat(valuesWhere);

        return {
            sql,
            values,
        };
    }

    getSqlDelete(entity: IEntity, where: object): ISql {
        let { sql, values }: ISql = { sql: "", values: [] };

        let paramsCount = 0;

        sql = "DELETE FROM " + entity.schema + "." + entity.name;

        const whereBuilder: PgWhereBuilder = new PgWhereBuilder();
        whereBuilder.addEntity(entity, "a");
        whereBuilder.apply(where);

        const { sql: sqlWhere, values: valuesWhere } = whereBuilder.getSql(
            paramsCount
        );

        sql += " WHERE " + sqlWhere;
        values = values.concat(valuesWhere);

        return {
            sql,
            values,
        };
    }
}
