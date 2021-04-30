import { ENTITY_COMPANY, FIELD_COMPANY, FIELD_DATE_CREATE, FIELD_DATE_DISABLE, FIELD_DATE_UPDATE, FIELD_ID_URL, FIELD_USER_CREATE, FIELD_USER_DISABLE, FIELD_USER_UPDATE } from "@lib/entity/EntityConsts";
import { IEntity } from "@lib/entity/IEntity";
import { REPOSITORY_NOT_DEFINED } from "@lib/repository/IRepository";
import { IRepositoryClient } from "@lib/repository/IRepositoryClient";
import { IQueryOptions } from "@lib/repository/query/QueryBuilderTypes";
import QueryUtils from "@lib/repository/query/QueryBuilderUtils";
import { COMPANY, IDataSecurityAuth, USER } from "@lib/security/IConfigSecurityAuth";
import { DateUtils } from "@lib/utils/DateUtils";
import { EntityUtils, TYPE_VALIDATE } from "@lib/utils/EntityUtils";
import { StringUtils } from "@lib/utils/StringUtils";
import { IDataRequest, IResultAdapter } from "../IAdapter";
import { ILayerRepository } from "../repository/ILayerRepository";
import { ILayerBusiness } from "./ILayerBusiness";
import { IAssociateBusiness, OPERATION_ASSOCIATE, OPERATION_BUSINESS, OPERATION_CUSTOM, ROWS_COUNT_QUERY, TYPE_ASSOCIATE } from "./LayerBusinessTypes";

export abstract class AbstractLayerBusiness implements ILayerBusiness {
    static MSG_RECORD_NOT_FOUND = "Nenhum registro encontrado";
    static MSG_REF_NESTED_NOT_FOUND = "Não foi possível encontrar o vínculo do registro aninhado";
    static MSG_VALUE_NOT_FOUND = "Valor não encontrado para o campo {0}";
    static MSG_FIELD_REQUIRED = "Campo {0} é obrigatório(a)."
    static MSG_FIELD_CHECK_INVALID = "Campo {0} possui valor inválido.";

    layerRepository: ILayerRepository;
    associateBusiness: IAssociateBusiness[];

    constructor(layerRepository?: ILayerRepository) {
        this.layerRepository = layerRepository;
        this.associateBusiness = [];
    }
    
    setAssociateBusiness(name: string, business: ILayerBusiness, type?: TYPE_ASSOCIATE, ignoreFieldsOnValidate?: string[]): void {
        const associate: IAssociateBusiness = {
            name, 
            business,
            type: (type || TYPE_ASSOCIATE.ONE_TO_MORE),
            ignoreFieldsOnValidate
        }

        // Encontra os fields que fazem vinculo
        const entity = this.layerRepository.entity;
        const entityAssociate = business.layerRepository.entity;

        let source = [], target = [];

        for (const idxAssociate in entityAssociate.foreignKeys) {
            const fkAssociate = entityAssociate.foreignKeys[idxAssociate];

            if (fkAssociate.entity.getFullName() === entity.getFullName()) {
                source = fkAssociate.source;
                target = fkAssociate.target;
                break;
            }
        }

        if (source.length > 0) associate.source = source;
        if (target.length > 0) associate.target = target;

        this.associateBusiness.push(associate);
    }

    getAssociateBusiness(name: string): IAssociateBusiness {
        return this.associateBusiness.find((associate) => associate.name === name);
    }

    find = async (repositoryClient: IRepositoryClient, dataRequest: IDataRequest, nameOperation?: string, 
            methodRepository?:(repositoryClient: IRepositoryClient, where: object, options: IQueryOptions) => Promise<Object[]>): Promise<IResultAdapter> => {
        if (!this.layerRepository) throw new Error(REPOSITORY_NOT_DEFINED);

        let result: IResultAdapter = {
            status: false,
            data: undefined,
            message: [AbstractLayerBusiness.MSG_RECORD_NOT_FOUND],
        };

        await this.fillDefaultValues(repositoryClient, dataRequest, OPERATION_BUSINESS.QUERY, nameOperation);

        const validate = await this.validate(repositoryClient, dataRequest, OPERATION_BUSINESS.QUERY, nameOperation);
        if (!validate.status) return validate;

        let resultRepository = undefined;

        if (methodRepository)
            resultRepository = await methodRepository(repositoryClient, dataRequest.condition, dataRequest.options);
        else
            resultRepository = await this.layerRepository.select(repositoryClient, dataRequest.condition, dataRequest.options);
            
        if (resultRepository.length === 0) return result;

        // OK
        result = await this.getResultData(dataRequest, resultRepository);

        await this.findAssociates(repositoryClient, dataRequest, nameOperation, result.data);

        return result;
    }

