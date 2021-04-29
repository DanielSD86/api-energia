import { Produtos } from "@entities/energia/Produtos";
import { AbstractLayerRepository } from "@lib/layers/repository/AbstractLayerRepository";
import { IProdutosRepository } from "../IProdutosRepository";
export class ProdutosRepository extends AbstractLayerRepository implements IProdutosRepository {
    static instance: ProdutosRepository;
    constructor() {
        super(Produtos.getInstance());
    }
    static getInstance(): ProdutosRepository {
        if (!ProdutosRepository.instance) {
            ProdutosRepository.instance = new ProdutosRepository();
        }
        return ProdutosRepository.instance;
    }
}
