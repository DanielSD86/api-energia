export enum TYPE_FORMAT {
    JSON = "json",
    CSV = "csv",
    PDF = "pdf",
    XML = "xml",
}

export interface IOptionsQuery {
    limit?: number;
    page?: number;
    orderBy?: String[];
    orderByDesc?: String[];
    format?: TYPE_FORMAT;
    includes?: string[];
}
