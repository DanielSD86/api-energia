import express from "express";
import { IProjetoInversorController } from "../IProjetoInversorController";
import { ProjetoInversorController } from "./ProjetoInversorController";

export function RouterProjetoInversor() {
    const router = express.Router();
    const controller: IProjetoInversorController = ProjetoInversorController.getInstance();

    router.post("/calcular", controller.projetoInversor);
    
    return router;
}
