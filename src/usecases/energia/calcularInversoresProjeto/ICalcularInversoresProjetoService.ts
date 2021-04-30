import { IDataRequest, IResultAdapter } from "@lib/layers/IAdapter";

export interface ICalcularInversoresProjetoService {
     calcularInversoresProjeto(dataRequest: IDataRequest): Promise<IResultAdapter>; 
}
