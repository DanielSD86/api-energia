import { ROWS_COUNT_QUERY } from "@lib/layers/business/LayerBusinessTypes";
import { AbstractSelectBuilder } from "@lib/repository/query/AbstractSelectBuilder";
import { ISelectBuilder } from "@lib/repository/query/ISelectBuilder";
import { ISql, TYPE_TABLE } from "@lib/repository/query/QueryBuilderTypes";
import { PgWhereBuilder } from "./PgWhereBuilder";

export class PgSelectBuilder extends AbstractSelectBuilder {
    paramsCount: number;

    constructor() {
        super();
        this.where = new PgWhereBuilder();
        this.onJoin = new PgWhereBuilder();
        this.having = new PgWhereBuilder();
    }
    
    addCountOver(): ISelectBuilder {
        return this.add("", "count(*) OVER()", ROWS_COUNT_QUERY.toLocaleLowerCase());
    }

    getSql(): ISql {
        this.paramsCount = 0;

        let sqlFields = "";
        let sqlFrom = "";
        let sqlJoins = "";
        let sqlWhere = "";
        let sqlGroupBy = "";
        let sqlOrderBy = "";
        let sqlLimit = "";        
        let values = [];

        // Fields
        for (let idxField in this.fields) {
            const field = PgWhereBuilder.getFieldSql(this.fields[idxField], this.paramsCount);

            if (field.values) {   
                this.paramsCount + field.values.length;
                values.push(field.values);
            }

            sqlFields += ", " + field.sql;
        }
        sqlFields = sqlFields.substr(2);

        // From e Joins
        let aliasFrom = "a";

        for (let idxEntity in this.entities) {
            const entity = this.entities[idxEntity];

            switch (entity.type) {
                case TYPE_TABLE.FROM:
                    aliasFrom = entity.alias;
                    sqlFrom = "FROM " + entity.entity.getFullName() + " " + entity.alias;
                    break;
                case TYPE_TABLE.CROSS_JOIN:
                    sqlJoins += sqlJoins = " " + entity.type +  " " + entity.entity.getFullName() + " " + entity.alias;
                    break;
                default:
                    const onJoin = this.onJoin.getSql(this.paramsCount, entity.alias);

                    if (onJoin.values) {
                        this.paramsCount += onJoin.values.length;
                        values = values.concat(onJoin.values);
                    }

                    sqlJoins += sqlJoins = " " + entity.type +  " " + entity.entity.getFullName() + " " + entity.alias + " ON(" + onJoin.sql + ")";
            }
        }

        // Where
        const whereFields = this.where.getSql(this.paramsCount);

        if (whereFields.sql) {
            sqlWhere = whereFields.sql;
            
            if (whereFields.values) {
                this.paramsCount += whereFields.values.length;
                values = values.concat(whereFields.values);
            }
        }

        // Group by
        for (let idxGroupBy in this.groupBy) {
            const groupSql = PgWhereBuilder.getFieldSql(this.groupBy[idxGroupBy], this.paramsCount);

            if (groupSql.values) {   
                this.paramsCount + groupSql.values.length;
                values.push(groupSql.values);
            }

            sqlGroupBy += ", " + groupSql.sql;
        }
        if (sqlGroupBy != "") sqlGroupBy = sqlGroupBy.substr(2);

        // Order by
        for (let idxOrderBy in this.orderBy) {
            const orderSql = PgWhereBuilder.getFieldSql(this.orderBy[idxOrderBy], this.paramsCount);

            if (orderSql.values) {   
                this.paramsCount + orderSql.values.length;
                values.push(orderSql.values);
            }

            sqlOrderBy += ", " + orderSql.sql + " " + this.orderBy[idxOrderBy].order;
        }
        if (sqlOrderBy != "") sqlOrderBy = sqlOrderBy.substr(2);

        // limit and offset
        if (this.limit > 0) {
            sqlLimit = "LIMIT " + this.limit;
            if (this.offset > 0) {
                sqlLimit += " OFFSET " + this.offset;
            }
        }

        const sql = "SELECT " + sqlFields +
                          " " + sqlFrom +
                          (sqlJoins != "" ? " " + sqlJoins : "") +
                    (sqlWhere != "" ? " WHERE " + sqlWhere : "") +
                    (sqlGroupBy != "" ? " GROUP BY " + sqlGroupBy : "") +
                    (sqlOrderBy != "" ? " ORDER BY " + sqlOrderBy : "") +
                    (sqlLimit != "" ? " " + sqlLimit : "");
        return {
            sql,
            values,
        };
    }
}
