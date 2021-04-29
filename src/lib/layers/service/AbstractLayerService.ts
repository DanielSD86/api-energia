import { IRepositoryClient } from "@lib/repository/IRepositoryClient";
import { RepositoryService } from "@services/RepositoryService";
import { ILayerBusiness } from "../business/ILayerBusiness";
import { IDataRequest, IResultAdapter } from "../IAdapter";
import { AbstractLayerServiceProcess } from "./AbstractLayerServiceProcess";
import { ILayerService } from "./ILayerService";

export abstract class AbstractLayerService extends AbstractLayerServiceProcess implements ILayerService {
    business: ILayerBusiness;

    constructor(business: ILayerBusiness) {
        super();
        this.business = business;
    }
    
    async executeTransactionRepository(method: (repositoryClient: IRepositoryClient, dataRequest: IDataRequest) => Promise<IResultAdapter>, dataRequest: IDataRequest): Promise<IResultAdapter> {
        const repository = await RepositoryService();
        const repositoryClient = await repository.getClient(true);

        await repositoryClient.beginTransaction();

        try {          
            const resultService = await method(repositoryClient, dataRequest);

            await repositoryClient.commit();

            return resultService;
        } catch (e) {
            await repositoryClient.rollback();
            throw e
        } finally {
            await repositoryClient.disconnect();
        }
    }

    async executeReadOnlyRepository(method: (repositoryClient: IRepositoryClient, dataRequest: IDataRequest) => Promise<IResultAdapter>, dataRequest: IDataRequest): Promise<IResultAdapter> {
        const repository = await RepositoryService();
        const repositoryClient = await repository.getClient(true);

        try {            
            const resultService = await method(repositoryClient, dataRequest);

            return resultService;
        } catch (e) {
            throw e
        } finally {
            await repositoryClient.disconnect();
        }
    }

    async executeCache(method: (repositoryClient: IRepositoryClient, dataRequest: IDataRequest) => Promise<IResultAdapter>, dataRequest: IDataRequest): Promise<IResultAdapter> {
        try {
            const resultService = await method(null, dataRequest);
            return resultService;
        } catch (e) {
            throw e
        }
    }

    findAll = async (dataRequest: IDataRequest): Promise<IResultAdapter> => {
        return await this.executeReadOnlyRepository(this.business.findAll, dataRequest);
    }
    
    findById = async (dataRequest: IDataRequest): Promise<IResultAdapter> => {
        return await this.executeReadOnlyRepository(this.business.findById, dataRequest);
    }
    
    create = async (dataRequest: IDataRequest): Promise<IResultAdapter> => {
        return await this.executeTransactionRepository(this.business.create, dataRequest);
    }
    
    update = async (dataRequest: IDataRequest): Promise<IResultAdapter> => {
        return await this.executeTransactionRepository(this.business.update, dataRequest);
    }
    
    delete = async (dataRequest: IDataRequest): Promise<IResultAdapter> => {
        return await this.executeTransactionRepository(this.business.delete, dataRequest);
    }

    disable = async (dataRequest: IDataRequest): Promise<IResultAdapter> => {
        return await this.executeTransactionRepository(this.business.disable, dataRequest);
    }
}
