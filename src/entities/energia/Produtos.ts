import { AbstractEntity } from "@lib/entity/AbstractEntity";
import { TYPE_CASE } from "@lib/entity/EntityConsts";

export enum TIPO_PRODUTO {
    MODULO = "modulo",
    INVERSOR = "inversor",
}

export class Produtos extends AbstractEntity {
    static instance: Produtos;

    static ID = "id";
    static NOME = "nome";
    static POTENCIA = "potencia";
    static TIPO = "tipo";
    
    constructor() {
        super("energia", "produtos");

        this.addFieldId(Produtos.ID);
        this.addFieldText(Produtos.NOME, "nome", 100);
        this.addFieldDecimal(Produtos.POTENCIA, "potencia", 10, 1);
        this.addFieldCheckText(Produtos.TIPO, "tipo", TIPO_PRODUTO, 20, String(TIPO_PRODUTO.MODULO), TYPE_CASE.LOWER);
    }

    static getInstance(): Produtos {
        if (!Produtos.instance) {
            Produtos.instance = new Produtos();
        }
        return Produtos.instance;
    }
}
