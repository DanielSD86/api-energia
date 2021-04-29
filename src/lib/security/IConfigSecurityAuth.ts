export interface IConfigSecurityAuth {
    token: string;
    expiresIn: string;
}

export const COMPANY = "empresa";
export const USER = "usuario";
export const LOGIN = "login";
export const PASSWORD = "senha";
export const TENANT = "tenant";

export interface  IDataSecurityAuth {
    empresa?: number;
    usuario?: number;
    login: string;    
    senha?: string;
    tenant?:  string;
}
