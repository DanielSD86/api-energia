import { AbstractLayerController } from "@lib/layers/controller/AbstractLayerController";
import { RESPONSE_STATUS } from "@lib/layers/controller/LayerControllerTypes";
import { Request, Response } from "express";
import { IProdutosController } from "../IProdutosController";
import { ProdutosService } from "./ProdutosService";

export class ProdutosController extends AbstractLayerController implements IProdutosController {
    static instance: ProdutosController;

    constructor() {
        super(ProdutosService.getInstance());
        this.isForceMaxRecorsRequest = false;
    }

    static getInstance(): ProdutosController {
        if (!ProdutosController.instance) {
            ProdutosController.instance = new ProdutosController();
        }
        return ProdutosController.instance;
    }

    createOrUpdateList = async (request: Request, response: Response) => {
        return await this.executeRequest(
            (this.service as ProdutosService).createOrUpdateList,
            RESPONSE_STATUS.OK,
            RESPONSE_STATUS.BAD_REQUEST,
            request,
            response,
            false
        );
    };
}
