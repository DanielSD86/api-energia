import { FIELD_ID_URL } from "@lib/entity/EntityConsts";
import express from "express";
import { ProjetosController } from "./ProjetosController";

export function RouterProjetos() {
    const router = express.Router();
    const controller = ProjetosController.getInstance();

    router.get("/", controller.findAll);
    router.get("/:" + FIELD_ID_URL, controller.findById);

    return router;
}
