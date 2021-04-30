import { IDataRequest, IResultAdapter } from "@lib/layers/IAdapter";
import { ILayerService } from "@lib/layers/service/ILayerService";

export interface IProdutosService extends ILayerService {
    createOrUpdateList(dataResquest: IDataRequest): Promise<IResultAdapter>;
}
