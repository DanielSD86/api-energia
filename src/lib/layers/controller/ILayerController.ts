import { Request, Response } from "express";
import { ILayerService } from "../service/ILayerService";

export interface ILayerController {
    service: ILayerService;

    findAll(request: Request, response: Response);
    findById(request: Request, response: Response);

    create(request: Request, response: Response);
    update(request: Request, response: Response);
    delete(request: Request, response: Response);
    disable(request: Request, response: Response);
}