    async getResultData(dataRequest: IDataRequest, data: Object[]): Promise<IResultAdapter> {
        const dataCustom = data;

        const result: IResultAdapter = {
            status: dataCustom.length > 0,
            data: (dataCustom.length > 0 ? dataCustom : undefined),
            dataInfo: {
                count: dataCustom.length,
                page: 1,
                pageTotal: 1,
            },
            message: [AbstractLayerBusiness.MSG_RECORD_NOT_FOUND],
        };

        if (!result.status) return result;
        if (!dataRequest.options) return result;
        if (dataRequest.options.limit <= 0) return result;

        // Se tiver o limit, então considera
        const { limit, page } = dataRequest.options;
        const count = dataCustom[0][ROWS_COUNT_QUERY.toLowerCase()];

        let pageTotal = count / limit;
        if (pageTotal !== Math.trunc(pageTotal))
            pageTotal = Math.trunc(pageTotal) + 1;            

        // Remove a coluna de total
        dataCustom.forEach((row) => {
            delete row[ROWS_COUNT_QUERY.toLowerCase()];
        });

        // Calcula
        result.data = dataCustom;
        result.dataInfo.page = (page || 1);
        result.dataInfo.pageTotal = pageTotal;
        result.dataInfo.count = count; 
        result.message = [];

        return result;
    }   

    findAssociates = async (repositoryClient: IRepositoryClient, dataRequest: IDataRequest, nameOperation: string, data: any): Promise<void> => {
        if (!dataRequest.options) return;
        if (!dataRequest.options.includes) return;
        
        const dataRequestAssociate: IDataRequest = {
            data: {},
            condition: {},
            session: dataRequest.session,
            options: {
                includes: dataRequest.options.includes,
            },
        };

        for (const idxIncludes in dataRequest.options.includes) {
            const associate = this.getAssociateBusiness(dataRequest.options.includes[idxIncludes]);

            if (!associate) continue;

            for (const idxData in data) {
                dataRequestAssociate.condition = {};

                for (const idxTarget in associate.target) {
                    const fieldTarget = associate.target[idxTarget];
                    const fieldSource = associate.source[idxTarget];

                    dataRequestAssociate.condition[fieldTarget] = data[idxData][fieldSource];
                }

                const resultAssociate = await associate.business.find(repositoryClient, dataRequestAssociate, nameOperation);

                if (!resultAssociate.status) continue;

                switch (associate.type) {
                    case TYPE_ASSOCIATE.ONE_TO_ONE:
                        data[idxData][dataRequest.options.includes[idxIncludes]] = resultAssociate.data[0];
                        break;
                    case TYPE_ASSOCIATE.ONE_TO_MORE:
                        data[idxData][dataRequest.options.includes[idxIncludes]] = resultAssociate.data;
                        break;
                }
            }
        }        
    }

    findAll = async (repositoryClient: IRepositoryClient, dataRequest: IDataRequest): Promise<IResultAdapter> => {
        return await this.find(repositoryClient, dataRequest, String(OPERATION_CUSTOM.ALL));
    };

    findById = async (repositoryClient: IRepositoryClient, dataRequest: IDataRequest): Promise<IResultAdapter> => {
        return await this.find(repositoryClient, dataRequest, String(OPERATION_CUSTOM.ID));
    };

