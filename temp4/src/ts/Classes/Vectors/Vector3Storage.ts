import { IVector3 } from "./IVector3";
import { Vector3 } from "three";

export class Vector3Storage {
    public static ToVector3FromObj(obj: IVector3): Vector3 {
        let output = new Vector3(obj.X, obj.Y, obj.Z);
        return output;
    }

    public static ToObjFromVector3(vector: Vector3): IVector3 {
        let output = {
            X: vector.x,
            Y: vector.y,
            Z: vector.z,
        };
        return output;
    }
}