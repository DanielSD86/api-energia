import { IDataRequest, IResultAdapter } from "@lib/layers/IAdapter";
export interface IInversorService {
     inversor(dataRequest: IDataRequest): Promise<IResultAdapter>; 
}
