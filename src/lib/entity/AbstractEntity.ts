import QueryUtils from "@lib/repository/query/QueryBuilderUtils";
import { TYPE_CASE, TYPE_FIELD } from "./EntityConsts";
import { ICheckConstraint, IFieldCheckConstraint } from "./ICheckConstraint";
import { IEntity } from "./IEntity";
import { IField } from "./IField";
import { IForeignKey } from "./IForeignKey";
import { IIndexes } from "./IIndexes";

export abstract class AbstractEntity implements IEntity {
    schema: string;
    group: string;
    name: string;
    fields: IField[];
    foreignKeys: IForeignKey[];
    checkConstraint: ICheckConstraint[];
    indexes: IIndexes[];

    constructor(group: string, name: string) {
        this.schema = group;
        this.group = group;
        this.name = name;
        this.fields = [];
        this.foreignKeys = [];
        this.indexes = [];
        this.checkConstraint = [];
    }
    
    getFullName(): string {
        let name = this.name;
        if (this.schema !== "") name = this.schema  + "." + name;
        return name;
    }

    getId(): IField {
        return this.fields.filter((field) => field.primaryKey && field.autoGenerate)[0];
    }

    addField(field: IField) {
        this.fields.push(field);
    }

    addCheckConstraint(check: ICheckConstraint): void {
        const checkCustom = { ...check };

        if (!checkCustom.name) {
            checkCustom.name = "chk_" + QueryUtils.getInitialsEntity(this) + "_" + checkCustom.field;
        }        

        this.checkConstraint.push(checkCustom);
    }

    addCheckConstraintEnum(fieldName: string, list: any): void {
        const values = [];
        const field = this.getField(fieldName);

        for (const idx in list) {
            const value = QueryUtils.getValue(field, list[idx]);
            values.push(value);
        }
        
        this.addCheckConstraint({
            field: fieldName,
            values,
        });
    }

    addFieldId(name: string, typeInteger: boolean = false) {
       this.addField({
            name,
            type: (typeInteger ? TYPE_FIELD.INTEGER : TYPE_FIELD.BIGINTEGER),
            primaryKey: true,
            autoGenerate: true, 
        });
    }

    addFieldBoolean(name: string, label: string, defaultValue: boolean) {
        this.addField({
            name,
            label,
            type: TYPE_FIELD.BOOLEAN,
            defaultValue,
        });
    }

    addFieldCheckInteger(name: string, label: string, list: any, defaultValue?: number) {
        this.addField({
             name,
             label,
             type: TYPE_FIELD.INTEGER,
             defaultValue,
         });

         this.addCheckConstraintEnum(name, list);
    }

    addFieldInteger(name: string, label: string, defaultValue?: number) {
        this.addField({
             name,
             label,
             type: TYPE_FIELD.INTEGER,
             defaultValue,
         });
    }

    addFieldIntegerNull(name: string, label: string, defaultValue?: number) {
        this.addField({
             name,
             label,
             type: TYPE_FIELD.INTEGER,
             defaultValue,
             allowNull: true, 
         });
     }

    addFieldText(name: string, label: string, size: number = 0, typeCase: TYPE_CASE = TYPE_CASE.UPPER) {
        this.addField({
            name,
            label,
            type: TYPE_FIELD.TEXT,
            size,
            typeCase,
        });
    }

    addFieldCheckText(name: string, label: string, list: any, size: number, defaultValue?: string, typeCase: TYPE_CASE = TYPE_CASE.UPPER) {
        this.addField({
             name,
             label,
             size,
             type: TYPE_FIELD.TEXT,
             typeCase,
             defaultValue,
         });

         this.addCheckConstraintEnum(name, list);
    }

    addFieldDecimal(name: string, label: string, size: number = 10, precision: number = 2) {
        this.addField({
            name,
            label,
            type: TYPE_FIELD.DECIMAL,
            size,
            precision
        });
    }

    addFieldDecimalNull(name: string, label: string, size: number = 10, precision: number = 2) {
        this.addField({
            name,
            label,
            type: TYPE_FIELD.DECIMAL,
            size,
            precision,
            allowNull: true,
        });
    }

    addFieldDate(name: string, label: string) {
        this.addField({
            name,
            label,
            type: TYPE_FIELD.DATE,
        });
    }

    addFieldDateNull(name: string, label: string) {
        this.addField({
            name,
            label,
            type: TYPE_FIELD.DATE,
            allowNull: true,
        });
    }

    addFieldTimestamp(name: string, label: string) {
        this.addField({
            name,
            label,
            type: TYPE_FIELD.DATETIME,
        });
    }

