import { CoordinateSystemConversion, ICoordinateSystemConversion } from "./CoordinateSystemConversion";
import { Vector3, PerspectiveCamera, Light } from "three";
import { IVector3 } from "./Common";
import { CameraSpecification } from "./CameraSpecification";
import { Application } from "./Application";
import { StorageVector3 } from "./Classes/StorageVector3";
import { LightingSpecification } from "./LightingSpecification";


export class LocalStorageManager {
    public static readonly PreferredCoordinateSystemName = 'PreferredCoordinateSystem';
    public static readonly PreferredCameraSpecificationName = 'PreferredCameraSpecification';
    public static readonly PointLocationName = 'PointLocation';
    public static readonly LightingSpecificationName = 'LightingSpecification';


    public static LightingSpecificationExists(): boolean {
        let output = LocalStorageManager.LightingSpecificationName in localStorage;
        return output;
    }

    public static LoadLightingSpecification(): LightingSpecification {
        let exists = LocalStorageManager.LightingSpecificationExists();
        if(!exists) {
            return null;
        }

        let json = localStorage.getItem(LocalStorageManager.LightingSpecificationName);
        let obj = JSON.parse(json);

        let output = new LightingSpecification();
        output.FromObject(obj)

        return output;
    }

    public static SaveLightingSpecification(lightingSpecification: LightingSpecification): void {
        let obj = lightingSpecification.ToObject();
        let json = JSON.stringify(obj);
        localStorage.setItem(LocalStorageManager.LightingSpecificationName, json);
    }

    public static PointLocationExists(): boolean {
        let output = LocalStorageManager.PointLocationName in localStorage;
        return output;
    }

    public static LoadPointLocation(): Vector3 {
        let exists = LocalStorageManager.PointLocationExists();
        if(!exists) {
            return null;
        }

        let json = localStorage.getItem(LocalStorageManager.PointLocationName);
        let obj = JSON.parse(json);

        let output = StorageVector3.ToVector3FromObj(obj);
        return output;
    }

    public static SavePointLocation(point: Vector3) : void {
        let obj = StorageVector3.ToObjFromVector3(point);
        let json = JSON.stringify(obj);
        localStorage.setItem(LocalStorageManager.PointLocationName, json);
    }

    public static PreferredCameraSpecificationExists(): boolean {
        let output = LocalStorageManager.PreferredCameraSpecificationName in localStorage;
        return output;
    }

    /**
     * Loads the preferred camera position from local storage.
     * 
     * If the value is not present, returns null.
     */
    public static LoadPreferredCameraSpecification(): CameraSpecification {
        let exists = LocalStorageManager.PreferredCameraSpecificationExists();
        if (!exists) {
            return null;
        }

        let json = localStorage.getItem(LocalStorageManager.PreferredCameraSpecificationName);
        let obj = JSON.parse(json);

        let output = new CameraSpecification();
        output.FromObject(obj);
        return output;
    }

    public static SavePreferredCameraSpecification(cameraSpecification: CameraSpecification): void {
        let obj = cameraSpecification.ToObject();
        let json = JSON.stringify(obj);
        localStorage.setItem(LocalStorageManager.PreferredCameraSpecificationName, json);
    }

    public static PreferredCoordinateSystemExists(): boolean {
        let output = LocalStorageManager.PreferredCoordinateSystemName in localStorage;
        return output;
    }

    /**
     * Loads the preferred coordinate system conversion from local storage.
     * 
     * If the value is not present, returns null.
     */
    public static LoadPreferredCoordinateSystem(): CoordinateSystemConversion {
        let exists = LocalStorageManager.PreferredCoordinateSystemExists();
        if (!exists) {
            return null;
        }

        let json = localStorage.getItem(LocalStorageManager.PreferredCoordinateSystemName);
        let obj = JSON.parse(json);

        let output = new CoordinateSystemConversion();
        output.FromObject(obj);

        return output;
    }

    public static SavePreferredCoordinateSystem(coordinateSystem: CoordinateSystemConversion): void {
        let obj = coordinateSystem.ToObject();
        let json = JSON.stringify(obj);
        localStorage.setItem(LocalStorageManager.PreferredCoordinateSystemName, json);
    }
}