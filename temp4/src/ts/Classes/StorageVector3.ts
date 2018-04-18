import { IVector3 } from "../Common";
import { Vector3 } from "three";



export class StorageVector3 implements IVector3 {
    public static ToObject(vector: Vector3): IVector3 {
        let output = {
            X: vector.x,
            Y: vector.y,
            Z: vector.z,
        }
        return output;
    }

    public static FromObject(obj: IVector3): Vector3 {
        let output = new Vector3(obj.X, obj.Y, obj.Z);
        return output;
    }

    public static ToVector3FromObj(obj: IVector3): Vector3 {
        let output = new Vector3(obj.X, obj.Y, obj.Z);
        return output;
    }

    public static ToObjFromVector3(vector: Vector3): IVector3 {
        let output: IVector3 = {
            X: vector.x,
            Y: vector.y,
            Z: vector.z,
        };
        return output;
    }


    public constructor(public X: number = 0, public Y: number = 0, public Z = 0) {
    }

    public ToObject(): IVector3 {
        let output: IVector3 = {
            X: this.X,
            Y: this.Y,
            Z: this.Z,
        }
        return output;
    }

    public FromObject(obj: IVector3) {
        this.X = obj.X;
        this.Y = obj.Y;
        this.Z = obj.Z;
    }

    public ToVector3(): Vector3 {
        let output = new Vector3(this.X, this.Y, this.Z);
        return output;
    }

    public FromVector3(vector: Vector3) {
        this.X = vector.x;
        this.Y = vector.y;
        this.Z = vector.z;
    }
}