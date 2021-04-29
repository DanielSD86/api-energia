import { AbstractLayerControllerProcess } from "@lib/layers/controller/AbstractLayerControllerProcess";
import { IInversorController } from "../IInversorController";
import { InversorService } from "./InversorService";
import { IInversorService } from "../IInversorService";
import { RESPONSE_STATUS } from "@lib/layers/controller/LayerControllerTypes";
import { Request, Response } from "express";
export class InversorController extends AbstractLayerControllerProcess implements IInversorController {
     service : IInversorService; 
     static instance: InversorController;
     constructor() {
         super();
         this.service = InversorService.getInstance();
     }
     static getInstance(): InversorController {
         if (!InversorController.instance) {
             InversorController.instance = new InversorController();
         }
         return InversorController.instance;
     }
     inversor = async (request: Request, response: Response) => {
         return await this.executeRequest(
             this.service.inversor,
             RESPONSE_STATUS.OK,
             RESPONSE_STATUS.BAD_REQUEST,
             request,
             response,
             false);
    }
}
