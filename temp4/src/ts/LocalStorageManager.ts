import { CoordinateSystemConversion, ICoordinateSystemConversion } from "./CoordinateSystemConversion";
import { Vector3, Vector } from "three";
import { IVector3 } from "./Common";


export class LocalStorageManager {
    public static readonly PreferredCoordinateSystemName = 'PreferredCoordinateSystem';
    public static readonly PreferredCameraPositionName = 'PreferredCameraPosition';


    public static PreferredCameraPositionExists(): boolean {
        let output = LocalStorageManager.PreferredCameraPositionName in localStorage;
        return output;
    }

    /**
     * Loads the preferred camera position from local storage.
     * 
     * If the value is not present, returns null.
     */
    public static LoadPreferredCameraPosition(): CoordinateSystemConversion {
        let exists = LocalStorageManager.PreferredCameraPositionExists();
        if (!exists) {
            return null;
        }

        let json = localStorage.getItem(LocalStorageManager.PreferredCameraPositionName);
        let obj = JSON.parse(json);

        let output = new CoordinateSystemConversion();
        output.FromObject(obj);

        return output;
    }

    public static SavePreferredCameraPosition(coordinateSystem: CoordinateSystemConversion): void {
        let obj = coordinateSystem.ToObject();
        let json = JSON.stringify(obj);
        localStorage.setItem(LocalStorageManager.PreferredCameraPositionName, json);
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