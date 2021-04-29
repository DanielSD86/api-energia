import { AbstractEntity } from "@lib/entity/AbstractEntity";
import { FIELD_COMPANY, FIELD_DATE_CREATE, FIELD_DATE_DISABLE, FIELD_DATE_UPDATE, FIELD_INTEGRATION, FIELD_USER_CREATE, FIELD_USER_DISABLE, FIELD_USER_UPDATE, TYPE_CASE, TYPE_FIELD } from "@lib/entity/EntityConsts";

export abstract class AbstractCompanyEntity extends AbstractEntity {
    constructor(group: string, name: string) {
        super(group, name);
    }

    addFieldDateTimeCreate(): void {
        this.addField({
            name: FIELD_DATE_CREATE,
            label: "data de criação",
            type: TYPE_FIELD.DATETIME,
        });
    }

    addFieldDateTimeUpdate(): void {
        this.addField({
            name: FIELD_DATE_UPDATE,
            label: "data de atualização",
            type: TYPE_FIELD.DATETIME,
            allowNull: true,
        });
    }

    addFieldDateTimeDisable(): void {
        this.addField({
            name: FIELD_DATE_DISABLE,
            label: "data de desativação",
            type: TYPE_FIELD.DATETIME,
            allowNull: true,
        });
    }

    addFieldIntegration(createIndex: boolean = true): void {
        this.addField({
            name: FIELD_INTEGRATION,
            label: "código de integração",
            type: TYPE_FIELD.TEXT,
            size: 500,
            allowNull: true,
            typeCase: TYPE_CASE.NORMAL,
        });

        if (createIndex) {
            this.addIndexUnique([FIELD_COMPANY, FIELD_INTEGRATION]);
        }        
    }

    addFieldsAllLogs(): void {
        this.addFieldDateTimeCreate();
        this.addFieldDateTimeUpdate();    
        this.addFieldDateTimeDisable();
    }
}
