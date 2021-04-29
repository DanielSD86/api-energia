import { Produtos } from "@entities/energia/Produtos";
import { IBusinessProcess } from "@lib/layers/business/IBusinessProcess";
import { IDataRequest, IResultAdapter } from "@lib/layers/IAdapter";
import { IRepositoryClient } from "@lib/repository/IRepositoryClient";
import { DataUtils } from "@lib/utils/DataUtils";
import { EntityUtils, TYPE_VALIDATE } from "@lib/utils/EntityUtils";
import { InversoresProjetoDom, ModulosProjetoDom } from "@usecases/energia/produtos/implements/InversoresModulos";
import { ProdutosBusiness } from "@usecases/energia/produtos/implements/ProdutosBusiness";
import { ProdutosDom } from "@usecases/energia/produtos/implements/ProdutosDom";
import { ProjetosBusiness } from "@usecases/energia/projetos/implements/ProjetosBusiness";
import { ProjetosDom } from "@usecases/energia/projetos/implements/ProjetosDom";
import { ProjetosInversoresDom } from "@usecases/energia/projetosInversores/implements/ProjetosInversoresDom";

export class ProjetoInversorBusiness implements IBusinessProcess {
    static instance: ProjetoInversorBusiness;

    static MSG_MODULOS_NOT_FOUND = "Nenhum modulo foi informado na lista de produtos";
    static MSG_INVERSORES_NOT_FOUND = "Nenhum inversor foi informado na lista de produtos";

    static FIELD_INVERSORES = "inversores";
    static FIELD_MODULOS = "modulos";

    static FIELD_PRODUTOS = "produtos";
    static FIELD_PROJETO = "projeto";

    static getInstance(): ProjetoInversorBusiness {
        if (!ProjetoInversorBusiness.instance) {
            ProjetoInversorBusiness.instance = new ProjetoInversorBusiness();
        }
        return ProjetoInversorBusiness.instance;
    }

    async fill(repositoryClient: IRepositoryClient, dataRequest: IDataRequest): Promise<void> {
        if (dataRequest.data[ProjetoInversorBusiness.FIELD_PRODUTOS]) {
            const produtos : ProdutosDom[] = dataRequest.data[ProjetoInversorBusiness.FIELD_PRODUTOS];

            const modulos = ProdutosBusiness.getModulos(produtos);
            const inversores = ProdutosBusiness.getInversores(produtos);

            dataRequest.data[ProjetoInversorBusiness.FIELD_MODULOS] = modulos;
            dataRequest.data[ProjetoInversorBusiness.FIELD_INVERSORES] = inversores;
        }
    }

    async validate(repositoryClient: IRepositoryClient, dataRequest: IDataRequest): Promise<IResultAdapter> {
        // Valida estrutura básica
        const fields = [ProjetoInversorBusiness.FIELD_PRODUTOS, ProjetoInversorBusiness.FIELD_PROJETO];
        const resultRequired = DataUtils.getFieldsRequired(dataRequest.data, fields);
        if (!resultRequired.status) {
            return {
                status: false,
                message: resultRequired.message
            }
        }

        // Valida os modulos
        if (!dataRequest.data[ProjetoInversorBusiness.FIELD_MODULOS] || dataRequest.data[ProjetoInversorBusiness.FIELD_MODULOS].length === 0) {
            return {
                status: false,
                message: [ProjetoInversorBusiness.MSG_MODULOS_NOT_FOUND],
            }
        }

        // Valida os inversores
        if (!dataRequest.data[ProjetoInversorBusiness.FIELD_INVERSORES] || dataRequest.data[ProjetoInversorBusiness.FIELD_INVERSORES].length === 0) {
            return {
                status: false,
                message: [ProjetoInversorBusiness.MSG_MODULOS_NOT_FOUND],
            }
        }

        // Valida estrutura dos dados
        const resultValidateProdutos = await ProdutosBusiness.getInstance().validateEntity(dataRequest.data[ProjetoInversorBusiness.FIELD_PRODUTOS], TYPE_VALIDATE.SCOPE, "Produtos");
        if (!resultValidateProdutos.status) {
            return {
                status: false,
                message: resultValidateProdutos.message
            }
        }

        const resultValidateProjeto = await ProjetosBusiness.getInstance().validateEntity(dataRequest.data[ProjetoInversorBusiness.FIELD_PROJETO], TYPE_VALIDATE.CREATE, "Projeto");
        if (!resultValidateProjeto.status) {
            return {
                status: false,
                message: resultValidateProjeto.message
            }
        }

        delete dataRequest.data[ProjetoInversorBusiness.FIELD_PRODUTOS];

        return {
            status: true,
        }
    }
    
    async execute(repositoryClient: IRepositoryClient, dataRequest: IDataRequest): Promise<IResultAdapter> {
        // Dados para calculo
        const projeto : ProjetosDom = dataRequest.data[ProjetoInversorBusiness.FIELD_PROJETO];
        const modulos: ProdutosDom[] = dataRequest.data[ProjetoInversorBusiness.FIELD_MODULOS];
        const inversores: ProdutosDom[] = dataRequest.data[ProjetoInversorBusiness.FIELD_INVERSORES];

        // Processos de processamento do projeto
        const inversoresModulos = ProdutosBusiness.getModulosPorInversor(inversores, modulos);
        const modulosProjeto: ModulosProjetoDom[] = ProdutosBusiness.getModulosPorProjeto(modulos, projeto.potencia);        
        const inversorPorProjeto = ProdutosBusiness.getInversorPorProjeto(inversoresModulos, modulosProjeto);

        // Monta resulta
        const result = inversorPorProjeto.map((inversor) => {
            return {
                id: inversor.inversor.id,
                nome: inversor.inversor.nome,
                potencia: inversor.inversor.potencia,
                quantidade: inversor.quantidade,
            }
        });

        // Persiste o projeto, com a solução
        const projetoCreate: ProjetosDom = projeto;
        const projetoInversores: ProjetosInversoresDom[] = [];

        for (const inversor of inversorPorProjeto) {
            const inversorExist = projetoInversores.find((inv) => inv.id_produto_inversor === inversor.inversor.id);

            if (inversorExist) {
                inversorExist.quantidade_inversor++
                continue;
            }

            projetoInversores.push({
                id_produto_inversor: inversor.inversor.id,
                id_produto_modulo: inversor.modulo.id,
                quantidade_inversor: 1,
                quantidade_modulo_por_inversor: inversor.quantidade,
                id_projeto: null,                
            });
        }

        projetoCreate["inversores"] = projetoInversores;

        // Grava no Banco de Dados
        const projetoBusiness = ProjetosBusiness.getInstance();
        const projetoResultCreate = await projetoBusiness.create(repositoryClient, {
            data: projetoCreate,
            session: dataRequest.session,
        });

        if (!projetoResultCreate.status) {
            return projetoResultCreate;
        }

        // Retorna solução
        return {
            status: true,
            data: {
                solucao : result
            }
        }
    }
}
