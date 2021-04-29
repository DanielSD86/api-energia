import { PoolClient } from "pg";
import { IEntity } from "@lib/entity/IEntity";
import { DateUtils } from "@lib/utils/DateUtils";
import { IRepositoryClient } from "@lib/repository/IRepositoryClient";
import { PgRepository } from "./PgRepository";
import { PgDmlBuilder } from "./PgDmlBuilder";
import { ISelectBuilder } from "@lib/repository/query/ISelectBuilder";
import { LEVEL_LOG_DB } from "@lib/repository/IConfigRepository";
import { IRepository } from "@lib/repository/IRepository";

export class PgRepositoryClient implements IRepositoryClient {
    repository: IRepository;
    inTransaction: boolean;
    dbClient: PoolClient;

    async connect(): Promise<void> {
        this.dbClient = await (this.repository as unknown as PgRepository).db.connect();
        this.inTransaction = false;
    }

    async disconnect(): Promise<void> {
        this.dbClient.release();
    }

    async beginTransaction(): Promise<void> {
        if (this.inTransaction) {
            throw "Conexão já esta em transação.";
        }

        if (this.repository.config.levelLog != LEVEL_LOG_DB.NONE) console.time("BEGIN");
        await this.dbClient.query("BEGIN");
        if (this.repository.config.levelLog != LEVEL_LOG_DB.NONE) console.timeEnd("BEGIN");
        this.inTransaction = true;
    }

    async commit(): Promise<void> {
        if (!this.inTransaction) {
            throw "Conexão não está em transação.";
        }

        if (this.repository.config.levelLog != LEVEL_LOG_DB.NONE) console.time("COMMIT");
        await this.dbClient.query("COMMIT");
        if (this.repository.config.levelLog != LEVEL_LOG_DB.NONE) console.timeEnd("COMMIT");
        this.inTransaction = false;
    }

    async rollback(): Promise<void>{
        if (!this.inTransaction) {
            throw "Conexão não está em transação.";
        }

        if (this.repository.config.levelLog != LEVEL_LOG_DB.NONE) console.time("ROLLBACK");
        await this.dbClient.query("ROLLBACK");
        if (this.repository.config.levelLog != LEVEL_LOG_DB.NONE) console.timeEnd("ROLLBACK");
        this.inTransaction = false;
    }

    async generateId(entity: IEntity, field?: String): Promise<Object> {
        let fieldAutoGenerate = null;

        if (field) 
            fieldAutoGenerate = entity.getField(field);
        else 
            fieldAutoGenerate = entity.getFieldAutoGenerate();

        const sql = "select nextval('" + entity.schema + "." + entity.name + "_" + fieldAutoGenerate.name + "_seq'::regclass)";
        const value = await this.executeSqlDirect(sql);       

        return value;
    }

    async executeSql(sql: string, values?: Object[]): Promise<Object[]> {
        let startTime = new Date();

        if (this.repository.config.levelLog != LEVEL_LOG_DB.NONE) {            
            console.time("QUERY");
            console.log("SQL:", sql);
            if (values) console.log("Params:", values);

            if (this.repository.config.levelLog === LEVEL_LOG_DB.ANALYTIC) {
                console.log("Start time:", DateUtils.getDateTimeAnsi(startTime));
            }
        }    

        const result = await this.dbClient.query(sql, values);
        const finishTime = new Date();        

        if (this.repository.config.levelLog != LEVEL_LOG_DB.NONE) {
            console.log("Rows:", result.rowCount);
            if (this.repository.config.levelLog === LEVEL_LOG_DB.ANALYTIC) { 
                console.log("Finish Time:", DateUtils.getDateTimeAnsi(finishTime));                
            }
            console.timeEnd("QUERY");
            console.log("-----------------------------");
        }

        if (result.rowCount > 0) {
            return result.rows;
        }

        return [];
    }

    async executeSqlDirect(sql: string, values?: Object[]): Promise<Object> {
        const result = await this.executeSql(sql, values);       

        if (result.length > 0) {
            for (const field in result[0])
                return result[0][field];
        }

        return null;
    }

    async create(entity: IEntity, data: Object): Promise<Object> {
        if (!this.inTransaction) {
            throw "Conexão não está em transação.";
        }

        //Auto generate ids
        const fieldAutoGenerates = entity.getFieldAutoGenerate();

        for (const idx in fieldAutoGenerates) {
            const field = fieldAutoGenerates[idx];

            if ((field !== null) && (data[field.name] == undefined || data[field.name] == null)) {
                const autoGenerate = await this.generateId(entity, field.name);
                data[field.name] = autoGenerate;
            }
        }

        // Insert
        const dmlBuilder = new PgDmlBuilder();
        const { sql, values } = dmlBuilder.getSqlInsert(entity, data);

        return await this.executeSql(sql, values);
    }

    async createBulk(entity: IEntity, data: Object[]): Promise<Object[]> {
        if (!this.inTransaction) {
            throw "Conexão não está em transação.";
        }

        throw new Error("Method not implemented.");
    }

    async update(entity: IEntity, data: Object, where: Object): Promise<Object[]> {
        if (!this.inTransaction) {
            throw "Conexão não está em transação.";
        }

        // Update
        const dmlBuilder = new PgDmlBuilder();
        const { sql, values } = dmlBuilder.getSqlUpdate(entity, data, where);

        return await this.executeSql(sql, values);
    }

    async delete(entity: IEntity, where: Object): Promise<Object[]> {
        if (!this.inTransaction) {
            throw "Conexão não está em transação.";
        }

        // Delete
        const dmlBuilder = new PgDmlBuilder();
        const { sql, values } = dmlBuilder.getSqlDelete(entity, where);

        return await this.executeSql(sql, values);
    }

    async select(select: ISelectBuilder): Promise<Object[]> {
        const { sql, values } = select.getSql();
        return await this.executeSql(sql, values);
    }
}
