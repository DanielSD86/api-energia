import { RouterProdutos } from "@usecases/energia/produtos/implements/ProdutosRouter";
import { RouterProjetoInversor } from "@usecases/energia/projetoInversor/implements/ProjetoInversorRouter";
import { RouterProjetos } from "@usecases/energia/projetos/implements/ProjetosRouter";
import { Router } from "express";

export interface IRouter {
    path: string;
    router: Router;
}

export function ConfigRouter(): IRouter[] {
    const router = [];

    // Energia
    router.push({ path: "/energia/projetosinversores", router: RouterProjetoInversor() });
    router.push({ path: "/energia/projetos", router: RouterProjetos() });
    router.push({ path: "/energia/produtos", router: RouterProdutos() });

    return router;
}