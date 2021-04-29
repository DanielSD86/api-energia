import { AbstractEntity } from "@lib/entity/AbstractEntity";
import { TYPE_FIELD } from "@lib/entity/EntityConsts";

export class PgCheckConstrains extends AbstractEntity {
    static TABLE_SCHEMA = "table_schema";
    static TABLE_NAME = "table_name";
    static CONSTRAINT_TYPE = "constraint_type";
    static CHECKCONSTRAINT_NAME = "constraint_name";

    static WHERE_CHECKCONSTRAINTS = "CHECK";

    constructor() {
        super("information_schema", "table_constraints");

        this.addField({
            name: PgCheckConstrains.TABLE_SCHEMA,
            type: TYPE_FIELD.TEXT,
        });
        this.addField({
            name: PgCheckConstrains.TABLE_NAME,
            type: TYPE_FIELD.TEXT,
        });
        this.addField({
            name: PgCheckConstrains.CHECKCONSTRAINT_NAME,
            type: TYPE_FIELD.TEXT,
        });
        this.addField({
            name: PgCheckConstrains.CONSTRAINT_TYPE,
            type: TYPE_FIELD.TEXT,
        });
    }
}