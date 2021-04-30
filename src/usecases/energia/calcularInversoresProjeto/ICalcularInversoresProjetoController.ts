import { Request, Response } from "express";
import { ICalcularInversoresProjetoService } from "./ICalcularInversoresProjetoService";

export interface ICalcularInversoresProjetoController {
     service : ICalcularInversoresProjetoService; 
     calcularInversoresProjeto(request: Request, response: Response); 
}
