import { TIPO_PRODUTO } from "@entities/energia/Produtos";
import { InversoresModulosDom, ModulosProjetoDom } from "@usecases/energia/produtos/implements/InversoresModulos";
import { ProdutosBusiness } from "@usecases/energia/produtos/implements/ProdutosBusiness";
import { ProdutosDom } from "@usecases/energia/produtos/implements/ProdutosDom";
import { ProjetosDom } from "@usecases/energia/projetos/implements/ProjetosDom";

describe("Projeto Inversor", () => {
    // Dados de testes
    const inversores: ProdutosDom[] = [ 
        { id: 1, nome: "Inversor #1", potencia: 3.3, tipo: String(TIPO_PRODUTO.INVERSOR) },
        { id: 3, nome: "Inversor #3", potencia: 6, tipo: String(TIPO_PRODUTO.INVERSOR) },
        { id: 2, nome: "Inversor #2", potencia: 9, tipo: String(TIPO_PRODUTO.INVERSOR) }
    ]
    const modulos: ProdutosDom[] = [
        { id: 1, nome: "Módulo Fotovoltaico #1", potencia: 330, tipo: String(TIPO_PRODUTO.MODULO) },
        { id: 2, nome: "Módulo Fotovoltaico #2", potencia: 445, tipo: String(TIPO_PRODUTO.MODULO)
        }
    ];
    const projeto: ProjetosDom = {
		potencia: 1500,
		modulo_id: 2
	};

    it("Modulos por Inversor", async () => {
        //Função a ser testada
        const inversoresModulos = ProdutosBusiness.getModulosPorInversor(inversores, modulos);

        // Valores esperados
        const resultExpected: InversoresModulosDom[] = [
            { id: 1, nome: "Inversor #1", potencia: 3.3, tipo: String(TIPO_PRODUTO.INVERSOR),
                modulos: [ 
                    { modulo: { id: 1, nome: "Módulo Fotovoltaico #1", potencia: 330, tipo: String(TIPO_PRODUTO.MODULO) }, quantidade: 10 },
                    { modulo: { id: 2, nome: "Módulo Fotovoltaico #2", potencia: 445, tipo: String(TIPO_PRODUTO.MODULO) }, quantidade: 7 }
            ]},
            { id: 3, nome: "Inversor #3", potencia: 6, tipo: String(TIPO_PRODUTO.INVERSOR), 
                modulos: [ 
                    { modulo: { id: 1, nome: "Módulo Fotovoltaico #1", potencia: 330, tipo: String(TIPO_PRODUTO.MODULO) }, quantidade: 18 },
                    { modulo: { id: 2, nome: "Módulo Fotovoltaico #2", potencia: 445, tipo: String(TIPO_PRODUTO.MODULO) }, quantidade: 13 }
            ]},
            { id: 2, nome: "Inversor #2", potencia: 9, tipo: String(TIPO_PRODUTO.INVERSOR), 
                modulos: [ 
                    { modulo: { id: 1, nome: "Módulo Fotovoltaico #1", potencia: 330, tipo: String(TIPO_PRODUTO.MODULO) }, quantidade: 27 },
                    { modulo: { id: 2, nome: "Módulo Fotovoltaico #2", potencia: 445, tipo: String(TIPO_PRODUTO.MODULO) }, quantidade: 20 }
            ]}
        ];

        expect(inversoresModulos).toEqual(resultExpected);
    });

    it("Modulos por Projeto", async () => {
        //Função a ser testada
        const modulosProjeto = ProdutosBusiness.getModulosPorProjeto(modulos, projeto.potencia);

        // Valores esperados
        const resultExpected: ModulosProjetoDom[] = [
                { modulo: { id: 1, nome: "Módulo Fotovoltaico #1", potencia: 330, tipo: String(TIPO_PRODUTO.MODULO) }, quantidade: 4 },
                { modulo: { id: 2, nome: "Módulo Fotovoltaico #2", potencia: 445, tipo: String(TIPO_PRODUTO.MODULO) }, quantidade: 3 }
        ];

        expect(modulosProjeto).toEqual(resultExpected);
    });

    it("Inversores por Projeto", async () => {
        expect(null).toEqual(null);
    });
});