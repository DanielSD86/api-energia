import { IDataRequest, IResultAdapter } from "@lib/layers/IAdapter";
import { AbstractLayerServiceProcess } from "@lib/layers/service/AbstractLayerServiceProcess";
import { IInversorService } from "../IInversorService";
import { InversorBusiness } from "./InversorBusiness";
export class InversorService extends AbstractLayerServiceProcess implements IInversorService {
    static instance: InversorService;
    static getInstance(): InversorService {
        if (!InversorService.instance) {
            InversorService.instance = new InversorService();
        }
        return InversorService.instance;
    }
    inversor = async (dataRequest: IDataRequest): Promise<IResultAdapter> => {
        return await this.executeReadOnlyProcess(InversorBusiness.getInstance(), dataRequest);
    }
}
