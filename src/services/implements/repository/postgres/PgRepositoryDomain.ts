import { IEntity } from "@lib/entity/IEntity";
import { IField } from "@lib/entity/IField";
import { IRepositoryDomain } from "@lib/repository/IRepositoryDomain";
import { PgTables } from "./entities/PgTables";
import { PgFields } from "./entities/PgFields";
import { PgIndexes } from "./entities/PgIndexes";
import { TYPE_FIELD } from "@lib/entity/EntityConsts";
import { PgSchemas } from "./entities/PgSchemas";
import { PgForeignKeys } from "./entities/PgForeignKeys";
import { IRepositoryClient } from "@lib/repository/IRepositoryClient";
import { PgCheckConstrains } from "./entities/PgCheckConstrains";
import { ListUtils } from "@lib/utils/ListUtils";

export class PgRepositoryDomain implements IRepositoryDomain {
    repositoryClient: IRepositoryClient;

    schemas: Object[];
    tables: Object[];
    fields: Object[];
    indexes: Object[];
    foreignKeys: Object[];
    checkConstraints: Object[];

    setRepositoryClient(repositoryClient: IRepositoryClient): void {
        this.repositoryClient = repositoryClient;
    }

    getFieldType(field: IField): string {
        switch (field.type) {
            case TYPE_FIELD.TEXT:
                return (field.size > 0 ? "varchar(" + field.size + ")" : "text");
            case TYPE_FIELD.INTEGER:
                return (field.autoGenerate ? "serial" : "int4");
            case TYPE_FIELD.BIGINTEGER:
                return (field.autoGenerate ? "bigserial" : "int8");
            case TYPE_FIELD.DATE:
                return "date";
            case TYPE_FIELD.DECIMAL:
                return ("numeric(" + (field.size || 10) + "," + (field.precision || 2) + ")");
            case TYPE_FIELD.TIME:
                return "time";
            case TYPE_FIELD.DATETIME:
                return "timestamp";
            case TYPE_FIELD.BOOLEAN:
                return "boolean";
            default:
                return "tipo não definido (" + field.type + ")";
        }
    }

    async loadDomain(): Promise<void> {
        this.schemas = await this.getSchemas();
        this.tables  = await this.getTables();
        this.fields  = await this.getFields();
        this.indexes = await this.getIndexes();
        this.foreignKeys = await this.getForeignKeys();
        this.checkConstraints = await this.getCheckConstraints();
    }

    async getForeignKeys(): Promise<Object[]> {
        const selectBuilder = this.repositoryClient.repository.getBuilder().
                                from(new PgForeignKeys(), "a", true).
                                applyWhere({ [PgForeignKeys.CONSTRAINT_TYPE]: PgForeignKeys.WHERE_FOREIGNKEY });
        const result = await this.repositoryClient.select(selectBuilder);

        return result;
    }

    async getCheckConstraints(): Promise<Object[]> {
        const selectBuilder = this.repositoryClient.repository.getBuilder().
                                from(new PgCheckConstrains(), "a", true).
                                applyWhere({ [PgCheckConstrains.CONSTRAINT_TYPE]: PgCheckConstrains.WHERE_CHECKCONSTRAINTS });
        const result = await this.repositoryClient.select(selectBuilder);

        return result;
    }

    async getSchemas(): Promise<Object[]> {
        const selectBuilder = this.repositoryClient.repository.getBuilder().from(new PgSchemas(), "a", true);
        const result = await this.repositoryClient.select(selectBuilder);

        return result;
    }

    async getTables(): Promise<Object[]> {
        const selectBuilder = this.repositoryClient.repository.getBuilder().from(new PgTables(), "a", true);
        const result = await this.repositoryClient.select(selectBuilder);

        return result;
    }

    async getFields(): Promise<Object[]> {
        const selectBuilder = this.repositoryClient.repository.getBuilder().from(new PgFields(), "a", true);
        const result = await this.repositoryClient.select(selectBuilder);

        return result;
    }

    async getIndexes(): Promise<Object[]> {
        const selectBuilder = this.repositoryClient.repository.getBuilder().from(new PgIndexes(), "a", true);
        const result = await this.repositoryClient.select(selectBuilder);

        return result;
    }

