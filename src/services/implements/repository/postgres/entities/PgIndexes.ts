import { AbstractEntity } from "@lib/entity/AbstractEntity";
import { TYPE_FIELD } from "@lib/entity/EntityConsts";

export class PgIndexes extends AbstractEntity {
    static TABLE_SCHEMA = "schemaname";
    static TABLE_NAME = "tablename";
    static INDEX_NAME = "indexname";

    constructor() {
        super("", "pg_indexes");

        this.addField({
            name: PgIndexes.TABLE_SCHEMA,
            type: TYPE_FIELD.TEXT,
        });
        this.addField({
            name: PgIndexes.TABLE_NAME,
            type: TYPE_FIELD.TEXT,
        });
        this.addField({
            name: PgIndexes.INDEX_NAME,
            type: TYPE_FIELD.TEXT,
        });
    }
}