import { Vector3 } from "three";
import { ISimpleEvent } from "../Common/Events/SimpleEvent";


/**
 * Interface for classes that select surface sub-sections by specifying points on the surface for inclusion in the sub-section.
 */
export interface ISurfaceSelector {
    /**
     * An ID identifying the type of the surface selector.
     */
    SurfaceSelectorTypeID: string;

    /**
     * Event notifying listeners that the surface selector has changed, and thus any previously selected surfaces might now be invalid.
     */
    Changed: ISimpleEvent<ISurfaceSelector>;

    /**
     * Allows implementors to designate surface points for inclusion in a surface sub-section.
     * @param point A point to test for surface sub-section inclusion.
     */
    IncludePoint(x: number, y: number, z: number): boolean;
}


