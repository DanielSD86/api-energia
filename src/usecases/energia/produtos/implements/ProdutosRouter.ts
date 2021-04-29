import express from "express";
import { ProdutosController } from "./ProdutosController";

export function RouterProdutos() {
    const router = express.Router();
    const controller = ProdutosController.getInstance();
    
    router.get("/", controller.findAll);
    router.get("/:id", controller.findById);
    router.post("/", controller.create);
    router.put("/:id", controller.update);
    router.delete("/:id", controller.disable);

    return router;
}
