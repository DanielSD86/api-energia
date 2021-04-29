import { AbstractLayerController } from "@lib/layers/controller/AbstractLayerController";
import { IProdutosController } from "../IProdutosController";
import { ProdutosService } from "./ProdutosService";
export class ProdutosController extends AbstractLayerController implements IProdutosController {
    static instance: ProdutosController;
    constructor() {
        super(ProdutosService.getInstance());
    }
    static getInstance(): ProdutosController {
        if (!ProdutosController.instance) {
            ProdutosController.instance = new ProdutosController();
        }
        return ProdutosController.instance;
    }
}
