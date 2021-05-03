import { AbstractLayerBusiness } from "@lib/layers/business/AbstractLayerBusiness";
import { ProdutosRepository } from "./ProdutosRepository";
import { IProdutosBusiness } from "../IProdutosBusiness";
import { ProdutosDom } from "./ProdutosDom";
import { TIPO_PRODUTO } from "@entities/energia/Produtos";
import { InversoresModulosDom, InversoresProjetoDom, InversorSolucaoDom, ModulosProjetoDom } from "./InversoresModulos";

export class ProdutosBusiness extends AbstractLayerBusiness implements IProdutosBusiness {
    static instance: ProdutosBusiness;
    
    constructor() {
        super(ProdutosRepository.getInstance());
    }

    static getInstance(): ProdutosBusiness {
        if (!ProdutosBusiness.instance) {
            ProdutosBusiness.instance = new ProdutosBusiness();
        }
        return ProdutosBusiness.instance;
    }

    static getModulos(produtos: ProdutosDom[]): ProdutosDom[] {
        return produtos.filter(produto => produto.tipo === String(TIPO_PRODUTO.MODULO));
    }

    static getInversores(produtos: ProdutosDom[]): ProdutosDom[] {
        return produtos.filter(produto => produto.tipo === String(TIPO_PRODUTO.INVERSOR));
    }

    static getModulosPorInversor(inversores: ProdutosDom[], modulos: ProdutosDom[]): InversoresModulosDom[] {
        const list: InversoresModulosDom[] = [];

        for (const inversor of inversores) {
            //console.log(inversor);

            const record: InversoresModulosDom = inversor;
            record.modulos = [];

            for (const modulo of modulos) {
                // Especificação Técnica: Quantidade de Modulos por Inversor
                // Quantidade = Potencia Inversor em W / Potencia do Modulo em W
                // Valor inteiro truncado
                const quantidade = Math.trunc((inversor.potencia * 1000) / modulo.potencia);

                if (quantidade > 0) {
                    record.modulos.push({
                        modulo: modulo,
                        quantidade: quantidade,
                    })
                }
            }

            list.push(record);
        }

        return list;
    }

    static getModulosPorProjeto(modulos: ProdutosDom[], potenciaProjeto: number): ModulosProjetoDom[] {
        const list: ModulosProjetoDom[] = [];

        for (const modulo of modulos) {
            // Especificação Técnica: Quantidade de Modulos por Projeto
            // Quantidade = Potencia projeto em W / Potencia do Modulo em W
            // Valor inteiro truncado
            const quantidade = Math.trunc(potenciaProjeto / modulo.potencia);

            if (quantidade > 0) {
                list.push({
                    modulo: modulo,
                    quantidade: quantidade,
                })
            }
        }

        return list;
    }

    static getInversoresModuloEspecifico(inversoresModulos: InversoresModulosDom[], moduloId: number): InversoresProjetoDom[] {
        const list: InversoresProjetoDom[] = [];

        for (const inversor of inversoresModulos) {
            const modulo = inversor.modulos.find(modulo => modulo.modulo.id === moduloId);
            if (!modulo) continue;

            const inversorCustom: InversoresModulosDom = { ...inversor };

            list.push({ 
                inversor: inversorCustom, 
                quantidade: modulo.quantidade,
                modulo: modulo.modulo,
            });
        }

        return list;
    }

    static getInversorPorProjeto(inversoresModulos: InversoresModulosDom[], modulosProjeto: ModulosProjetoDom[]): InversoresProjetoDom[] {
        const list: InversoresProjetoDom[] = [];
        let quantidadeInversor = 1;
        const inversorSolucao : InversorSolucaoDom = {};

        do {
            // Valida cada modulo disponível se fecha com a quantidade existente de cada modulo no inversor
            for (const modulo of modulosProjeto) {
                const inversoresModuloEspecifico: InversoresProjetoDom[] = this.getInversoresModuloEspecifico(inversoresModulos, modulo.modulo.id);

                // Se o inversor não possuir modulo, não calcula
                if (inversoresModuloEspecifico.length === 0) continue;

                for (const inversor of inversoresModuloEspecifico) {                    
                    // Especificação Técnica: Quantidade de modulos para atender o projeto
                    // Quantidade = deve ser menor ou igual a quantidade de modulos que o inversor suporta
                    if (modulo.quantidade < (inversor.quantidade * quantidadeInversor)) {
                        if (inversorSolucao.inversor) {
                            // Especificação Técnica: Considerar sempre o inversor com menos potencia
                            if (inversorSolucao.inversor.potencia < inversor.inversor.potencia) {
                                continue;
                            }

                            // Regra para considerar o numero de modulos mais perto da potencia do modulo
                            /*const potenciaModulo = modulo.modulo.potencia * inversor.quantidade;
                            if (potenciaModulo < inversorSolucao.potenciaModulo) {
                                continue;
                            }*/
                        }

                        // Guarda o inversor e modulo que foi atendido no projeto
                        inversorSolucao.inversor = inversor.inversor;
                        inversorSolucao.modulo = modulo.modulo;
                        inversorSolucao.quantidadeModulo = inversor.quantidade;
                        inversorSolucao.potenciaModulo = (modulo.modulo.potencia * inversor.quantidade);
                    }
                }
            }

            // Caso possua a solução, retorna
            if (inversorSolucao.inversor) {
                for (let i = 0; i < quantidadeInversor; i++) {
                    list.push({
                        inversor: inversorSolucao.inversor,
                        quantidade: inversorSolucao.quantidadeModulo,
                        modulo: inversorSolucao.modulo,
                    });
                }
                break;
            }

            quantidadeInversor++
        } while (list.length === 0 || quantidadeInversor <= 100);     

        return list;
    }
}
