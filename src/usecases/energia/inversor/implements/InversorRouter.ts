import express from "express";
import { InversorController } from "./InversorController";

export function RouterInversor() {
    const router = express.Router();
    const controller = InversorController.getInstance();
    router.get("/", controller.inversor);
    return router;
}
