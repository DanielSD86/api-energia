import express from "express";
import { ICalcularInversoresProjetoController } from "../ICalcularInversoresProjetoController";
import { CalcularInversoresProjetoController } from "./CalcularInversoresProjetoController";

export function RouterProjetoInversor() {
    const router = express.Router();
    const controller: ICalcularInversoresProjetoController = CalcularInversoresProjetoController.getInstance();

    router.post("/calcular", controller.calcularInversoresProjeto);
    
    return router;
}
