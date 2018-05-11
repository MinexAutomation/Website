import { ISurfaceSelector } from "./ISurfaceSelector";
import { BoxSurfaceSelector } from "./BoxSurfaceSelector";
import { SphereSurfaceSelector } from "./SphereSurfaceSelector";
import { IVector3 } from "../Classes/Vectors/IVector3";
import { Vector3Storage } from "../Classes/Vectors/Vector3Storage";


export interface IBoxStorage {
    SurfaceSelectorTypeID: string,
    Corner1: IVector3,
    Corner2: IVector3,
}

export interface ISphereStorage {
    SurfaceSelectorTypeID: string,
    Center: IVector3,
    Radius: number,
}


/**
 * Handles conversion to/from JSON format objects.
 */
export class SurfaceSelectorLocalStorageManager {
    public static IsBoxStorage(obj: any): obj is IBoxStorage {
        return obj.SurfaceSelectorTypeID === BoxSurfaceSelector.SurfaceSelectorTypeID;
    }

    public static IsSphereStorage(obj: any): obj is ISphereStorage {
        return obj.SurfaceSelectorTypeID === SphereSurfaceSelector.SurfaceSelectorTypeID;
    }


    public static ToObject(surfaceSelector: ISurfaceSelector): any {
        if(surfaceSelector instanceof BoxSurfaceSelector) {
            let corner1 = Vector3Storage.ToObjFromVector3(surfaceSelector.Corner1);
            let corner2 = Vector3Storage.ToObjFromVector3(surfaceSelector.Corner2);

            let output: IBoxStorage = {
                SurfaceSelectorTypeID: BoxSurfaceSelector.SurfaceSelectorTypeID,
                Corner1: corner1,
                Corner2: corner2,
            };
            return output;
        }

        if(surfaceSelector instanceof SphereSurfaceSelector) {
            let center = Vector3Storage.ToObjFromVector3(surfaceSelector.Center);

            let output = {
                SurfaceSelectorTypeID: SphereSurfaceSelector.SurfaceSelectorTypeID,
                Center: center,
                Radius: surfaceSelector.Radius,
            };
            return output;
        }

        console.error('Unknown surface selector type.');
    }

    public static ToSurfaceSelector(obj: any): ISurfaceSelector {
        if(SurfaceSelectorLocalStorageManager.IsBoxStorage(obj)) {
            let corner1 = Vector3Storage.ToVector3FromObj(obj.Corner1);
            let corner2 = Vector3Storage.ToVector3FromObj(obj.Corner2);

            let output = new BoxSurfaceSelector(corner1, corner2);
            return output;
        }

        if(SurfaceSelectorLocalStorageManager.IsSphereStorage(obj)) {
            let center = Vector3Storage.ToVector3FromObj(obj.Center)
            let radius = obj.Radius;

            let output = new SphereSurfaceSelector(center, radius);
            return output;
        }

        console.error('Unknown surface selector type.');
    }
}