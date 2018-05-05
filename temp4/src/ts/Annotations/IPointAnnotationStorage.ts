import { IIdentified } from "../Common/Interfaces/IIdentified";
import { IVector3 } from "../Classes/Vectors/IVector3";
import { IVisualSpecification } from "../Classes/VisualSpecification";


export interface IPointAnnotationStorage extends IIdentified {
    Description: string;
    CategoryID: number,
    Visuals: IVisualSpecification;
    StandardLocation: IVector3;
}