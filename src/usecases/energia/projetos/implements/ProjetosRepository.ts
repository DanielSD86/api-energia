import { Projetos } from "@entities/energia/Projetos";
import { AbstractLayerRepository } from "@lib/layers/repository/AbstractLayerRepository";
import { IProjetosRepository } from "../IProjetosRepository";
export class ProjetosRepository extends AbstractLayerRepository implements IProjetosRepository {
    static instance: ProjetosRepository;
    constructor() {
        super(Projetos.getInstance());
    }
    static getInstance(): ProjetosRepository {
        if (!ProjetosRepository.instance) {
            ProjetosRepository.instance = new ProjetosRepository();
        }
        return ProjetosRepository.instance;
    }
}
