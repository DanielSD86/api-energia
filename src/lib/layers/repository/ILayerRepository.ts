import { IEntity } from "@lib/entity/IEntity";
import { IRepositoryClient } from "@lib/repository/IRepositoryClient";
import { ISelectBuilder } from "@lib/repository/query/ISelectBuilder";
import { IQueryOptions } from "@lib/repository/query/QueryBuilderTypes";

export interface ILayerRepository {
    entity: IEntity;

    select(repositoryClient: IRepositoryClient, where: Object, options: IQueryOptions): Promise<Object[]>;
    selectBuilder(repositoryClient: IRepositoryClient, selectBuilder: ISelectBuilder): Promise<Object[]>;

    create(repositoryClient: IRepositoryClient, data: Object): Promise<Object>;
    update(repositoryClient: IRepositoryClient, data: Object, where: Object): Promise<Object[]>;
    delete(repositoryClient: IRepositoryClient, where: Object): Promise<Object[]>;
}
