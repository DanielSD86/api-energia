import { IDataRequest, IResultAdapter } from "@lib/layers/IAdapter";
import { AbstractLayerServiceProcess } from "@lib/layers/service/AbstractLayerServiceProcess";
import { IProjetoInversorService } from "../IProjetoInversorService";
import { ProjetoInversorBusiness } from "./ProjetoInversorBusiness";

export class ProjetoInversorService extends AbstractLayerServiceProcess implements IProjetoInversorService {
    static instance: ProjetoInversorService;
    
    static getInstance(): ProjetoInversorService {
        if (!ProjetoInversorService.instance) {
            ProjetoInversorService.instance = new ProjetoInversorService();
        }
        return ProjetoInversorService.instance;
    }

    projetoInversor = async (dataRequest: IDataRequest): Promise<IResultAdapter> => {
        return await this.executeTransactionProcess(ProjetoInversorBusiness.getInstance(), dataRequest);
    }
}
