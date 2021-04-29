import { Request, Response } from "express";
import { IProjetoInversorService } from "./IProjetoInversorService";

export interface IProjetoInversorController {
     service : IProjetoInversorService; 
     projetoInversor(request: Request, response: Response); 
}
