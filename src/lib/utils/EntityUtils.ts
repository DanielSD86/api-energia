import { FIELD_COMPANY, FIELD_DATE_CREATE, FIELD_DATE_DISABLE, FIELD_DATE_UPDATE, FIELD_USER_CREATE, FIELD_USER_DISABLE, FIELD_USER_UPDATE } from "@lib/entity/EntityConsts";
import { IEntity } from "@lib/entity/IEntity";
import { IResultAdapter } from "@lib/layers/IAdapter";
import QueryUtils from "@lib/repository/query/QueryBuilderUtils";
import { StringUtils } from "./StringUtils";

const MSG_FIELD_REQUIRED = "Campo {0} é obrigatório(a)."
const MSG_FIELD_CHECK_INVALID = "Campo {0} possui valor inválido ({1}).";

export enum TYPE_VALIDATE {
    CREATE = "create",
    UPDATE = "update",
    SCOPE = "scope",
    REQUIRED_FIELDS = "required",
    CHECK_FIELDS = "check",
}

export class EntityUtils {
    static async validate(entity: IEntity, data: any, typeValidate: TYPE_VALIDATE, prefEntidade?: string): Promise<IResultAdapter> {
        const messages = [];
        const listData = [];

        if (Array.isArray(data)) {
            listData.push(...data);
        } else {
            listData.push(data);
        }

        // Validação de campos obrigatorios
        if (typeValidate !== TYPE_VALIDATE.CHECK_FIELDS) {
            const fieldsRequired = entity.getFieldsRequired();
         
            for (const idx in listData) {
                let prefMessage = "";
                const record = listData[idx];

                if (listData.length > 1) prefMessage = "Registro " + (parseInt(idx) + 1) + " - ";
                if (prefEntidade) prefMessage = prefEntidade + ": " + prefMessage;

                for (const field of fieldsRequired) {
                    let notFill = false; 
                    const valueField = record[field.name];

                    if (typeValidate !== TYPE_VALIDATE.UPDATE) {
                        notFill = valueField === undefined || valueField === null;
                    } else {
                        notFill = valueField === null;
                    }

                    if (notFill) {
                        // Ignora na criação, se for auto generate
                        if ((typeValidate === TYPE_VALIDATE.CREATE) && (field.autoGenerate)) continue;

                        // Se possuir default, pode ignorar o não preenchimento
                        if ((typeValidate === TYPE_VALIDATE.CREATE) && (field.defaultValue !== undefined)) continue;

                        // Lista de itens ignorados de obrigatoriedade, pois na persistencia são preenchidos
                        if ([FIELD_COMPANY, 
                             FIELD_DATE_CREATE, FIELD_DATE_DISABLE, FIELD_DATE_UPDATE,
                             FIELD_USER_CREATE, FIELD_USER_DISABLE, FIELD_USER_UPDATE,
                            ].includes(field.name)) continue;

                        messages.push(prefMessage + StringUtils.getFormatMsg(MSG_FIELD_REQUIRED, (field.label || field.name)));
                        continue;
                    }
                }        
            }
        }

        // Valida a check constraints
        if (typeValidate !== TYPE_VALIDATE.REQUIRED_FIELDS) {
            const fieldsCheck = entity.getFieldsCheckConstraint();

            for (const idx in listData) {
                let prefMessage = "";
                const record = listData[idx];

                if (listData.length > 1) prefMessage = "Registro " + (parseInt(idx) + 1) + " - ";
                if (prefEntidade) prefMessage = prefEntidade + ": " + prefMessage;

                for (const field of fieldsCheck) {
                    const valueField = record[field.field.name];

                    // Tem que estar informado
                    if (valueField === undefined || valueField === null) continue;

                    // Recupera o valor
                    const value = QueryUtils.getValue(field.field, valueField);

                    // Valida se existe na listagem de check
                    if (!field.check.values.includes(value)) {
                        messages.push(prefMessage + StringUtils.getFormatMsg(MSG_FIELD_CHECK_INVALID, (field.field.label || field.field.name), field.check.values.join("|")));
                    }
                }
            }
        }        

        return {
            status: messages.length === 0,
            message: messages,
        };
    }
}