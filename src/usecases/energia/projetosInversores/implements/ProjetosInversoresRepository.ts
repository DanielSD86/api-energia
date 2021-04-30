import { Produtos } from "@entities/energia/Produtos";
import { ProjetosInversores } from "@entities/energia/ProjetosInversores";
import { AbstractLayerRepository } from "@lib/layers/repository/AbstractLayerRepository";
import { IRepositoryClient } from "@lib/repository/IRepositoryClient";
import { IQueryOptions } from "@lib/repository/query/QueryBuilderTypes";
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

    async select(repositoryClient: IRepositoryClient, where: Object, options: IQueryOptions): Promise<Object[]> {
        const select = repositoryClient.repository
                        .getBuilder()
                        .from(this.entity, "a", true)
                        .innerJoin(Produtos.getInstance(), "i", false)
                        .addOnJoin("i", Produtos.ID_PRODUTO, "a", ProjetosInversores.ID_PRODUTO_INVERSOR)
                        .add("i", Produtos.ID, "inversor_id")
                        .add("i", Produtos.NOME, "inversor_nome")
                        .add("i", Produtos.POTENCIA, "inversor_potencia")
                        .innerJoin(Produtos.getInstance(), "m", false)
                        .addOnJoin("m", Produtos.ID_PRODUTO, "a", ProjetosInversores.ID_PRODUTO_MODULO)
                        .add("m", Produtos.ID, "modulo_id")
                        .add("m", Produtos.NOME, "modulo_nome")
                        .add("m", Produtos.POTENCIA, "modulo_potencia")
                        .applyWhere(where)
                        .applyOptions(options);

        return await this.selectBuilder(repositoryClient, select);
    }
}
