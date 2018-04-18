import { Vector3 } from "three";
import { SignalEvent, ISignalEvent } from "./Common/Events/SignalEvent";
import { IVector3 } from "./Common";
import { StorageVector3 } from "./Classes/StorageVector3";
import { CoordinateSystemConversion } from "./CoordinateSystemConversion";


export interface ILightingSpecification {
    AmbientOn: boolean;
    AmbientIntensity: number;
    DirectionalOn: boolean;
    DirectionalIntensity: number;
    DirectionalPosition: IVector3;
    PointOn: boolean;
    PointIntensity: number;
    PointLocation: IVector3;
}


export class LightingSpecification {
    private zChanged: SignalEvent = new SignalEvent();
    public get Changed(): ISignalEvent {
        return this.zChanged.AsEvent();
    }
    public AmbientOn: boolean;
    public AmbientIntensity: number;
    public DirectionalOn: boolean;
    public DirectionalIntensity: number;
    public readonly DirectionalPosition: Vector3 = new Vector3();
    public PointOn: boolean;
    public PointIntensity: number;
    public readonly PointLocation: Vector3 = new Vector3();


    public SetDefaults(): void {
        this.AmbientOn = true;
        this.AmbientIntensity = 1;
        
        this.DirectionalOn = false;
        this.DirectionalIntensity = 1;
        this.DirectionalPosition.set(0, 1, 0); // Default for the DirectionalLight.

        this.PointOn = false;
        this.PointIntensity = 1;
        this.PointLocation.set(0, 0, 0);
    }

    /**
     * Allow clients to inform other clients of changes.
     */
    public OnChange() : void {
        this.zChanged.Dispatch();
    }

    public Clone(): LightingSpecification {
        let output = new LightingSpecification();
        output.Copy(this);

        return output;
    }

    public Copy(other: LightingSpecification): void {
        this.AmbientOn = other.AmbientOn;
        this.AmbientIntensity = other.AmbientIntensity;
        this.DirectionalOn = other.DirectionalOn;
        this.DirectionalIntensity = other.DirectionalIntensity;
        this.DirectionalPosition.copy(other.DirectionalPosition);
        this.PointOn = other.PointOn;
        this.PointIntensity = other.PointIntensity;
        this.PointLocation.copy(other.PointLocation);
    }

    public ToObject(): ILightingSpecification {
        let directionalDirection = StorageVector3.ToObjFromVector3(this.DirectionalPosition);
        let pointLocation = StorageVector3.ToObjFromVector3(this.PointLocation);

        let output: ILightingSpecification = {
            AmbientOn: this.AmbientOn,
            AmbientIntensity: this.AmbientIntensity,
            DirectionalOn: this.DirectionalOn,
            DirectionalIntensity: this.DirectionalIntensity,
            DirectionalPosition: directionalDirection,
            PointOn: this.PointOn,
            PointIntensity: this.PointIntensity,
            PointLocation: pointLocation,
        }
        return output;
    }

    public FromObject(obj: ILightingSpecification): void {
        this.AmbientOn = obj.AmbientOn;
        this.AmbientIntensity = obj.AmbientIntensity;
        this.DirectionalOn = obj.DirectionalOn;
        this.DirectionalIntensity = obj.DirectionalIntensity;
        this.DirectionalPosition.set(obj.DirectionalPosition.X, obj.DirectionalPosition.Y, obj.DirectionalPosition.Z);
        this.PointOn = obj.PointOn;
        this.PointIntensity = obj.PointIntensity;
        this.PointLocation.set(obj.PointLocation.X, obj.PointLocation.Y, obj.PointLocation.Z);

        this.OnChange();
    }

    public AdjustToPreferredCoordinateSystem(standardToPreferred: CoordinateSystemConversion): void {
        let standardDirectionalPosition = this.DirectionalPosition.clone();
        let prefDirectionalPosition = CoordinateSystemConversion.ConvertPointStandardToPreferred(standardDirectionalPosition, standardToPreferred);
        this.DirectionalPosition.copy(prefDirectionalPosition);

        let standardPointLocation = this.PointLocation.clone();
        let prefPointLocation = CoordinateSystemConversion.ConvertPointStandardToPreferred(standardPointLocation, standardToPreferred);
        this.PointLocation.copy(prefPointLocation);
    }

    public AdjustToStandardCoordinateSystem(standardToPreferred: CoordinateSystemConversion): void {
        let prefDirectionalPosition = this.DirectionalPosition.clone();
        let standardDirectionalPosition = CoordinateSystemConversion.ConvertPointPreferredToStandard(prefDirectionalPosition, standardToPreferred);
        this.DirectionalPosition.copy(standardDirectionalPosition);

        let prefPointLocation = this.PointLocation;
        let standardPointLocation = CoordinateSystemConversion.ConvertPointPreferredToStandard(prefPointLocation, standardToPreferred);
        this.PointLocation.copy(standardPointLocation);
    }
}