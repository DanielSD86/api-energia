import { ILayerBusiness } from "../business/ILayerBusiness";
import { IDataRequest, IResultAdapter } from "../IAdapter";

export interface ILayerService {
    business: ILayerBusiness;

    findAll(dataResquest: IDataRequest): Promise<IResultAdapter>;
    findById(dataResquest: IDataRequest): Promise<IResultAdapter>;
    
    create(dataResquest: IDataRequest): Promise<IResultAdapter>;
    update(dataResquest: IDataRequest): Promise<IResultAdapter>;
    delete(dataResquest: IDataRequest): Promise<IResultAdapter>;
    disable(dataResquest: IDataRequest): Promise<IResultAdapter>;
}
