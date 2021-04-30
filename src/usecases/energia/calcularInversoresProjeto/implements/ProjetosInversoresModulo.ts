import { ProjetosInversoresDom } from "@usecases/energia/projetosInversores/implements/ProjetosInversoresDom";

export interface ProjetosInversoresModulo extends ProjetosInversoresDom {    
    inverdorId: number;
    moduloId: number;
}
