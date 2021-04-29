import { Request, Response } from "express";
import { IInversorService } from "./IInversorService";
export interface IInversorController {
     service : IInversorService; 
     inversor(request: Request, response: Response); 
}