    addFieldTimestampNull(name: string, label: string) {
        this.addField({
            name,
            label,
            type: TYPE_FIELD.DATETIME,
            allowNull: true,
        });
    }

    addFieldTextNull(name: string, label: string, size: number = 0, typeCase: TYPE_CASE = TYPE_CASE.UPPER) {
        this.addField({
            name,
            label,
            type: TYPE_FIELD.TEXT,
            size,
            allowNull: true,
            typeCase,
        });
    }

    addIndexBusiness(fields: string[]) {
        const field = this.getFieldBusiness();

        if (field.length > 0) {
            throw new Error("Só pode existir um único indice de negócio (entidade: " + this.name + ")");
        }

        this.addIndex({
            fields,
            business: true,
            unique: true,
        }); 
    };

    addIndexUnique(fields: string[]) {
        this.addIndex({
            fields,
            unique: true,
        }); 
    };

    addIndexNonUnique(...fields: string[]) {
        this.addIndex({
            fields,
        }); 
    };

    addIndex(index: IIndexes) {
        const indexCustom = { ...index };

        if (!indexCustom.name) {
            let nameIndex = QueryUtils.getInitialsEntity(this);          

            for (let idxField in indexCustom.fields) {
                nameIndex += "_" + indexCustom.fields[idxField];
            }

            indexCustom.name = (indexCustom.unique ? "uidx" : "idx") + "_" + nameIndex;
        }

        // Limite do PG
        indexCustom.name = indexCustom.name.substr(0, 63);

        this.indexes.push(indexCustom);
    }

    addFieldForeignKey(entity: IEntity, allowNull: boolean = false) {
       this.addForeignKey({
            entity,
            allowNull,
       });
    }

    addForeignKey(field: IForeignKey) {
        let foreignKey = { ...field };

        if (!field.source) {
            foreignKey.source = field.entity
                .getPrimaryKeys()
                .map((field) => field.name);
        }

        if (!field.target) {
            foreignKey.target = foreignKey.source;
        }

        for (const idx in foreignKey.source) {
            const fieldNew = field.entity.getFieldBasic(foreignKey.source[idx]);

            fieldNew.name = foreignKey.target[idx];
            if (foreignKey.allowNull) fieldNew.allowNull = true;
            if (foreignKey.primaryKey) fieldNew.primaryKey = true;
            if (this.getField(foreignKey.target[idx]) === null)
                this.addField(fieldNew);
        }

        if (!field.name) {
            let nameIndex = QueryUtils.getInitialsEntity(this);          

            for (let idxField in foreignKey.target) {
                nameIndex += "_" + foreignKey.target[idxField];
            }

            foreignKey.name = "fkc_" + nameIndex;
        }

        this.foreignKeys.push(foreignKey);
    }

    getField(fieldName: String): IField {
        const field = this.fields.filter(
            (field) => field.name === fieldName
        )[0];
        if (!field) return null;
        return { ...field };
    }

    getFieldBasic(fieldName: String): IField {
        const field = this.fields.filter(
            (field) => field.name === fieldName
        )[0];
        if (!field) return null;

        const { name, type, size, typeCase, label } = { ...field };
        const basic = { name, type, size, typeCase, label };

        if (!basic.size) delete basic.size;
        if (!basic.typeCase) delete basic.typeCase;

        return basic;
    }

    getFieldsDefault(): IField[] {
        return this.fields.filter((field) => field.defaultValue !== undefined);
    }

    getFieldsRequired(): IField[] {
        return this.fields.filter((field) => (!field.allowNull));
    }

    getPrimaryKeys(): IField[] {
        return this.fields.filter((field) => field.primaryKey);
    }

    getFieldAutoGenerate(): IField[] {
        return this.fields.filter((field) => field.autoGenerate);
    }

    getFieldBusiness(): IField[] {
        const indexBusiness = this.indexes.find((index) => index.business);
        const result: IField[] = [];

        if (!indexBusiness) return [];

        for (const idx in indexBusiness.fields) {
            result.push(this.getField(indexBusiness.fields[idx]));
        }

        return result;
    }

    getFieldsCheckConstraint(): IFieldCheckConstraint[] {
        const result: IFieldCheckConstraint[] = [];

        for (const idx in this.checkConstraint) {
            const fieldCheck: IFieldCheckConstraint = {
                check: this.checkConstraint[idx],
                field: this.getField(this.checkConstraint[idx].field),
            }

            result.push(fieldCheck);
        }

        return result;
    }
}