    async createIndexIfNotExists(entity: IEntity): Promise<void> {
        const EXISTS = "exists";

        for (let idxIndex in entity.indexes) {
            const indexBd = entity.indexes[idxIndex];
            const indexEntity = this.indexes.filter(index => index[PgIndexes.TABLE_SCHEMA] == entity.schema 
                                                            && index[PgIndexes.TABLE_NAME] == entity.name
                                                            && index[PgIndexes.INDEX_NAME] == indexBd.name);

            if (indexEntity.length == 0) {
                let fields = "";

                for (let indexField in indexBd.fields) {
                    fields += ', "' + indexBd.fields[indexField] + '"';
                }

                const sqlindex = "CREATE " + (indexBd.unique ? "UNIQUE " : "") + " INDEX " + indexBd.name +
                                " ON " + entity.schema + "." + entity.name + " USING btree (" + fields.substr(2) + ")";

                await this.repositoryClient.executeSql(sqlindex);
            } else {
                indexEntity[0][EXISTS] = true;
            }
        }

        // Remove indices não especificados
        const idxEntity = this.indexes.filter(index => index[PgIndexes.TABLE_SCHEMA] == entity.schema 
                                                        && index[PgIndexes.TABLE_NAME] == entity.name);
                                                            
        for (let idx in idxEntity) {
            const indexEntity = idxEntity[idx];

            if (indexEntity[EXISTS]) continue;
            if (String(indexEntity[PgIndexes.INDEX_NAME]).endsWith("pkey")) continue;

            const sqlIndexRemove = "DROP INDEX " + entity.schema + "." + indexEntity[PgIndexes.INDEX_NAME];
            await this.repositoryClient.executeSql(sqlIndexRemove);
        }
    }

    async createForeignKeyIfNotExists(entity: IEntity): Promise<void> {
        for (let idx in entity.foreignKeys) {
            const fkBd = entity.foreignKeys[idx];
            const indexEntity = this.foreignKeys.filter(index => index[PgForeignKeys.TABLE_SCHEMA] == entity.schema 
                                                        && index[PgForeignKeys.TABLE_NAME] == entity.name
                                                        && index[PgForeignKeys.FOREIGNKEY_NAME] == fkBd.name);

            if (indexEntity.length == 0) {
                let fields = "", fieldsFk = "";

                for (let indexField in fkBd.target) {
                    fields += ", " + fkBd.target[indexField];
                    fieldsFk += ", " + fkBd.source[indexField];
                }

                const sqlFk = 
                    "ALTER TABLE " + entity.getFullName() + 
                    " ADD CONSTRAINT " + fkBd.name + " FOREIGN KEY (" + fields.substr(2) + ") " +
                    "REFERENCES " + fkBd.entity.getFullName() + "(" + fieldsFk.substr(2) + ") "+
                    "ON DELETE NO ACTION ON UPDATE NO ACTION NOT DEFERRABLE";
                
                await this.repositoryClient.executeSql(sqlFk);
            }
        }
    }

    async createCheckConstraintIfNotExists(entity: IEntity): Promise<void> {
        for (let idx in entity.checkConstraint) {
            const chkBd = entity.checkConstraint[idx];
            const field = entity.getField(chkBd.field);
            const indexEntity = this.checkConstraints.filter(index => index[PgCheckConstrains.TABLE_SCHEMA] == entity.schema 
                                                        && index[PgCheckConstrains.TABLE_NAME] == entity.name
                                                        && index[PgCheckConstrains.CHECKCONSTRAINT_NAME] == chkBd.name);

            if (indexEntity.length == 0) {
                const list = ListUtils.join(chkBd.values, field.type === TYPE_FIELD.TEXT);

                const sqlChk = 
                    "ALTER TABLE " + entity.getFullName() + 
                    " ADD CONSTRAINT " + chkBd.name + " CHECK (" + chkBd.field + " in(" + list + "));";
                
                await this.repositoryClient.executeSql(sqlChk);
            }
        }
    }

