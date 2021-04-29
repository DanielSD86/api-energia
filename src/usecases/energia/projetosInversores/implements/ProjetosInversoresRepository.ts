import { ProjetosInversores } from "@entities/energia/ProjetosInversores";
import { AbstractLayerRepository } from "@lib/layers/repository/AbstractLayerRepository";
import { IProjetosInversoresRepository } from "../IProjetosInversoresRepository";
export class ProjetosInversoresRepository extends AbstractLayerRepository implements IProjetosInversoresRepository {
    static instance: ProjetosInversoresRepository;
    constructor() {
        super(ProjetosInversores.getInstance());
    }
    static getInstance(): ProjetosInversoresRepository {
        if (!ProjetosInversoresRepository.instance) {
            ProjetosInversoresRepository.instance = new ProjetosInversoresRepository();
        }
        return ProjetosInversoresRepository.instance;
    }
}
