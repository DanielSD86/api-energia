import { IEntity } from "@lib/entity/IEntity";
import { IRepository } from "./IRepository";
import { ISelectBuilder } from "./query/ISelectBuilder";

export interface IRepositoryClient {
    repository: IRepository;
    inTransaction: boolean;

    connect(): Promise<void>;
    disconnect(): Promise<void>;

    executeSql(sql: string, values?: Object[]): Promise<Object[]>;
    executeSqlDirect(sql: string, values?: Object[]): Promise<Object>;

    beginTransaction(): Promise<void>;
    commit(): Promise<void>;
    rollback(): Promise<void>;

    generateId(entity: IEntity, field?: String): Promise<Object>;

    create(entity: IEntity, data: Object): Promise<Object>;
    createBulk(entity: IEntity, data: Object[]): Promise<Object[]>;
    update(entity: IEntity, data: Object, where: Object): Promise<Object[]>;
    delete(entity: IEntity, where: Object): Promise<Object[]>;

    select(select: ISelectBuilder): Promise<Object[]>;
}
