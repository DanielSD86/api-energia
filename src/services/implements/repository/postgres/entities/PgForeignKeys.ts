import { AbstractEntity } from "@lib/entity/AbstractEntity";
import { TYPE_FIELD } from "@lib/entity/EntityConsts";

export class PgForeignKeys extends AbstractEntity {
    static TABLE_SCHEMA = "table_schema";
    static TABLE_NAME = "table_name";
    static CONSTRAINT_TYPE = "constraint_type";
    static FOREIGNKEY_NAME = "constraint_name";

    static WHERE_FOREIGNKEY = "FOREIGN KEY";

    constructor() {
        super("information_schema", "table_constraints");

        this.addField({
            name: PgForeignKeys.TABLE_SCHEMA,
            type: TYPE_FIELD.TEXT,
        });
        this.addField({
            name: PgForeignKeys.TABLE_NAME,
            type: TYPE_FIELD.TEXT,
        });
        this.addField({
            name: PgForeignKeys.FOREIGNKEY_NAME,
            type: TYPE_FIELD.TEXT,
        });
        this.addField({
            name: PgForeignKeys.CONSTRAINT_TYPE,
            type: TYPE_FIELD.TEXT,
        });
    }
}