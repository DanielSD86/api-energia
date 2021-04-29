import { AbstractEntity } from "@lib/entity/AbstractEntity";
import { TYPE_FIELD } from "@lib/entity/EntityConsts";

export class PgTables extends AbstractEntity {
    static TABLE_SCHEMA = "table_schema";
    static TABLE_NAME = "table_name";

    constructor() {
        super("information_schema", "tables");

        this.addField({
            name: "table_schema",
            type: TYPE_FIELD.TEXT,
        });
        this.addField({
            name: "table_name",
            type: TYPE_FIELD.TEXT,
        });
    }
}