    findByBusiness = async (repositoryClient: IRepositoryClient, dataRequest: IDataRequest): Promise<IResultAdapter> => {
        // Procura as chaves que são de negocio para atribuir para condition
        let fieldBusiness = this.layerRepository.entity.getFieldBusiness();

        const condition: object = {};

        if (fieldBusiness.length === 0) {
            fieldBusiness = this.layerRepository.entity.getPrimaryKeys();
        }

        if (fieldBusiness.length === 0) {
            throw new Error(AbstractLayerBusiness.MSG_REF_NESTED_NOT_FOUND);
        }

        for (const idx in fieldBusiness) {
            if (dataRequest.data[fieldBusiness[idx].name] === null || dataRequest.data[fieldBusiness[idx].name] === undefined) {
                throw new Error(StringUtils.getFormatMsg(AbstractLayerBusiness.MSG_VALUE_NOT_FOUND, fieldBusiness[idx].name));
            }

            condition[fieldBusiness[idx].name] = dataRequest.data[fieldBusiness[idx].name];
        }

        const dataRequestCustom: IDataRequest = {
            data: {},
            condition,
            session: dataRequest.session
        }      

        return await this.find(repositoryClient, dataRequestCustom, String(OPERATION_CUSTOM.ID));
    };

    create = async (repositoryClient: IRepositoryClient, dataRequest: IDataRequest): Promise<IResultAdapter> => {
        if (!this.layerRepository) throw new Error(REPOSITORY_NOT_DEFINED);

        await this.fillDefaultValues(repositoryClient, dataRequest, OPERATION_BUSINESS.CREATE);

        const validate = await this.validate(repositoryClient, dataRequest, OPERATION_BUSINESS.CREATE);
        if (!validate.status) return validate;

        return await this.persist(repositoryClient, dataRequest, OPERATION_BUSINESS.CREATE);
    };

    update = async (repositoryClient: IRepositoryClient, dataRequest: IDataRequest, nameOperation?: string): Promise<IResultAdapter> => {
        if (!this.layerRepository) throw new Error(REPOSITORY_NOT_DEFINED);

        await this.fillDefaultValues(repositoryClient, dataRequest, OPERATION_BUSINESS.UPDATE, nameOperation);

        const validate = await this.validate(repositoryClient, dataRequest, OPERATION_BUSINESS.UPDATE, nameOperation);
        if (!validate.status) return validate;

        return await this.persist(repositoryClient, dataRequest, OPERATION_BUSINESS.UPDATE);
    };

    delete = async (repositoryClient: IRepositoryClient, dataRequest: IDataRequest): Promise<IResultAdapter> => {
        if (!this.layerRepository) throw new Error(REPOSITORY_NOT_DEFINED);

        await this.fillDefaultValues(repositoryClient, dataRequest, OPERATION_BUSINESS.DELETE);

        const validate = await this.validate(repositoryClient, dataRequest, OPERATION_BUSINESS.DELETE);
        if (!validate.status) return validate;

        return await this.persist(repositoryClient, dataRequest, OPERATION_BUSINESS.DELETE);
    };

    disable = async (repositoryClient: IRepositoryClient, dataRequest: IDataRequest): Promise<IResultAdapter> => {
        if (!this.layerRepository) throw new Error(REPOSITORY_NOT_DEFINED);

        await this.fillDefaultValues(repositoryClient, dataRequest, OPERATION_BUSINESS.DISABLE);

        const validate = await this.validate(repositoryClient, dataRequest, OPERATION_BUSINESS.DISABLE);
        if (!validate.status) return validate;

        return await this.persist(repositoryClient, dataRequest, OPERATION_BUSINESS.DISABLE);
    };

    private async validateAssociates(repositoryClient: IRepositoryClient, dataRequest: IDataRequest, nameOperation?: string): Promise<IResultAdapter> {
        for (const fieldName in dataRequest.data) {
            if (this.layerRepository.entity.getField(fieldName)) continue;

            const associate = this.getAssociateBusiness(fieldName);
            if (!associate) continue;

            switch (associate.type) {
                case TYPE_ASSOCIATE.ONE_TO_ONE:
                    const dataAssociate = dataRequest.data[fieldName];

                    const resultAssociateValidate = await associate.business.validate(repositoryClient, dataAssociate, dataAssociate.data[OPERATION_ASSOCIATE], nameOperation);
                    if (!resultAssociateValidate.status) return resultAssociateValidate;

                    break;
                case TYPE_ASSOCIATE.ONE_TO_MORE:                    
                    const dataAssociates = dataRequest.data[fieldName];

                    for (const idx in dataAssociates) {
                        const dataAssociate = dataAssociates[idx];

                        const resultAssociateValidate = await associate.business.validate(repositoryClient, dataAssociate, dataAssociate.data[OPERATION_ASSOCIATE], nameOperation);
                        if (!resultAssociateValidate.status) return resultAssociateValidate;
                    }
                    
                    break;
            }
        }

        return { status: true };
    }

