import { Request, Response } from "express";
import { IDataRequest, IResultAdapter } from "../IAdapter";
import { RESPONSE_STATUS } from "./LayerControllerTypes";
import { LayerControllerUtils } from "./LayerControllerUtils";

export abstract class AbstractLayerControllerProcess {    
    async getDataRequest(request: Request, forceMaxRecordsRequest: boolean): Promise<IDataRequest> {
        const data = await LayerControllerUtils.getData(request);
        const condition = await LayerControllerUtils.getCondition(request);
        const session = await LayerControllerUtils.getSession(request);
        const options = await LayerControllerUtils.getOptions(request, forceMaxRecordsRequest);

        return { data, session, condition, options };
    }

    async getDataResponse(response: IResultAdapter, dataRequest: IDataRequest): Promise<any> {
        const rowsResult = response.data;
        const infoRows = response.dataInfo;

        //console.log(response.dataInfo, dataRequest.options, dataRequest.options.limit);

        if (!response.dataInfo || !dataRequest.options || !dataRequest.options.limit) {
            if (response.data.length === 1)
                return rowsResult[0];

            return rowsResult;
        }

        return { 
            rows: rowsResult,
            infoRows
        };
    }

    async executeDataRequest(method: (dataResquest: IDataRequest) => Promise<IResultAdapter>, statusSucess: RESPONSE_STATUS, statusUnsucess: RESPONSE_STATUS, 
        dataRequest: IDataRequest, response: Response) {
        try {
            const resultController = await method(dataRequest);

            if (!resultController.status)
                return response
                    .status(statusUnsucess)
                    .json({ message: resultController.message });

            const dataResponse = await this.getDataResponse(resultController, dataRequest);

            return response.status(statusSucess).json(dataResponse);
        } catch (e) {
            console.error(e);         

            return response.status(RESPONSE_STATUS.ERROR).json({
                message: [e.message],
            });
        }
    }

    async executeRequest(method: (dataResquest: IDataRequest) => Promise<IResultAdapter>, 
        statusSucess: RESPONSE_STATUS, 
        statusUnsucess: RESPONSE_STATUS,
        request: Request, 
        response: Response,
        forceMaxRecordsRequest: boolean) {
        const dataRequest = await this.getDataRequest(request, forceMaxRecordsRequest);
        return this.executeDataRequest(method, statusSucess, statusUnsucess, dataRequest, response);
    }
}
