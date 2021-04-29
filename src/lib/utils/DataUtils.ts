import { AbstractLayerBusiness } from "@lib/layers/business/AbstractLayerBusiness";
import { IDataRequest } from "@lib/layers/IAdapter";
import { StringUtils } from "./StringUtils";

export const DataUtils = {
    get(data: object[], index: number = 0): object {
        if (!data) return null;
        if (data.length ===0 ) return null;

        return data[index];
    },
    getField(data: object[], field: string, index: number = 0): object {
        if (!data) return null;
        if (data.length ===0 ) return null;

        if (data[index][field] === undefined) return null;
        return data[index][field];
    },
    set(data: object[], value: object, index: number = 0): void {
        data[index] = value;
    },
    add(data: object[], field: string, value: object, index: number = 0): void {
        data[index][field] = value;
    },
    getValueRequest(dataRequest: IDataRequest, field: string): any {
        if (dataRequest.data) {
            if (dataRequest.data[field]) {
                return dataRequest.data[field];
            }
        }

        if (dataRequest.condition) {
            if (dataRequest.condition[field]) {
                return dataRequest.condition[field];
            }
        }

        return undefined;
    },
    getFieldsRequired(data: any, fields: string[], fieldsLabel?: string[]): { status: boolean, message: string[] } {
        const message: string[] = [];
        
        for (const idx in fields) {
            if (data[fields[idx]] === undefined || data[fields[idx]] === null) {
                let label = fields[idx];

                if (fieldsLabel) {
                    label = fieldsLabel[idx];
                }

                message.push(StringUtils.getFormatMsg(AbstractLayerBusiness.MSG_FIELD_REQUIRED, label));
            }
        }

        return {
            status: message.length === 0,
            message,
        }
    },
    getFieldName(field: string): string {     
        let result = "";
        for (let idx = 0; idx < field.length; idx ++) {
            const asci = field.charCodeAt(idx);

            if (asci >= 65 && asci <= 90) {
                result += "_" + field[idx].toLowerCase();
            } else result += field[idx].toLowerCase();
        }
        return result;
    },
    getFieldNameDom(field: string): string {     
        let result = "";
        let underline = false;
        for (const letra of field) {
            if (letra === "_") {
                underline = true;
                continue;
            }

            if (underline) {
                result += letra.toUpperCase();
                underline = false;
            }
            else
            result += letra.toLowerCase();
        }
        return result;
    },
};
