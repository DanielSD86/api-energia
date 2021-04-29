import { AbstractEntity } from "@lib/entity/AbstractEntity";
import { TYPE_FIELD } from "@lib/entity/EntityConsts";

export class PgFields extends AbstractEntity {
    static TABLE_SCHEMA = "table_schema";
    static TABLE_NAME = "table_name";
    static COLUMN_NAME = "column_name";
    static IS_NULLABLE = "is_nullable";

    constructor() {
        super("information_schema", "columns");

        this.addField({
            name: "table_schema",
            type: TYPE_FIELD.TEXT,
        });
        this.addField({
            name: "table_name",
            type: TYPE_FIELD.TEXT,
        });
        this.addField({
            name: "column_name",
            type: TYPE_FIELD.TEXT,
        });
        this.addField({
            name: "is_nullable",
            type: TYPE_FIELD.TEXT,
        });
    }
}