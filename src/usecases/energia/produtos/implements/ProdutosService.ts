import { IDataRequest, IResultAdapter } from "@lib/layers/IAdapter";
import { AbstractLayerService } from "@lib/layers/service/AbstractLayerService";
import { IProdutosService } from "../IProdutosService";
import { ProdutosBusiness } from "./ProdutosBusiness";
import { ProdutosMergeListProcess } from "./ProdutosMergeListProcess";

export class ProdutosService extends AbstractLayerService implements IProdutosService {
    static instance: ProdutosService;

    constructor() {
        super(ProdutosBusiness.getInstance());
    }    

    static getInstance(): ProdutosService {
        if (!ProdutosService.instance) {
            ProdutosService.instance = new ProdutosService();
        }
        return ProdutosService.instance;
    }

    createOrUpdateList = async(dataResquest: IDataRequest): Promise<IResultAdapter> => {
        return await this.executeTransactionProcess(ProdutosMergeListProcess.getInstance(), dataResquest);
    }
}
