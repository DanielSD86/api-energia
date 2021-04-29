import { AbstractLayerController } from "@lib/layers/controller/AbstractLayerController";
import { IProjetosController } from "../IProjetosController";
import { ProjetosService } from "./ProjetosService";
export class ProjetosController extends AbstractLayerController implements IProjetosController {
    static instance: ProjetosController;
    constructor() {
        super(ProjetosService.getInstance());
    }
    static getInstance(): ProjetosController {
        if (!ProjetosController.instance) {
            ProjetosController.instance = new ProjetosController();
        }
        return ProjetosController.instance;
    }
}
