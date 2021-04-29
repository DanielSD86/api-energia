# Teste Cálculo Inversores - Projeto

## API v1 

## Métodos de Acesso

### Cálculo Inversoes por Projeto

### Produtos

### Projetos

### Projeto Inversores

## Migration BD - Postgres

Para criação das tabelas, inclusive na alteração de entidades, é necessário executar o comando yarn migration.
A entidade deverá ser adicionada na rotina "migration.ts".

> Exemplo: await domain.createTableIfNotExists(Produtos.getInstance());
> Sendo a criação ou alteração da entidade "produtos" no BD.

 - Sucesso: Migration finalizado com sucesso
 - Erro: Migration finalizado com erro (Juntamento com o stack do erro)

## Criação de Casos de Uso

No caso de criação de um caso de uso, sendo ele como processo ou manipulação de entidade, é 
