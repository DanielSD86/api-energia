import { AbstractLayerBusiness } from "@lib/layers/business/AbstractLayerBusiness";
import { ProjetosInversoresRepository } from "./ProjetosInversoresRepository";
import { IProjetosInversoresBusiness } from "../IProjetosInversoresBusiness";
export class ProjetosInversoresBusiness extends AbstractLayerBusiness implements IProjetosInversoresBusiness {
    static instance: ProjetosInversoresBusiness;
    constructor() {
        super(ProjetosInversoresRepository.getInstance());
    }
    static getInstance(): ProjetosInversoresBusiness {
        if (!ProjetosInversoresBusiness.instance) {
            ProjetosInversoresBusiness.instance = new ProjetosInversoresBusiness();
        }
        return ProjetosInversoresBusiness.instance;
    }
}
