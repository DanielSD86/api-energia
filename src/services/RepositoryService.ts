import { DefaultConfigRepository } from "@config/ConfigRepository";
import { IRepository } from "@lib/repository/IRepository";
import { PgRepository } from "./implements/repository/postgres/PgRepository";

export async function RepositoryService(tenant?: string): Promise<IRepository> {
    const configRepository = DefaultConfigRepository()

    if (tenant) {
        configRepository.tenant = tenant;
    }

    const repository = PgRepository.getInstance(configRepository);    
    return repository;
}