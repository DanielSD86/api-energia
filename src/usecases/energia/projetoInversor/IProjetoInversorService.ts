import { IDataRequest, IResultAdapter } from "@lib/layers/IAdapter";

export interface IProjetoInversorService {
     projetoInversor(dataRequest: IDataRequest): Promise<IResultAdapter>; 
}
