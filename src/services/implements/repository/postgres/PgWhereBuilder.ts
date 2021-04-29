import { AbstractWhereBuilder } from "@lib/repository/query/AbstractWhereBuilder";
import { IQueryField, ISql } from "@lib/repository/query/QueryBuilderTypes";

export class PgWhereBuilder extends AbstractWhereBuilder {
    static getFieldSql(field: IQueryField, paramsCount: number): ISql {
        let sql = field.name;
        let values = [];

        if (field.alias) sql = field.alias + "." + sql;
        let value = null;

        // Coalesce com valor
        if (field.coalesceValue) {
            paramsCount ++;
            sql = "COALESCE(" + sql + ", $" + paramsCount + ")";
            values.push(field.coalesceValue);
        }

        // Coalesce com outro campo
        if (field.coalesceValueSql) {
            paramsCount ++;

            const coalesceOther = PgWhereBuilder.getFieldSql(field.coalesceValueSql, paramsCount);

            sql = "COALESCE(" + sql + ", $" + coalesceOther.sql + ")";

            if (coalesceOther.values) {
                paramsCount = paramsCount + coalesceOther.values.length;
                values = values.concat(field.coalesceValue);
            }
        }

        // Aggregate
        if (field.aggregate) {
            paramsCount ++;
            sql = field.aggregate + "(" + sql + ")";
            values.push(field.coalesceValue);
        }

        // Alias
        if (field.aliasField)
            sql += " AS " + field.aliasField;

        if (values.length === 0) values = undefined;

        return {
            sql, 
            values
        };
    } 

    getSql(paramsCount: number, alias?: string): ISql {
        let sqlWhere = "";
        let values = [];

        for (const idxWhere in this.conditions) {
            const where = this.conditions[idxWhere];

            if (alias) {
                if (alias !== where.alias) continue;
            }

            let sqlField = PgWhereBuilder.getFieldSql(where, paramsCount);
            let sql = sqlField.sql;

            // Outro campo como valor
            if (where.valueSql) {
                const sqlOther = PgWhereBuilder.getFieldSql(where.valueSql, paramsCount);

                sql = sql + " " + where.symbol + " " + sqlOther.sql;
                if (sqlOther.values) {
                    paramsCount += sqlOther.values.length;
                    values = values.concat(sqlOther.values);
                }
            }

            // VaLor
            if (where.value !== undefined) {
                paramsCount ++;
                sql = sql + " " + where.symbol + " $" + paramsCount;
                values.push(where.value);
            }

            sqlWhere += "AND (" + sql + ")";
        }

        if (sqlWhere !== "") {
            sqlWhere = sqlWhere.substr(3).trim();
        }

        return { sql: sqlWhere, values };
    }
}
