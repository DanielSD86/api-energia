import { AbstractLayerController } from "@lib/layers/controller/AbstractLayerController";
import { IProjetosInversoresController } from "../IProjetosInversoresController";
import { ProjetosInversoresService } from "./ProjetosInversoresService";
export class ProjetosInversoresController extends AbstractLayerController implements IProjetosInversoresController {
    static instance: ProjetosInversoresController;
    constructor() {
        super(ProjetosInversoresService.getInstance());
    }
    static getInstance(): ProjetosInversoresController {
        if (!ProjetosInversoresController.instance) {
            ProjetosInversoresController.instance = new ProjetosInversoresController();
        }
        return ProjetosInversoresController.instance;
    }
}
