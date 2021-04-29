import { Request, Response } from "express";
import { ILayerService } from "../service/ILayerService";
import { AbstractLayerControllerProcess } from "./AbstractLayerControllerProcess";
import { ILayerController } from "./ILayerController";
import { RESPONSE_STATUS } from "./LayerControllerTypes";

export abstract class AbstractLayerController extends AbstractLayerControllerProcess implements ILayerController {
    service: ILayerService;
    isForceMaxRecorsRequest: boolean;

    constructor(service: ILayerService) {
        super();
        this.service = service;
        this.isForceMaxRecorsRequest = true;
    }

    findAll = async (request: Request, response: Response) => {
        return await this.executeRequest(
            this.service.findAll,
            RESPONSE_STATUS.OK,
            RESPONSE_STATUS.BAD_REQUEST,
            request,
            response,
            true
        );
    };

    findById = async (request: Request, response: Response) => {
        return await this.executeRequest(
            this.service.findById,
            RESPONSE_STATUS.OK,
            RESPONSE_STATUS.BAD_REQUEST,
            request,
            response,
            false
        );
    };

    create = async (request: Request, response: Response) => {
        return await this.executeRequest(
            this.service.create,
            RESPONSE_STATUS.CREATED,
            RESPONSE_STATUS.BAD_REQUEST,
            request,
            response,
            false
        );
    };

    update = async (request: Request, response: Response) => {
        return await this.executeRequest(
            this.service.update,
            RESPONSE_STATUS.OK,
            RESPONSE_STATUS.BAD_REQUEST,
            request,
            response,
            false
        );
    };

    delete = async (request: Request, response: Response) => {
        return await this.executeRequest(
            this.service.delete,
            RESPONSE_STATUS.OK,
            RESPONSE_STATUS.BAD_REQUEST,
            request,
            response,
            false
        );
    };

    disable = async (request: Request, response: Response) => {
        return await this.executeRequest(
            this.service.disable,
            RESPONSE_STATUS.OK,
            RESPONSE_STATUS.BAD_REQUEST,
            request,
            response,
            false
        );
    };
}
