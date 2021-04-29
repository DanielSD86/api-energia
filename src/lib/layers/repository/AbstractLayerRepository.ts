import { IEntity } from "@lib/entity/IEntity";
import { IRepositoryClient } from "@lib/repository/IRepositoryClient";
import { ISelectBuilder } from "@lib/repository/query/ISelectBuilder";
import { IQueryOptions } from "@lib/repository/query/QueryBuilderTypes";
import { ILayerRepository } from "./ILayerRepository";

export abstract class AbstractLayerRepository implements ILayerRepository {
    entity: IEntity;

    constructor(entity: IEntity) {
        this.entity = entity;
    }

    async select(repositoryClient: IRepositoryClient, where: Object, options: IQueryOptions): Promise<Object[]> {
        const select = repositoryClient.repository
                        .getBuilder()
                        .from(this.entity, "a", true)
                        .applyWhere(where)
                        .applyOptions(options);

        return await this.selectBuilder(repositoryClient, select);
    }

    async selectBuilder(repositoryClient: IRepositoryClient, selectBuilder: ISelectBuilder): Promise<Object[]> {
        return await repositoryClient.select(selectBuilder);
    }

    async create(repositoryClient: IRepositoryClient, data: Object): Promise<Object> {
        return await repositoryClient.create(this.entity, data);
    }

    async update(repositoryClient: IRepositoryClient, data: Object, where: Object): Promise<Object[]> {
        return await repositoryClient.update(this.entity, data, where);
    }

    async delete(repositoryClient: IRepositoryClient, where: Object): Promise<Object[]> {
        return await repositoryClient.delete(this.entity, where);
    }
}
