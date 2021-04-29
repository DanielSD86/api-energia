import { IEntity } from "@lib/entity/IEntity";
import { IField } from "@lib/entity/IField";
import { IRepositoryClient } from "./IRepositoryClient";

export interface IRepositoryDomain {
    repositoryClient: IRepositoryClient;

    getTables(): Promise<Object[]>;
    getFields(): Promise<Object[]>;
    getIndexes(): Promise<Object[]>;

    createTableIfNotExists(entity: IEntity): Promise<void>;
    createFieldIfNotExists(entity: IEntity, field: IField): Promise<void>;
    
    createIndexIfNotExists(entity: IEntity): Promise<void>;
    createForeignKeyIfNotExists(entity: IEntity): Promise<void>;
    createCheckConstraintIfNotExists(entity: IEntity): Promise<void>;

    loadDomain(): Promise<void>;
    getFieldType(field: IField): string;

    setRepositoryClient(repositoryClient: IRepositoryClient): void;
}
