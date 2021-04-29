import { AbstractEntity } from "@lib/entity/AbstractEntity";
import { TYPE_FIELD } from "@lib/entity/EntityConsts";

export class PgSchemas extends AbstractEntity {
    static SCHEMA_NAME = "schema_name";

    constructor() {
        super("information_schema", "schemata");

        this.addField({
            name: "schema_name",
            type: TYPE_FIELD.TEXT,
        });
    }
}