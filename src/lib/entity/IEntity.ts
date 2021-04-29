import { ICheckConstraint, IFieldCheckConstraint } from "./ICheckConstraint";
import { IField } from "./IField";
import { IForeignKey } from "./IForeignKey";
import { IIndexes } from "./IIndexes";

export interface IEntity {    
    schema: string;
    group: string;
    name: string;
    fields: IField[];
    foreignKeys: IForeignKey[];
    indexes: IIndexes[];
    checkConstraint: ICheckConstraint[];

    addField(field: IField): void;
    addIndex(index: IIndexes): void;
    addIndexBusiness(fields: string[]): void;
    addForeignKey(field: IForeignKey): void;
    addCheckConstraint(check: ICheckConstraint): void;

    getFieldsDefault(): IField[];
    getFieldsRequired(): IField[];
    getFieldsCheckConstraint(): IFieldCheckConstraint[];

    getField(name: String): IField;
    getFieldBasic(fieldName: String): IField;    

    getId(): IField;
    getPrimaryKeys(): IField[];
    getFieldBusiness(): IField[];
    getFieldAutoGenerate(): IField[];

    getFullName(): string;
}