    async validateEntity(data: any, typeValidade: TYPE_VALIDATE, prefEntity?: string): Promise<IResultAdapter> {
        if (!this.layerRepository || !this.layerRepository.entity) {
            throw new Error("Não existe camada de repository informada para camada de negocio.");
        }

        return await EntityUtils.validate(this.layerRepository.entity, data, typeValidade, prefEntity);
    }

    async validate(repositoryClient: IRepositoryClient, dataRequest: IDataRequest, operation: OPERATION_BUSINESS, nameOperation?: string): Promise<IResultAdapter> {
        const messageValidate = [];

        // Valida em relação a operação
        if (this.layerRepository) {
            switch (operation) {
                case OPERATION_BUSINESS.CREATE:
                case OPERATION_BUSINESS.UPDATE:
                case OPERATION_BUSINESS.DISABLE:
                    // Valida a empresa caso necessário
                    if (operation === OPERATION_BUSINESS.UPDATE || operation === OPERATION_BUSINESS.DISABLE) {
                        if (this.layerRepository.entity.getField(FIELD_COMPANY) && !dataRequest.condition[FIELD_COMPANY]) {
                            messageValidate.push(StringUtils.getFormatMsg(AbstractLayerBusiness.MSG_FIELD_REQUIRED, 
                                this.layerRepository.entity.getField(FIELD_COMPANY).label));
                        }
                    }                    

                    // Valida todos os campos obrigatorios
                    const fields = this.layerRepository.entity.getFieldsRequired();
                    for (const idx in fields) {
                        const field = fields[idx];
                        let notFill = false;

                        if (operation === OPERATION_BUSINESS.CREATE) {
                            notFill = dataRequest.data[field.name] === undefined || dataRequest.data[field.name] === null;
                        } else {
                            notFill = dataRequest.data[field.name] != undefined && dataRequest.data[field.name] === null;
                        }

                        if (notFill) {
                            // Colunas a ignorar
                            if (field.autoGenerate) continue;              

                            messageValidate.push(StringUtils.getFormatMsg(AbstractLayerBusiness.MSG_FIELD_REQUIRED,
                                (field.label || field.name)));
                        }
                    }

                    // Valida a check constraints
                    const fieldsCheck = this.layerRepository.entity.getFieldsCheckConstraint();
                    for (const idx in fieldsCheck) {
                        const fieldCheck = fieldsCheck[idx];                        

                        // Tem que estar informado
                        if (dataRequest.data[fieldCheck.field.name] === undefined || dataRequest.data[fieldCheck.field.name] === null) continue;

                        // Recupera o valor
                        const value = QueryUtils.getValue(fieldCheck.field, dataRequest.data[fieldCheck.field.name]);

                        // Valida se existe na listagem de check
                        if (!fieldCheck.check.values.includes(value)) {
                            messageValidate.push(StringUtils.getFormatMsg(AbstractLayerBusiness.MSG_FIELD_CHECK_INVALID,
                                (fieldCheck.field.label || fieldCheck.field.name)));
                        }
                    }

                    break;
                case OPERATION_BUSINESS.QUERY:
                    if (this.layerRepository.entity.getField(FIELD_COMPANY) && !dataRequest.condition[FIELD_COMPANY] && !this.ignoreFieldCompanyCustom(nameOperation)) {
                        messageValidate.push(StringUtils.getFormatMsg(AbstractLayerBusiness.MSG_FIELD_REQUIRED,
                            this.layerRepository.entity.getField(FIELD_COMPANY).label));
                    }
                    break;
            }
        }

        if (messageValidate.length > 0) return { status: false, message: messageValidate };

        // Validação customizadas
        const resultCustom = await this.validateCustom(repositoryClient, dataRequest, operation, nameOperation);
        if (!resultCustom.status) return resultCustom;

        // Validação de associações
        if (operation !== OPERATION_BUSINESS.QUERY) {
            const resultAssociates = await this.validateAssociates(repositoryClient, dataRequest, nameOperation);
            if (!resultAssociates.status) return resultAssociates;
        }

        return { status: true };
    }

