import { IBusinessProcess } from "@lib/layers/business/IBusinessProcess";
export class InversorBusiness implements IBusinessProcess {
    static instance: InversorBusiness;
    static getInstance(): InversorBusiness {
        if (!InversorBusiness.instance) {
            InversorBusiness.instance = new InversorBusiness();
        }
        return InversorBusiness.instance;
    }
}
