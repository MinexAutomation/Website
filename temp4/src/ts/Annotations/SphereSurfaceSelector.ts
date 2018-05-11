import { ISurfaceSelector } from "./ISurfaceSelector";
import { Vector3 } from "three";
import { ISimpleEvent, SimpleEvent } from "../Common/Events/SimpleEvent";
import { CoordinateSystemConversion } from "../CoordinateSystemConversion";
import { Application } from "../Application";


export class SphereSurfaceSelector implements ISurfaceSelector {
    public static readonly SurfaceSelectorTypeID = 'SPHERE';
    public static IsSphereSurfaceSelector(surfaceSelector: ISurfaceSelector): surfaceSelector is SphereSurfaceSelector {
        return surfaceSelector.SurfaceSelectorTypeID === SphereSurfaceSelector.SurfaceSelectorTypeID;
    }


    public get SurfaceSelectorTypeID(): string {
        return SphereSurfaceSelector.SurfaceSelectorTypeID;
    }

    private zChanged: SimpleEvent<ISurfaceSelector> = new SimpleEvent<ISurfaceSelector>();
    public get Changed(): ISimpleEvent<ISurfaceSelector> {
        return this.zChanged.AsEvent();
    }
    private OnChanged(): void {
        this.zChanged.Dispatch(this);
    }

    private zCenter: Vector3 = new Vector3();
    /**
     * Get a clone of the point.
     */
    public get Center(): Vector3 {
        return this.zCenter.clone();
    }
    /**
     * Copy values from a given point.
     */
    public set Center(value: Vector3) {
        this.zCenter.copy(value);

        this.OnChanged();
    }

    private zRadius: number;
    public get Radius(): number {
        return this.zRadius;
    }
    public set Radius(value: number) {
        this.zRadius = value;

        this.OnChanged();
    }


    public constructor(center: Vector3 = new Vector3(0, 0, 0), radius: number = 1) {
        this.Center = center;
        this.Radius = radius;
    }

    IncludePoint(x: number, y: number, z: number): boolean {
        let deltaX = x - this.Center.x;
        let deltaY = y - this.Center.y;
        let deltaZ = z - this.Center.z;

        let distanceSquared = Math.pow(deltaX, 2) + Math.pow(deltaY, 2) + Math.pow(deltaZ, 2);
        let distance = Math.sqrt(distanceSquared);

        let output = distance <= this.Radius;
        return output;
    }
}