    private async persistAssociates(repositoryClient: IRepositoryClient, dataRequest: IDataRequest, dataResult: object): Promise<IResultAdapter> {
        for (const fieldName in dataRequest.data) {
            if (this.layerRepository.entity.getField(fieldName)) continue;

            const associate = this.getAssociateBusiness(fieldName);

            if (!associate) continue;

            switch (associate.type) {
                case TYPE_ASSOCIATE.ONE_TO_ONE:
                    const dataAssociate = dataRequest.data[fieldName];

                    // Popula os dados de associação
                    for (const idx in associate.target) {
                        dataAssociate.data[associate.target[idx]] = dataResult[0][associate.source[idx]];
                    }               

                    const resultAssociatePersist = await associate.business.persist(repositoryClient, dataAssociate, dataAssociate.data[OPERATION_ASSOCIATE]);
                    if (!resultAssociatePersist.status) return resultAssociatePersist;

                    dataResult[0][fieldName] = resultAssociatePersist.data[0];
                    break;
                case TYPE_ASSOCIATE.ONE_TO_MORE:                    
                    const dataAssociates = dataRequest.data[fieldName];
                    const resultAssociate = [];

                    for (const idx in dataAssociates) {
                        const dataAssociate = dataAssociates[idx];

                        // Popula os dados de associação
                        for (const idx in associate.target) {
                            dataAssociate.data[associate.target[idx]] = dataResult[0][associate.source[idx]];
                        }               

                        const resultAssociatePersist = await associate.business.persist(repositoryClient, dataAssociate, dataAssociate.data[OPERATION_ASSOCIATE]);
                        if (!resultAssociatePersist.status) return resultAssociatePersist;

                        resultAssociate.push(resultAssociatePersist.data[0]);
                    }

                    dataResult[0][fieldName] = resultAssociate;
                    break;
            }
        }    
    }

    async persist(repositoryClient: IRepositoryClient, dataRequest: IDataRequest, operation: OPERATION_BUSINESS): Promise<IResultAdapter> {
        if (!this.layerRepository) throw new Error(REPOSITORY_NOT_DEFINED);

        const result = {
            status: false,
            data: undefined,
            message: [],
        };

        switch (operation) {
            case OPERATION_BUSINESS.CREATE:
                const resultCreate = await this.layerRepository.create(repositoryClient, dataRequest.data);            

                result.status = true;
                result.data = resultCreate;
                result.message = [];
                break;
            case OPERATION_BUSINESS.UPDATE:
            case OPERATION_BUSINESS.DISABLE:
                const resultUpdate = await this.layerRepository.update(repositoryClient, dataRequest.data, dataRequest.condition);

                result.status = true;
                result.data = resultUpdate;
                result.message = [];
                break;
            case OPERATION_BUSINESS.DELETE:
                const resultDelete = await this.layerRepository.delete(repositoryClient, dataRequest.condition);

                result.status = true;
                result.data = resultDelete;
                result.message = [];
                break;
            default:
                throw new Error("Operação " + operation + " não permite persistir dados.");
        }

        // Aborta por tem alguma coisa errada
        if ((!result.data) || (result.data.length == 0)) {
            return {
                status: false,
                data: undefined,
                message: [
                    "Erro ao persistir dados. Contate o suporte ou administrador do sistema",
                ],
            };
        };

        // Grava as associações
        await this.persistAssociates(repositoryClient, dataRequest, result.data);

        return result;
    }

    private async fillDefaultValuesAssociates(repositoryClient: IRepositoryClient, dataRequest: IDataRequest, operation: OPERATION_BUSINESS, nameOperation?: string): Promise<void> {
        const entity = this.layerRepository.entity;

        for (const fieldName in dataRequest.data) {
            if (entity.getField(fieldName)) continue;

            const associate = this.getAssociateBusiness(fieldName);

            if (!associate) continue;

            const entityAssociate = associate.business.layerRepository.entity;

            // Mescla dados da foreign key com os filhos.
            switch (associate.type) {
                case TYPE_ASSOCIATE.ONE_TO_ONE:
                    const dataRequestAssociate: IDataRequest = await this.getDataAssociate(repositoryClient, dataRequest, dataRequest.data[fieldName], associate, operation, entity, entityAssociate);

                    dataRequest.data[fieldName] = dataRequestAssociate;

                    // Preenche os outros campos
                    await associate.business.fillDefaultValues(repositoryClient, dataRequest.data[fieldName], dataRequestAssociate.data[OPERATION_ASSOCIATE], nameOperation);
                    break;
                case TYPE_ASSOCIATE.ONE_TO_MORE:
                    for (const idx in dataRequest.data[fieldName]) {
                        const dataRequestAssociateAnt = dataRequest.data[fieldName][idx];
                        const dataRequestAssociate: IDataRequest = await this.getDataAssociate(repositoryClient, dataRequest, dataRequestAssociateAnt, associate, operation, entity, entityAssociate);
                        
                        dataRequest.data[fieldName][idx] = dataRequestAssociate;

                        // Preenche os outros campos
                        await associate.business.fillDefaultValues(repositoryClient, dataRequest.data[fieldName][idx], dataRequestAssociate.data[OPERATION_ASSOCIATE], nameOperation);
                    }
                    break;
            }
        }
    }

