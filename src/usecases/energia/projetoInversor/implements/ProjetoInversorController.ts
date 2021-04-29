import { AbstractLayerControllerProcess } from "@lib/layers/controller/AbstractLayerControllerProcess";
import { IProjetoInversorController } from "../IProjetoInversorController";
import { ProjetoInversorService } from "./ProjetoInversorService";
import { IProjetoInversorService } from "../IProjetoInversorService";
import { RESPONSE_STATUS } from "@lib/layers/controller/LayerControllerTypes";
import { Request, Response } from "express";

export class ProjetoInversorController extends AbstractLayerControllerProcess implements IProjetoInversorController {
     service : IProjetoInversorService; 
     static instance: ProjetoInversorController;
     
     constructor() {
         super();
         this.service = ProjetoInversorService.getInstance();
     }
     
     static getInstance(): ProjetoInversorController {
         if (!ProjetoInversorController.instance) {
             ProjetoInversorController.instance = new ProjetoInversorController();
         }
         return ProjetoInversorController.instance;
     }

     projetoInversor = async (request: Request, response: Response) => {
         return await this.executeRequest(
             this.service.projetoInversor,
             RESPONSE_STATUS.OK,
             RESPONSE_STATUS.BAD_REQUEST,
             request,
             response,
             false);
    }
}
