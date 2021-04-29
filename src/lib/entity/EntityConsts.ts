export enum TYPE_FIELD {
    TEXT,
    INTEGER,
    BIGINTEGER,
    DECIMAL,
    BIGDECIMAL,
    DATE,
    TIME,
    DATETIME,
    BOOLEAN
}

export enum TYPE_CASE {
    UPPER,
    LOWER,
    NORMAL,
    NUMBERONLY
}

export const ENTITY_COMPANY = "sistemas.empresas";
export const FIELD_COMPANY = "id_empresa";
export const FIELD_USER_CREATE = "id_usuario_create";
export const FIELD_USER_UPDATE = "id_usuario_update";
export const FIELD_USER_DISABLE = "id_usuario_disable";
export const FIELD_DATE_CREATE = "dh_create";
export const FIELD_DATE_UPDATE = "dh_update";
export const FIELD_DATE_DISABLE = "dh_disable";
export const FIELD_INTEGRATION = "cd_integracao";
