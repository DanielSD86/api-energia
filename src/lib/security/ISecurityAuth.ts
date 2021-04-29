import { NextFunction, Request, Response } from "express";
import { IDataSecurityAuth, IConfigSecurityAuth } from "./IConfigSecurityAuth";

export interface ISecurityAuth{
    config: IConfigSecurityAuth;

    generateToken(data: object): Promise<string>;
    decodeToken(token: string): Promise<IDataSecurityAuth>;
    
    validateAuthController(request: Request, response: Response, next: NextFunction);
}