# Teste Cálculo Inversores - Projeto

## API v1 

## Padrão Filtros nas Consultas

É permitido efetuar filtros nos campos utilizando sufixos nos campos de filtro, exemplos:

### Campos de tipo texto:
- > _like: Consulta parte da texto. Caracter coringa "+" (url format: );
- > _not_like: Consulta somente se não ocorrer parte da texto;
- > _not_equal: Diferente do texto informado;

### Campos de tipo inteiro, decimal e data (format AAAA-MM-DD HH:MM:SS):
- > _not_equal: Diferente do valor informado;
- > _more_equal: Maior ou igual ao valor informado;
- > _more: Maior que o valor informado;
- > _less_equal: Menor ou igual ao valor informado;
- > _less: Menor que o valor informado;

## Métodos de Acesso

### Cálculo Inversoes por Projeto

### Produtos
- Objeto de Produtos:
    - nome: descrição do produtos;
    - potencia: Potencia do modulo ou inversor
        > No caso de modulo, enviar potência em Watts
        > Para tipo inversor, informar a potência em KiloWatts    
    - tipo: 
        - modulo
        - inversores

- Consulta de Produtos;
    - URL: /energia/produtos
    - Método: GET
    - Parâmetros:
        - nome: Filtro pelo nome do produto            
        - tipo: Fitro pelo tipo de produto
        - potencia: Filtro pela potencia do produto
    - Resposta: 
        - Status OK 200: Lista de Objetos de Produtos

- Consulta por ID do produto:
    - URL: /energia/produtos/<id>
    - Método: GET
    - Parâmetro:
        - id: Código do produto
    - Respota:
        - Status OK 200: Objeto de Produtos

- Criar um Produto:
    - URL: /energia/produtos/<id>
    - Método: POST
    - Body: Objeto de Produtos
    - Status OK 200: Objeto de Produtos Criado

- Alterar um Produto:
    - URL: /energia/produtos/<id>
    - Método: PUT
    - Body: Objetos de Produtos
    - Parametro: 
        - id: código do produto
    - Resposta:
        - Status OK 200: Objeto de Produtos Criado

### Calculo de Inversores por Projeto
- Objeto de Calculo de Inversores por Projeto:
    - Lista Produtos: 
        - Lista de Objetos de Produtos (Deverá conter modulos e inversores)
    - Objeto Projeto:
        - potencia: Potência em Watts do Projeto
        - modulo_id: Código do môdulo

- Objeto de Solução:
    - Lista:
        - id: código do inversor
        - nome: descrição do inversor
        - pontecia: potencia do inversor
        - quantidade: quantidade de modulos que o inversor suporte e que foi selecionado para atendimento do projeto

- Calcular:
    - URL: /energia/projetosinversrores/calcular
    - Método: POST
    - Body: Objetos de Calculo de Inversores por Projeto
    - Resposta: 
        - Status OK 200: Objeto de Solução

### Consulta Projeto
- Objeto de Retorno Consulta Projeto:
    - Lista de projetos:
        - id_projeto: código de identificação do projeto;
        - potencia: Potencia do projeto;
        - modulo_id: Código do môdulo;
        - dh_create: Data e hora do calculo do projeto.
        - Lista de Inversores (validar parâmetro necessário):
            - quantidade_modulo_por_inversor: quantidade do inversor por modulo;
            - quantidade_inversor: quantidade de inversores no projeto;
            - inversor_id: ID do inversor;
            - inversor_nome: descrição do inversor;
            - inversor_potencia: potência do inversor em KiloWatts;
            - modulo_id: ID do modulo;
            - modulo_nome: descrição do modulo;
            - modulo_potencia: potencia do modulo em Watts.

- Consulta de Projetos;
    - URL: /energia/projetos
    - Método: GET
    - Parâmetros:
        - potencia: Filtro de potencia            
        - modulo_id: Filtro de Modulo ID
        - include: se informado com valor "inversores", será listado os detalhes dos inversores do projeto
    - Resposta: 
        - Status OK 200: Lista de objeto de Retorno Consulta Projeto

- Consulta por ID do projeto:
    - URL: /energia/projeto/<id>
    - Método: GET
    - Parâmetro:
        - id: Código do projeto
        - include: se informado com valor "inversores", será listado os detalhes dos inversores do projeto
    - Respota:
        - Status OK 200: Objeto de Retorno Consulta Projeto

## Migration BD - Postgres

Para criação das tabelas, inclusive na alteração de entidades, é necessário executar o comando yarn migration.
A entidade deverá ser adicionada na rotina "migration.ts".

> Exemplo: await domain.createTableIfNotExists(Produtos.getInstance());
> Sendo a criação ou alteração da entidade "produtos" no BD.

 - Sucesso: Migration finalizado com sucesso
 - Erro: Migration finalizado com erro (Juntamento com o stack do erro)

## Criação de Casos de Uso

No caso de criação de um caso de uso, sendo ele como processo ou manipulação de entidade, é necessário executar o comando yarn usecases.
A entidade ou processo deverá ser adcionada na rotina "usecases.ts"

> Exemplos: 
> -Entidade: await createFiles(ProjetosInversores.getInstance());
> -Processo: await createFilesProcess("energia", "calcularInversoresProjeto");

## Configuração de Banco de Dados

O Banco utilizado é PostgreSql.
Para executação inicial do migration, deve ser criado um arquivo de .env, como informado no exemplo ".env.exemplo".
As propriedades deverão ser alteradas conforme configuração do ambiente.

## Testes

Para efetuar os testes, utilize o comando yarn test.

#### Daniel Diniz
