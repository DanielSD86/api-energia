import * as dotenv from "dotenv";

import { IRepository } from "@lib/repository/IRepository";
import { IRepositoryDomain } from "@lib/repository/IRepositoryDomain";
import { RepositoryService } from "@services/RepositoryService";
import { Produtos } from "@entities/energia/Produtos";
import { Projetos } from "@entities/energia/Projetos";
import { ProjetosInversores } from "@entities/energia/ProjetosInversores";

async function execute() {
    dotenv.config();

    console.log("PARAMETROS", process.argv);

    const repository: IRepository = await RepositoryService();
    const repositoryClient = await repository.getClient(true);

    try {
        console.log("Migration iniciado");
        console.log("Banco de dados: " + repository.config.connectionString);

        await repositoryClient.beginTransaction();

        const domain: IRepositoryDomain = repository.getBuilderDomain();
        domain.setRepositoryClient(repositoryClient);

        try {
            // Carrega dados do repository
            await domain.loadDomain();

            //Energia
            await domain.createTableIfNotExists(Produtos.getInstance());
            await domain.createTableIfNotExists(Projetos.getInstance());
            await domain.createTableIfNotExists(ProjetosInversores.getInstance());

            await repositoryClient.commit();
            console.log("Migration finalizado com sucesso");
        } catch (e) {
            await repositoryClient.rollback();
            console.log("Migration finalizado com erro");
            throw e;
        } finally {
            await repositoryClient.disconnect();
        }
    }
    finally {
        // Executa algo obrigatorio
    }
}

execute();
