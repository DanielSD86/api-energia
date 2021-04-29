import IConfigRepository from "./IConfigRepository";
import { IRepositoryClient } from "./IRepositoryClient";
import { IRepositoryDomain } from "./IRepositoryDomain";
import { ISelectBuilder } from "./query/ISelectBuilder";

export const REPOSITORY_NOT_DEFINED = "Repository não definido.";

export interface IRepository {
    config: IConfigRepository;

    getClient(autoConnect: boolean): Promise<IRepositoryClient>;

    getBuilder(): ISelectBuilder;
    getBuilderDomain(): IRepositoryDomain;
}
