import { AbstractEntity } from "@lib/entity/AbstractEntity";
import { Produtos } from "./Produtos";
import { Projetos } from "./Projetos";

export class ProjetosInversores extends AbstractEntity {
    static instance: ProjetosInversores;

    static ID_PROJETO_INVERSOR = "id_projeto_inversor";
    static ID_PROJETO = "id_projeto";
    static ID_PRODUTO_INVERSOR = "id_produto_inversor";
    static ID_PRODUTO_MODULO = "id_produto_modulo";
    static QUANTIDADE_MODULO_POR_INVERSOR = "quantidade_modulo_por_inversor";
    static QUANTIDADE_INVERSOR = "quantidade_inversor";
    
    constructor() {
        super("energia", "projetos_inversores");

        this.addFieldId(ProjetosInversores.ID_PROJETO_INVERSOR);
        this.addForeignKey({ 
            entity: Projetos.getInstance(), 
            target: [ProjetosInversores.ID_PROJETO],
            source: [Projetos.ID_PROJETO],
        });
        this.addForeignKey({ 
            entity: Produtos.getInstance(),
            target: [ProjetosInversores.ID_PRODUTO_INVERSOR],
            source: [Produtos.ID_PRODUTO],
        });
        this.addForeignKey({ 
            entity: Produtos.getInstance(),
            target: [ProjetosInversores.ID_PRODUTO_MODULO],
            source: [Produtos.ID_PRODUTO],
        });
        this.addFieldInteger(ProjetosInversores.QUANTIDADE_MODULO_POR_INVERSOR, "quantidade modulos por inversor");
        this.addFieldInteger(ProjetosInversores.QUANTIDADE_INVERSOR, "quantidade de inversores");
    }

    static getInstance(): ProjetosInversores {
        if (!ProjetosInversores.instance) {
            ProjetosInversores.instance = new ProjetosInversores();
        }
        return ProjetosInversores.instance;
    }
}
