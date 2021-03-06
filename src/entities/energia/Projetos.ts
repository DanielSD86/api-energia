import { AbstractCompanyEntity } from "@entities/AbstractCompanyEntity";

export class Projetos extends AbstractCompanyEntity {
    static instance: Projetos;

    static ID_PROJETO = "id_projeto";
    static MODULO_ID = "modulo_id";
    static POTENCIA = "potencia";
    
    constructor() {
        super("energia", "projetos");

        this.addFieldId(Projetos.ID_PROJETO);        
        this.addFieldDecimal(Projetos.POTENCIA, "potencia", 10, 1);
        this.addFieldInteger(Projetos.MODULO_ID, "modulo ID");
        this.addFieldDateTimeCreate();
    }

    static getInstance(): Projetos {
        if (!Projetos.instance) {
            Projetos.instance = new Projetos();
        }
        return Projetos.instance;
    }
}
