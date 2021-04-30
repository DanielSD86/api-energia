import { FIELD_ID_URL } from "@lib/entity/EntityConsts";
import express from "express";
import { ProdutosController } from "./ProdutosController";

export function RouterProdutos() {
    const router = express.Router();
    const controller = ProdutosController.getInstance();
    
    router.get("/", controller.findAll);
    router.get("/:" + FIELD_ID_URL, controller.findById);
    router.post("/list", controller.createOrUpdateList);
    //router.post("/", controller.create);
    router.put("/:" + FIELD_ID_URL, controller.update);
    router.delete("/:" + FIELD_ID_URL, controller.disable);

    return router;
}
