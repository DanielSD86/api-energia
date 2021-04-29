import { ProdutosDom } from "./ProdutosDom";

export interface InversoresModulosDom extends ProdutosDom {
    modulos?: { 
        modulo: ProdutosDom, 
        quantidade: number 
    }[];
}

export interface InversoresProjetoDom {
    inversor: ProdutosDom, 
    quantidade: number,
    modulo: ProdutosDom,
}

export interface ModulosProjetoDom {
    modulo: ProdutosDom, 
    quantidade: number
}