    private async getDataAssociate(repositoryClient: IRepositoryClient, dataRequest: IDataRequest, dataAssociate: object, associate: IAssociateBusiness, operation: OPERATION_BUSINESS, entity: IEntity, entityAssociate: IEntity) {
        const dataRequestAssociate: IDataRequest = {
            data: dataAssociate,
            session: dataRequest.session,
            condition: undefined,
        };

        // Popula os dados de associação da foreign key
        for (const idxTarget in associate.target) {
            const fieldTarget = associate.target[idxTarget];
            const fieldSource = associate.source[idxTarget];

            if (operation === OPERATION_BUSINESS.CREATE) {
                const field = entity.getField(fieldSource);

                if (!field) {
                    throw new Error("Campo " + fieldSource + " não encontrado na entidade " + entity.getFullName() + ".");
                }

                if (field.autoGenerate) {
                    dataRequestAssociate.data[fieldTarget] = 0; // Para poder passar na validação   
                } else {
                    dataRequestAssociate.data[fieldTarget] = dataRequest.data[fieldSource];
                }
            } else {
                dataRequestAssociate.data[fieldTarget] = (dataRequest.condition[fieldSource] || dataRequest.data[fieldSource]);
            }
        }

        // Company
        if (entity.getField(FIELD_COMPANY) !== null && entityAssociate.getField(FIELD_COMPANY)) {
            dataRequestAssociate.data[FIELD_COMPANY] = (dataRequest.data[FIELD_COMPANY] || dataRequest.condition[FIELD_COMPANY]);
        }

        // Descobre o tipo de operacao
        dataRequestAssociate.data[OPERATION_ASSOCIATE] = OPERATION_BUSINESS.CREATE;

        if (operation !== OPERATION_BUSINESS.CREATE) {
            const resultAssociate = await associate.business.findByBusiness(repositoryClient, dataRequestAssociate);
            dataRequestAssociate.data[OPERATION_ASSOCIATE] = (resultAssociate.status ? operation : OPERATION_BUSINESS.CREATE);

            // Cria a condição
            if (dataRequestAssociate.data[OPERATION_ASSOCIATE] !== OPERATION_BUSINESS.CREATE) {
                const fieldsPk = entityAssociate.getPrimaryKeys();
                dataRequestAssociate.condition = {};
                for (const idx in fieldsPk) {
                    dataRequestAssociate.condition[fieldsPk[idx].name] = resultAssociate.data[0][fieldsPk[idx].name];
                }
            }
        }

        return dataRequestAssociate;
    }

