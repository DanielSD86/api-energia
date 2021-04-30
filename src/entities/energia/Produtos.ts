import { AbstractEntity } from "@lib/entity/AbstractEntity";
import { TYPE_CASE } from "@lib/entity/EntityConsts";

export enum TIPO_PRODUTO {
    MODULO = "modulo",
    INVERSOR = "inversor",
}

export class Produtos extends AbstractEntity {
    static instance: Produtos;

    static ID_PRODUTO = "id_produto";
    static ID = "id";
    static NOME = "nome";
    static POTENCIA = "potencia";
    static TIPO = "tipo";
    
    constructor() {
        super("energia", "produtos");

        this.addFieldId(Produtos.ID_PRODUTO);
        this.addFieldInteger(Produtos.ID, "ID");
        this.addFieldText(Produtos.NOME, "nome", 100);
        this.addFieldDecimal(Produtos.POTENCIA, "potencia", 10, 1);
        this.addFieldCheckText(Produtos.TIPO, "tipo", TIPO_PRODUTO, 20, String(TIPO_PRODUTO.MODULO), TYPE_CASE.LOWER);

        this.addIndexBusiness([Produtos.ID, Produtos.TIPO]);
    }

    static getInstance(): Produtos {
        if (!Produtos.instance) {
            Produtos.instance = new Produtos();
        }
        return Produtos.instance;
    }
}
