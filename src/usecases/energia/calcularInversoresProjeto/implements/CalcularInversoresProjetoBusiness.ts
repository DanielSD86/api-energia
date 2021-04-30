import { Produtos, TIPO_PRODUTO } from "@entities/energia/Produtos";
import { IBusinessProcess } from "@lib/layers/business/IBusinessProcess";
import { IDataRequest, IResultAdapter } from "@lib/layers/IAdapter";
import { IRepositoryClient } from "@lib/repository/IRepositoryClient";
import { DataUtils } from "@lib/utils/DataUtils";
import { TYPE_VALIDATE } from "@lib/utils/EntityUtils";
import { StringUtils } from "@lib/utils/StringUtils";
import { ModulosProjetoDom } from "@usecases/energia/produtos/implements/InversoresModulos";
import { ProdutosBusiness } from "@usecases/energia/produtos/implements/ProdutosBusiness";
import { ProdutosDom } from "@usecases/energia/produtos/implements/ProdutosDom";
import { ProdutosMergeListProcess } from "@usecases/energia/produtos/implements/ProdutosMergeListProcess";
import { ProjetosBusiness } from "@usecases/energia/projetos/implements/ProjetosBusiness";
import { ProjetosDom } from "@usecases/energia/projetos/implements/ProjetosDom";
import { ProjetosInversoresDom } from "@usecases/energia/projetosInversores/implements/ProjetosInversoresDom";

export class CalcularInversoresProjetoBusiness implements IBusinessProcess {
    static instance: CalcularInversoresProjetoBusiness;

    static MSG_MODULOS_NOT_FOUND = "Nenhum modulo foi informado na lista de produtos";
    static MSG_INVERSORES_NOT_FOUND = "Nenhum inversor foi informado na lista de produtos";

    static FIELD_INVERSORES = "inversores";
    static FIELD_MODULOS = "modulos";

    static FIELD_PRODUTOS = "produtos";
    static FIELD_PROJETO = "projeto";

    static getInstance(): CalcularInversoresProjetoBusiness {
        if (!CalcularInversoresProjetoBusiness.instance) {
            CalcularInversoresProjetoBusiness.instance = new CalcularInversoresProjetoBusiness();
        }
        return CalcularInversoresProjetoBusiness.instance;
    }

    async fill(repositoryClient: IRepositoryClient, dataRequest: IDataRequest): Promise<void> {
        if (dataRequest.data[CalcularInversoresProjetoBusiness.FIELD_PRODUTOS]) {
            const produtos : ProdutosDom[] = dataRequest.data[CalcularInversoresProjetoBusiness.FIELD_PRODUTOS];

            const modulos = ProdutosBusiness.getModulos(produtos);
            const inversores = ProdutosBusiness.getInversores(produtos);

            dataRequest.data[CalcularInversoresProjetoBusiness.FIELD_MODULOS] = modulos;
            dataRequest.data[CalcularInversoresProjetoBusiness.FIELD_INVERSORES] = inversores;
        }
    }

    async validate(repositoryClient: IRepositoryClient, dataRequest: IDataRequest): Promise<IResultAdapter> {
        // Valida estrutura básica
        const fields = [CalcularInversoresProjetoBusiness.FIELD_PRODUTOS, CalcularInversoresProjetoBusiness.FIELD_PROJETO];
        const resultRequired = DataUtils.getFieldsRequired(dataRequest.data, fields);
        if (!resultRequired.status) {
            return {
                status: false,
                message: resultRequired.message
            }
        }

        // Valida os modulos
        if (!dataRequest.data[CalcularInversoresProjetoBusiness.FIELD_MODULOS] || dataRequest.data[CalcularInversoresProjetoBusiness.FIELD_MODULOS].length === 0) {
            return {
                status: false,
                message: [CalcularInversoresProjetoBusiness.MSG_MODULOS_NOT_FOUND],
            }
        }

        // Valida os inversores
        if (!dataRequest.data[CalcularInversoresProjetoBusiness.FIELD_INVERSORES] || dataRequest.data[CalcularInversoresProjetoBusiness.FIELD_INVERSORES].length === 0) {
            return {
                status: false,
                message: [CalcularInversoresProjetoBusiness.MSG_MODULOS_NOT_FOUND],
            }
        }

        // Valida estrutura dos dados
        const resultValidateProdutos = await ProdutosBusiness.getInstance().validateEntity(dataRequest.data[CalcularInversoresProjetoBusiness.FIELD_PRODUTOS], TYPE_VALIDATE.CREATE, "Produtos");
        if (!resultValidateProdutos.status) {
            return {
                status: false,
                message: resultValidateProdutos.message
            }
        }

        const resultValidateProjeto = await ProjetosBusiness.getInstance().validateEntity(dataRequest.data[CalcularInversoresProjetoBusiness.FIELD_PROJETO], TYPE_VALIDATE.CREATE, "Projeto");
        if (!resultValidateProjeto.status) {
            return {
                status: false,
                message: resultValidateProjeto.message
            }
        }

        delete dataRequest.data[CalcularInversoresProjetoBusiness.FIELD_PRODUTOS];

        return {
            status: true,
        }
    }
    
    async execute(repositoryClient: IRepositoryClient, dataRequest: IDataRequest): Promise<IResultAdapter> {
        // Dados para calculo
        const projeto : ProjetosDom = dataRequest.data[CalcularInversoresProjetoBusiness.FIELD_PROJETO];
        const modulos: ProdutosDom[] = dataRequest.data[CalcularInversoresProjetoBusiness.FIELD_MODULOS];
        const inversores: ProdutosDom[] = dataRequest.data[CalcularInversoresProjetoBusiness.FIELD_INVERSORES];

        // Persiste os produtos
        const produtos = modulos.concat(inversores);
        const resultProdutos = await ProdutosBusiness.getInstance().executeProcess(ProdutosMergeListProcess.getInstance(), repositoryClient, {
            data: produtos,
            session: dataRequest.session
        });
        if (!resultProdutos.status) return resultProdutos;

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

            // Busca ID do inversor
            const resultInversor = await ProdutosBusiness.getInstance().findByBusiness(repositoryClient, {
                data: {
                    [Produtos.TIPO]: String(TIPO_PRODUTO.INVERSOR),
                    [Produtos.ID]: inversor.inversor.id,
                }
            });

            if (!resultInversor.status) {
                return {
                    status: false,
                    message: [StringUtils.getFormatMsg("Inversor {0} não localizado.", inversor.inversor.id)]
                };
            }

            // Busca ID do modulo
            const resultModulo = await ProdutosBusiness.getInstance().findByBusiness(repositoryClient, {
                data: {
                    [Produtos.TIPO]: String(TIPO_PRODUTO.MODULO),
                    [Produtos.ID]: inversor.modulo.id,
                }
            });

            if (!resultModulo.status) {
                return {
                    status: false,
                    message: [StringUtils.getFormatMsg("Modulo {0} não localizado.", inversor.modulo.id)]
                };
            }

            // Registra para criação
            projetoInversores.push({
                id_produto_inversor: DataUtils.get(resultInversor.data)[Produtos.ID_PRODUTO],
                id_produto_modulo: DataUtils.get(resultModulo.data)[Produtos.ID_PRODUTO], 
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