    async fillDefaultValues(repositoryClient: IRepositoryClient, dataRequest: IDataRequest, operation: OPERATION_BUSINESS, nameOperation?: string): Promise<void> {
        if (!this.layerRepository) throw new Error(REPOSITORY_NOT_DEFINED);

        const entity = this.layerRepository.entity;

        // Vinculo ID com ID da entidade
        const fieldId = entity.getId();
        if (fieldId != null && fieldId.name != FIELD_ID_URL) {
            if (dataRequest.data) {
                if (dataRequest.data[FIELD_ID_URL] != undefined) {
                    dataRequest.data[fieldId.name] = dataRequest.data[FIELD_ID_URL];
                    delete dataRequest.data[FIELD_ID_URL];
                }
            }

            if (dataRequest.condition) {
                if (dataRequest.condition[FIELD_ID_URL] != undefined) {
                    dataRequest.condition[fieldId.name] = dataRequest.condition[FIELD_ID_URL];
                    delete dataRequest.condition[FIELD_ID_URL];
                }
            }
        }       

        // Preenche os valores defaults
        switch (operation) {
            case OPERATION_BUSINESS.CREATE:
                if (entity.getField(FIELD_COMPANY) && (!dataRequest.data[FIELD_COMPANY]) && (entity.getFullName() !== ENTITY_COMPANY)) 
                    dataRequest.data[FIELD_COMPANY] = dataRequest.session[COMPANY];
                if (entity.getField(FIELD_USER_CREATE) && (!dataRequest.data[FIELD_USER_CREATE]))
                    dataRequest.data[FIELD_USER_CREATE] = dataRequest.session[USER];
                if (entity.getField(FIELD_DATE_CREATE))
                    dataRequest.data[FIELD_DATE_CREATE] = DateUtils.getDateTimeAnsi();

                // Preenche com default dos campos que estão nulos ou não definidos
                const fields = entity.getFieldsDefault();
                for (const idx in fields) {
                    const field = fields[idx];
                    if (dataRequest.data[field.name] === null || dataRequest.data[field.name] === undefined) {
                        dataRequest.data[field.name] = field.defaultValue;
                    }
                }

                break;
            case OPERATION_BUSINESS.UPDATE:
                if (entity.getField(FIELD_COMPANY) && (!dataRequest.condition[FIELD_COMPANY]))
                    dataRequest.condition[FIELD_COMPANY] = dataRequest.session[COMPANY];
                if (entity.getField(FIELD_USER_UPDATE))
                    dataRequest.data[FIELD_USER_UPDATE] = dataRequest.session[USER];
                if (entity.getField(FIELD_DATE_UPDATE))
                    dataRequest.data[FIELD_DATE_UPDATE] = DateUtils.getDateTimeAnsi();
                break;
            case OPERATION_BUSINESS.DISABLE:
                if (entity.getField(FIELD_COMPANY) && (!dataRequest.condition[FIELD_COMPANY]))
                    dataRequest.condition[FIELD_COMPANY] = dataRequest.session[COMPANY];
                if (entity.getField(FIELD_USER_DISABLE))
                    dataRequest.data[FIELD_USER_DISABLE] = dataRequest.session[USER];
                if (entity.getField(FIELD_DATE_DISABLE))
                    dataRequest.data[FIELD_DATE_DISABLE] = DateUtils.getDateTimeAnsi();
                break;
            case OPERATION_BUSINESS.QUERY:
                if (entity.getField(FIELD_COMPANY)
                    && (!dataRequest.condition[FIELD_COMPANY]) 
                    && !this.ignoreFieldCompanyCustom(nameOperation)) {
                    dataRequest.condition[FIELD_COMPANY] = dataRequest.session[COMPANY];
                }
                break;
            default:
                throw new Error("Operação " + operation + " não implementada para preenchimento de dados.");
        }

        // Fill Custom
        await this.fillDefaultValuesCustom(repositoryClient, dataRequest, operation, nameOperation);

        // Fill Associates
        if (operation !== OPERATION_BUSINESS.QUERY) {
            await this.fillDefaultValuesAssociates(repositoryClient, dataRequest, operation, nameOperation);
        }
    }

    /* Auxiliares */
    createData(data: Object, session?: IDataSecurityAuth): IDataRequest {
        return { data, session };
    }

    createCondition(condition: Object, session?: IDataSecurityAuth): IDataRequest {
        return { condition, session };
    }

    /* Metodos overrides */
    // async fillDefaultValuesCustom(dataRequest: IDataRequest, operation: OPERATION_BUSINESS, nameOperation?: string): Promise<void> {
    async fillDefaultValuesCustom(repositoryClient: IRepositoryClient, dataRequest: IDataRequest, operation: OPERATION_BUSINESS, nameOperation?: string): Promise<void> {
        
    }

    // async validateCustom(dataRequest: IDataRequest, operation: OPERATION_BUSINESS, nameOperation?: string): Promise<IResultAdapter> {
    async validateCustom(repositoryClient: IRepositoryClient, dataRequest: IDataRequest, operation: OPERATION_BUSINESS, nameOperation?: string): Promise<IResultAdapter> {
        return { status: true };
    }

    // ignoreFieldCompanyCustom(nameOperation?: string): boolean {
    ignoreFieldCompanyCustom(nameOperation?: string): boolean {
        return false;
    }
}
