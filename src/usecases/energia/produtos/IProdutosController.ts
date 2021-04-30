import { ILayerController } from "@lib/layers/controller/ILayerController";
import { Request, Response } from "express";

export interface IProdutosController extends ILayerController { 
    createOrUpdateList(request: Request, response: Response);
}
