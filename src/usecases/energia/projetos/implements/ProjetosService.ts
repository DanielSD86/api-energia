import { AbstractLayerService } from "@lib/layers/service/AbstractLayerService";
import { IProjetosService } from "../IProjetosService";
import { ProjetosBusiness } from "./ProjetosBusiness";
export class ProjetosService extends AbstractLayerService implements IProjetosService {
    static instance: ProjetosService;
    constructor() {
        super(ProjetosBusiness.getInstance());
    }
    static getInstance(): ProjetosService {
        if (!ProjetosService.instance) {
            ProjetosService.instance = new ProjetosService();
        }
        return ProjetosService.instance;
    }
}
