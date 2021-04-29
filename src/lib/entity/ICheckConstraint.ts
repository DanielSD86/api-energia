import { IField } from "./IField";

export interface ICheckConstraint {
    name?: string;
    field: string;
    values?: any[];
}

export interface IFieldCheckConstraint {
    check: ICheckConstraint;
    field: IField;
}