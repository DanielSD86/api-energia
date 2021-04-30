import { FIELD_ID_URL } from "@lib/entity/EntityConsts";
import express from "express";
import { ProjetosInversoresController } from "./ProjetosInversoresController";

export function RouterProjetosInversores() {
    const router = express.Router();
    const controller = ProjetosInversoresController.getInstance();

    router.get("/", controller.findAll);
    router.get("/:" + FIELD_ID_URL, controller.findById);
    router.post("/", controller.create);
    router.put("/:" + FIELD_ID_URL, controller.update);
    router.delete("/:" + FIELD_ID_URL, controller.disable);

    return router;
}
