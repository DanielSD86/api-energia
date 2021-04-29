import { IEntity } from "./IEntity";

export interface IForeignKey {
    name?: String;

    entity: IEntity;
    source?: string[];
    target?: string[];
    
    allowNull?: Boolean;
    primaryKey?: Boolean;
}