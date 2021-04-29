import express from "express";
import { ProjetosController } from "./ProjetosController";

export function RouterProjetos() {
    const router = express.Router();
    const controller = ProjetosController.getInstance();

    router.get("/", controller.findAll);
    router.get("/:id", controller.findById);
    router.post("/", controller.create);
    router.put("/:id", controller.update);
    router.delete("/:id", controller.disable);

    return router;
}
