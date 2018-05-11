import { Box3My } from "../Classes/Box3My";
import { SimpleEvent, ISimpleEvent } from "../Common/Events/SimpleEvent";
import { ISurfaceSelector } from "./ISurfaceSelector";
import { Vector3 } from "three";



/**
 * Selects points within the cartesian axes-aligned box specifid by two corner points.
 */
export class BoxSurfaceSelector implements ISurfaceSelector {
    public static readonly SurfaceSelectorTypeID = 'BOX';
    public static IsBoxSurfaceSelector(surfaceSelector: ISurfaceSelector): surfaceSelector is BoxSurfaceSelector {
        return surfaceSelector.SurfaceSelectorTypeID === BoxSurfaceSelector.SurfaceSelectorTypeID;
    }

    
    public get SurfaceSelectorTypeID(): string {
        return BoxSurfaceSelector.SurfaceSelectorTypeID;
    }

    private zChanged: SimpleEvent<ISurfaceSelector> = new SimpleEvent<ISurfaceSelector>();
    public get Changed(): ISimpleEvent<ISurfaceSelector> {
        return this.zChanged.AsEvent();
    }
    private OnChanged(): void {
        this.zChanged.Dispatch(this);
    }

    private zCorner1: Vector3 = new Vector3();
    /**
     * Get a clone of the point.
     */
    public get Corner1(): Vector3 {
        return this.zCorner1.clone();
    }
    /**
     * Copy values from a given point.
     */
    public set Corner1(value: Vector3) {
        this.zCorner1.copy(value);

        this.UpdateBoundingBox();
        this.OnChanged();
    }

    private zCorner2: Vector3 = new Vector3();
    /**
     * Get a clone of the point.
     */
    public get Corner2(): Vector3 {
        return this.zCorner2.clone();
    }
    /**
     * Copy values from a given point.
     */
    public set Corner2(value: Vector3) {
        this.zCorner2.copy(value);

        this.UpdateBoundingBox();
        this.OnChanged();
    }

    private BoundingBox: Box3My = new Box3My();
    private UpdateBoundingBox(): void {
        this.BoundingBox.Update(this.zCorner1.x, this.zCorner2.x, this.zCorner1.y, this.zCorner2.y, this.zCorner1.z, this.zCorner2.z);
    }


    public constructor(corner1: Vector3 = new Vector3(0, 0, 0), corner2: Vector3 = new Vector3(1, 1, 1)) {
        this.Corner1 = corner1;
        this.Corner2 = corner2;
    }

    private IsDisposed: boolean = false;
    public Dispose(): void {
        if(!this.IsDisposed) {

        }
    }

    public IncludePoint(x: number, y: number, z: number): boolean {
        let output = this.BoundingBox.Contains(x, y, z);
        return output;
    }
}