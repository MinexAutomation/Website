import { SimpleEvent, ISimpleEvent } from "../../Common/Events/SimpleEvent";
import { IVector3 } from "./IVector3";
import { Vector3 } from "three";

/**
 * An evented model class for colors.
 * 
 * Changes are only notified at the level of the whole color, not individual color channels. Thus we can only change the whole color, not individual channel values.
 */
export class Vector3My implements IVector3 {
    private zX: number;
    public get X(): number {
        return this.zX;
    }
    private zY: number;
    public get Y(): number {
        return this.zY;
    }
    private zZ: number;
    public get Z(): number {
        return this.zZ;
    }
    private zChanged = new SimpleEvent<Vector3My>();
    public get Changed(): ISimpleEvent<Vector3My> {
        return this.zChanged.AsEvent();
    }
    private OnChanged(): void {
        this.zChanged.Dispatch(this);
    }


    public constructor(x: number = 0, y: number = 0, z: number = 0) {
        this.zX = x;
        this.zY = y;
        this.zZ = z;
    }

    public Set(x: number, y: number, z: number) {
        this.zX = x;
        this.zY = y;
        this.zZ = z;

        this.OnChanged();
    }

    public ToObject(): IVector3 {
        let output = {
            X: this.X,
            Y: this.Y,
            Z: this.Z,
        };
        return output;
    }

    public FromObject(obj: IVector3): void {
        this.zX = obj.X;
        this.zY = obj.Y;
        this.zZ = obj.Z;

        this.OnChanged();
    }

    public Clone(): Vector3My {
        return new Vector3My(this.X, this.Y, this.Z);
    }

    public Copy(other: Vector3My): void {
        this.zX = other.X;
        this.zY = other.Y;
        this.zZ = other.Z;

        this.OnChanged();
    }

    public ToVector3(): Vector3 {
        let output = new Vector3(this.X, this.Y, this.Z);
        return output;
    }

    public FromVector3(vector: Vector3) {
        this.zX = vector.x;
        this.zY = vector.y;
        this.zZ = vector.z;

        this.OnChanged();
    }

    public ToString(): string {
        let output = `[X: ${this.X.toFixed(2)}, Y: ${this.Y.toFixed(2)}, Z: ${this.Z.toFixed(2)}]`;
        return output;
    }
}