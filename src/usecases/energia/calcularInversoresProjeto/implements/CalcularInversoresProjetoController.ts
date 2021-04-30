import { AbstractLayerControllerProcess } from "@lib/layers/controller/AbstractLayerControllerProcess";
import { ICalcularInversoresProjetoController } from "../ICalcularInversoresProjetoController";
import { CalcularInversoresProjetoService } from "./CalcularInversoresProjetoService";
import { ICalcularInversoresProjetoService } from "../ICalcularInversoresProjetoService";
import { RESPONSE_STATUS } from "@lib/layers/controller/LayerControllerTypes";
import { Request, Response } from "express";

export class CalcularInversoresProjetoController extends AbstractLayerControllerProcess implements ICalcularInversoresProjetoController {
     service : ICalcularInversoresProjetoService; 
     static instance: CalcularInversoresProjetoController;
     
     constructor() {
         super();
         this.service = CalcularInversoresProjetoService.getInstance();
     }
     
     static getInstance(): CalcularInversoresProjetoController {
         if (!CalcularInversoresProjetoController.instance) {
             CalcularInversoresProjetoController.instance = new CalcularInversoresProjetoController();
         }
         return CalcularInversoresProjetoController.instance;
     }

     calcularInversoresProjeto = async (request: Request, response: Response) => {
         return await this.executeRequest(
             this.service.calcularInversoresProjeto,
             RESPONSE_STATUS.OK,
             RESPONSE_STATUS.BAD_REQUEST,
             request,
             response,
             false);
    }
}
