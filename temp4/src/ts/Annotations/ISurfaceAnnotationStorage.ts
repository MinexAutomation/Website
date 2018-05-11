import { IIdentified } from "../Common/Interfaces/IIdentified";
import { IVisualSpecification } from "../Classes/VisualSpecification";
import { IGeometryStorage } from "../Classes/GeometryLocalStorageManager";
import { ISphereStorage, IBoxStorage } from "./SurfaceSelectorLocalStorageManager";


export interface ISurfaceAnnotationStorage extends IIdentified {
    Description: string;
    Selector: ISphereStorage | IBoxStorage;
    Visuals: IVisualSpecification;
    CategoryID: number,
    Geometry: IGeometryStorage;
}