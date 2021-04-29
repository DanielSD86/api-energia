import { AbstractLayerService } from "@lib/layers/service/AbstractLayerService";
import { IProjetosInversoresService } from "../IProjetosInversoresService";
import { ProjetosInversoresBusiness } from "./ProjetosInversoresBusiness";
export class ProjetosInversoresService extends AbstractLayerService implements IProjetosInversoresService {
    static instance: ProjetosInversoresService;
    constructor() {
        super(ProjetosInversoresBusiness.getInstance());
    }
    static getInstance(): ProjetosInversoresService {
        if (!ProjetosInversoresService.instance) {
            ProjetosInversoresService.instance = new ProjetosInversoresService();
        }
        return ProjetosInversoresService.instance;
    }
}
