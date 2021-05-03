import { Pool, types } from "pg";

import { PgSelectBuilder } from "./PgSelectBuilder";
import { IRepositoryDomain } from "@lib/repository/IRepositoryDomain";
import { PgRepositoryDomain } from "./PgRepositoryDomain";
import { IRepositoryClient } from "@lib/repository/IRepositoryClient";
import { PgRepositoryClient } from "./PgRepositoryClient";
import IConfigRepository, { LEVEL_LOG_DB } from "@lib/repository/IConfigRepository";
import { IRepository } from "@lib/repository/IRepository";
import { ISelectBuilder } from "@lib/repository/query/ISelectBuilder";

export class PgRepository implements IRepository {
    static instance: PgRepository;

    db: Pool;
    config: IConfigRepository;

    static getInstance(config: IConfigRepository): PgRepository {
        if (!PgRepository.instance) {
            PgRepository.instance = new PgRepository(config);
        }
        return PgRepository.instance;
    }

    constructor(config: IConfigRepository) {
        this.config = config;

        if (this.config.levelLog != LEVEL_LOG_DB.NONE) console.time("CONEXAO");

        this.db = new Pool({
            connectionString: config.connectionString,
            application_name: config.applicationName,
            max: 20,
            idleTimeoutMillis: 30000,
            connectionTimeoutMillis: 2000,
        });
        if (this.config.levelLog != LEVEL_LOG_DB.NONE) console.timeEnd("CONEXAO");

        this.applyTypes();
    }

    applyTypes(): void {
        // Integer
        types.setTypeParser(20, parseInt);
        types.setTypeParser(23, parseInt);
        types.setTypeParser(1007, parseInt);
        types.setTypeParser(1016, parseInt);
        types.setTypeParser(1007, parseInt);
        // Decimal
        types.setTypeParser(700, parseFloat);
        types.setTypeParser(701, parseFloat);
        types.setTypeParser(1700, parseFloat);
        // Dates and Times
        types.setTypeParser(1114, function (value) {
            return (value.substring(0, 4) + "-" + value.substring(5, 7) + "-" + value.substring(8, 10) + " " + value.substring(11, 19));
        });
        types.setTypeParser(1082, function (value) {
            return (value.substring(0, 4) + "-" + value.substring(5, 7) + "-" + value.substring(8, 10));
        });
    }

    async getClient(autoConnect: boolean): Promise<IRepositoryClient> {     
        const repositoryClient = new PgRepositoryClient();
        repositoryClient.repository = this;

        if (autoConnect) {
            await repositoryClient.connect();
        }

        return repositoryClient;
    }

    getBuilder(): ISelectBuilder {
        return new PgSelectBuilder();
    }

    getBuilderDomain(): IRepositoryDomain {
        return new PgRepositoryDomain();
    }
}
