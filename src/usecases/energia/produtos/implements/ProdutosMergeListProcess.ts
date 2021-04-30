import { Produtos } from "@entities/energia/Produtos";
import { IBusinessProcess } from "@lib/layers/business/IBusinessProcess";
import { IDataRequest, IResultAdapter } from "@lib/layers/IAdapter";
import { IRepositoryClient } from "@lib/repository/IRepositoryClient";
import { DataUtils } from "@lib/utils/DataUtils";
import { EntityUtils, TYPE_VALIDATE } from "@lib/utils/EntityUtils";
import { ProdutosBusiness } from "./ProdutosBusiness";
import { ProdutosDom } from "./ProdutosDom";

export class ProdutosMergeListProcess implements IBusinessProcess {
    static instance: ProdutosMergeListProcess;

    static getInstance(): ProdutosMergeListProcess {
        if (!ProdutosMergeListProcess.instance) {
            ProdutosMergeListProcess.instance = new ProdutosMergeListProcess();
        }
        return ProdutosMergeListProcess.instance;
    }

    async fill(repositoryClient: IRepositoryClient, dataRequest: IDataRequest): Promise<void> {   
    }

    async validate(repositoryClient: IRepositoryClient, dataRequest: IDataRequest): Promise<IResultAdapter> {
        if (!Array.isArray(dataRequest.data)) {
            return {
                status: false,
                message: ["Não foi encontrado lista de produtos"]
            }
        }

        const produtos: ProdutosDom[] = dataRequest.data;

        return await EntityUtils.validate(Produtos.getInstance(), produtos, TYPE_VALIDATE.CREATE);
    }

    async execute(repositoryClient: IRepositoryClient, dataRequest: IDataRequest): Promise<IResultAdapter> {
        const produtos: ProdutosDom[] = dataRequest.data;
        const data: ProdutosDom[] = [];

        // Preenche dados faltantes
        for (const produto of produtos) {
            const produtoFind = await ProdutosBusiness.getInstance().findByBusiness(repositoryClient, {
                data: produto,
                session: dataRequest.session,
            });

            let resultPersist: IResultAdapter;

            if (produtoFind.status) {
                resultPersist = await ProdutosBusiness.getInstance().update(repositoryClient, {
                    data: produto,
                    condition: {
                        [Produtos.ID_PRODUTO]: DataUtils.get(produtoFind.data)[Produtos.ID_PRODUTO]
                    },
                    session: dataRequest.session,
                });
            } else {
                resultPersist = await ProdutosBusiness.getInstance().create(repositoryClient, {
                    data: produto,
                    session: dataRequest.session,
                });
            }

            if (!resultPersist.status) return resultPersist;

            for (const record of resultPersist.data) {
                data.push(record);
            }            
        }

        return {
            status: true,
            data
        }
    }
}