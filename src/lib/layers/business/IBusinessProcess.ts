import { IRepositoryClient } from "@lib/repository/IRepositoryClient";
import { IDataRequest, IResultAdapter } from "../IAdapter";

export interface IBusinessProcess {
    fill(repositoryClient: IRepositoryClient, dataRequest: IDataRequest): Promise<void>;
    validate(repositoryClient: IRepositoryClient, dataRequest: IDataRequest): Promise<IResultAdapter>;
    execute(repositoryClient: IRepositoryClient, dataRequest: IDataRequest): Promise<IResultAdapter>;
}