    async createTableIfNotExists(entity: IEntity): Promise<void> {
        // Schemas
        const schemasEntity = this.schemas.filter(schema => schema[PgSchemas.SCHEMA_NAME] == entity.schema);

        if (schemasEntity.length === 0) {
            const sqlSchema = "CREATE SCHEMA " + entity.schema + " AUTHORIZATION " + process.env.USER_DB;
            await this.repositoryClient.executeSql(sqlSchema);

            this.schemas.push({ [PgSchemas.SCHEMA_NAME]: entity.schema });
        }

        const tablesEntity = this.tables.filter(table => table[PgTables.TABLE_SCHEMA] == entity.schema && table[PgTables.TABLE_NAME] == entity.name);

        // Valida a atualização dos campos
        if (tablesEntity.length > 0) {
            for (let idxField in entity.fields) {
                await this.createFieldIfNotExists(entity, entity.fields[idxField]);
            }
        } else {
            // Cria a tabela
            let sql = "";
            let fields = "";
            let fieldsPk = "";

            // Tablename
            sql = "CREATE TABLE " + entity.schema + "." + entity.name + "(";

            // Fields
            for (let idxField in entity.fields) {
                const field = entity.fields[idxField];

                fields += ', "' + field.name + '" ' + (await this.getFieldType(field)) + " " + (!field.allowNull ? "NOT" : "") + " null";

                // Primary Key
                if (field.primaryKey) {
                    fieldsPk += ", " + field.name;
                }
            }

            fields = fields.substr(2);

            if (fieldsPk) {
                fieldsPk = "CONSTRAINT " + entity.name + "_pkey PRIMARY KEY (" + fieldsPk.substr(2) + ")";
            }

            sql += fields + (fieldsPk ? ", " + fieldsPk : "") + ")";

            await this.repositoryClient.executeSql(sql);
        }

        // Indexes
        await this.createIndexIfNotExists(entity);
        // Foreign Keys
        await this.createForeignKeyIfNotExists(entity);
        // Check Constraints
        await this.createCheckConstraintIfNotExists(entity);
    }
    
    async createFieldIfNotExists(entity: IEntity, field: IField): Promise<void> {
        const fieldEntity = this.fields.filter(table => table[PgFields.TABLE_SCHEMA] == entity.schema 
                                                        && table[PgFields.TABLE_NAME] == entity.name
                                                        && table[PgFields.COLUMN_NAME] == field.name);

        // Cria o campo 
        if (fieldEntity.length == 0) {
            // Cria o campo nulo
            const sqlField = "ALTER TABLE " + entity.schema + "." + entity.name + 
                            ' ADD "' + field.name +'" ' + (await this.getFieldType(field)) + " NULL";
            await this.repositoryClient.executeSql(sqlField);

            // Atualiza o campo
            if (!field.allowNull) {
                if (field.defaultValue) {
                    const sqlUpdate = "UPDATE " + entity.schema + "." + entity.name + " SET " + field.name + " = $1";
                    await this.repositoryClient.executeSql(sqlUpdate, [field.defaultValue]);
                }

                // Seta para not null
                const sqlFieldNotNull = "ALTER TABLE " + entity.schema + "." + entity.name + ' ALTER COLUMN "' + field.name + '" SET NOT NULL';
                await this.repositoryClient.executeSql(sqlFieldNotNull);
            }
        } else {
            if ((fieldEntity[0][PgFields.IS_NULLABLE] == "NO") == (field.allowNull || false)) {
                if (!field.allowNull && field.defaultValue) {
                    const sqlUpdate = "UPDATE " + entity.schema + "." + entity.name + " SET " + field.name + " = $1";
                    await this.repositoryClient.executeSql(sqlUpdate, [field.defaultValue]);
                }

                // Seta para not null
                const sqlFieldNotNull = "ALTER TABLE " + entity.schema + "." + entity.name + 
                                        ' ALTER COLUMN "' + field.name + '" ' + (!field.allowNull ? "SET NOT" : "DROP NOT") + ' NULL';
                await this.repositoryClient.executeSql(sqlFieldNotNull);
            }
        }
    }
}
