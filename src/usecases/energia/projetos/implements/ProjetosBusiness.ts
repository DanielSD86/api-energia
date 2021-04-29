import { AbstractLayerBusiness } from "@lib/layers/business/AbstractLayerBusiness";
import { ProjetosRepository } from "./ProjetosRepository";
import { IProjetosBusiness } from "../IProjetosBusiness";
import { ProjetosInversoresBusiness } from "@usecases/energia/projetosInversores/implements/ProjetosInversoresBusiness";
import { TYPE_ASSOCIATE } from "@lib/layers/business/LayerBusinessTypes";

export class ProjetosBusiness extends AbstractLayerBusiness implements IProjetosBusiness {
    static instance: ProjetosBusiness;
    
    constructor() {
        super(ProjetosRepository.getInstance());
        this.setAssociateBusiness("inversores", ProjetosInversoresBusiness.getInstance(), TYPE_ASSOCIATE.ONE_TO_MORE);
    }

    static getInstance(): ProjetosBusiness {
        if (!ProjetosBusiness.instance) {
            ProjetosBusiness.instance = new ProjetosBusiness();
        }
        return ProjetosBusiness.instance;
    }
}
