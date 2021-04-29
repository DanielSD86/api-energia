import { IRepositoryClient } from "@lib/repository/IRepositoryClient";
import { IDataRequest, IResultAdapter } from "../IAdapter";
import { ILayerRepository } from "../repository/ILayerRepository";
import { IAssociateBusiness, OPERATION_BUSINESS, TYPE_ASSOCIATE } from "./LayerBusinessTypes";

export interface ILayerBusiness {
    layerRepository: ILayerRepository;
    associateBusiness: IAssociateBusiness[];

    setAssociateBusiness(name: string, business: ILayerBusiness, type?: TYPE_ASSOCIATE, ignoreFieldsOnValidate?: string[]): void;
    getAssociateBusiness(name: string): IAssociateBusiness;

    find(repositoryClient: IRepositoryClient, dataRequest: IDataRequest, nameOperation?: string): Promise<IResultAdapter>;

    findAll(repositoryClient: IRepositoryClient, dataRequest: IDataRequest): Promise<IResultAdapter>;
    findById(repositoryClient: IRepositoryClient, dataRequest: IDataRequest): Promise<IResultAdapter>;
    findByBusiness(repositoryClient: IRepositoryClient, dataRequest: IDataRequest): Promise<IResultAdapter>;

    create(repositoryClient: IRepositoryClient, dataRequest: IDataRequest): Promise<IResultAdapter>;
    update(repositoryClient: IRepositoryClient, dataRequest: IDataRequest): Promise<IResultAdapter>;
    delete(repositoryClient: IRepositoryClient, dataRequest: IDataRequest): Promise<IResultAdapter>;
    disable(repositoryClient: IRepositoryClient, dataRequest: IDataRequest): Promise<IResultAdapter>;

    fillDefaultValues(repositoryClient: IRepositoryClient, dataRequest: IDataRequest, operation: OPERATION_BUSINESS, nameOperation?: string): Promise<void>;
    validate(repositoryClient: IRepositoryClient, dataRequest: IDataRequest, operation: OPERATION_BUSINESS, nameOperation?: string): Promise<IResultAdapter>;
    persist(repositoryClient: IRepositoryClient, dataRequest: IDataRequest, operation: OPERATION_BUSINESS): Promise<IResultAdapter>;    
}
