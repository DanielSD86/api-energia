import { IDataRequest, IResultAdapter } from "@lib/layers/IAdapter";
import { AbstractLayerServiceProcess } from "@lib/layers/service/AbstractLayerServiceProcess";
import { ICalcularInversoresProjetoService } from "../ICalcularInversoresProjetoService";
import { CalcularInversoresProjetoBusiness } from "./CalcularInversoresProjetoBusiness";

export class CalcularInversoresProjetoService extends AbstractLayerServiceProcess implements ICalcularInversoresProjetoService {
    static instance: CalcularInversoresProjetoService;
    
    static getInstance(): CalcularInversoresProjetoService {
        if (!CalcularInversoresProjetoService.instance) {
            CalcularInversoresProjetoService.instance = new CalcularInversoresProjetoService();
        }
        return CalcularInversoresProjetoService.instance;
    }

    calcularInversoresProjeto = async (dataRequest: IDataRequest): Promise<IResultAdapter> => {
        return await this.executeTransactionProcess(CalcularInversoresProjetoBusiness.getInstance(), dataRequest);
    }
}
