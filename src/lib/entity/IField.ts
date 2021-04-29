import { TYPE_FIELD, TYPE_CASE } from "./EntityConsts";

export interface IDefaultValue {
    value?: Object;
    valueSql?: String;
}

export interface IField {
    name: string;
    type: TYPE_FIELD;
    
    label?: string;
    size?: Number;
    precision?: Number;
    typeCase?: TYPE_CASE;

    primaryKey?: Boolean;
    autoGenerate?: Boolean;    
    allowNull?: Boolean;
    defaultValue?: Object;
}