import { CoordinateSystemConversion, ICoordinateSystemConversion } from "./CoordinateSystemConversion";
import { Vector3, PerspectiveCamera, Light } from "three";
import { CameraSpecification } from "./CameraSpecification";
import { Application } from "./Application";
import { LightingSpecification } from "./LightingSpecification";
import { CategoriesManager } from "./Annotations/CategoriesManager";
import { IdentifiedManager } from "./Common/IdentifiedManager";
import { PointAnnotation } from "./Annotations/PointAnnotation";
import { Vector3Storage } from "./Classes/Vectors/Vector3Storage";
import { SurfaceAnnotation } from "./Annotations/SurfaceAnnotation";


export class LocalStorageManager {
    public static readonly PreferredCoordinateSystemName = 'PreferredCoordinateSystem';
    public static readonly PreferredCameraSpecificationName = 'PreferredCameraSpecification';
    public static readonly PointLocationName = 'PointLocation';
    public static readonly LightingSpecificationName = 'LightingSpecification';
    public static readonly CategoriesName = 'Categories';
    public static readonly PointAnnotationsName = 'Point Annotations';
    public static readonly SurfaceAnnotationsName = 'Surface Annotations';


    public static SurfaceAnnotationsExist(): boolean {
        let output = LocalStorageManager.SurfaceAnnotationsName in localStorage;
        return output;
    }

    public static LoadSurfaceAnnotations(): IdentifiedManager<SurfaceAnnotation> {
        let exists = LocalStorageManager.SurfaceAnnotationsExist();
        if(!exists) {
            return null;
        }

        let json = localStorage.getItem(LocalStorageManager.SurfaceAnnotationsName);
        let objs = JSON.parse(json);

        let output = new IdentifiedManager<SurfaceAnnotation>();
        output.FromObject(objs, (obj) => {
            let output = new SurfaceAnnotation();
            output.FromObject(obj);
            return output;
        });

        return output;
    }

    public static SaveSurfaceAnnotations(surfaceAnnotations: IdentifiedManager<SurfaceAnnotation>): void {
        let obj = surfaceAnnotations.ToObject((value: SurfaceAnnotation) => {
            let obj = value.ToObject();
            return obj;
        });
        let json = JSON.stringify(obj);
        localStorage.setItem(LocalStorageManager.SurfaceAnnotationsName, json);
    }

    public static PointAnnotationsExist(): boolean {
        let output = LocalStorageManager.PointAnnotationsName in localStorage;
        return output;
    }

    public static LoadPointAnnotations(): IdentifiedManager<PointAnnotation> {
        let exists = LocalStorageManager.PointAnnotationsExist();
        if(!exists) {
            return null;
        }

        let json = localStorage.getItem(LocalStorageManager.PointAnnotationsName);
        let objs = JSON.parse(json);

        let output = new IdentifiedManager<PointAnnotation>();
        output.FromObject(objs, (obj) => {
            let output = new PointAnnotation();
            output.FromObject(obj);
            return output;
        });

        return output;
    }

    public static SavePointAnnotations(pointAnnotations: IdentifiedManager<PointAnnotation>): void {
        let obj = pointAnnotations.ToObject((value: PointAnnotation) => {
            let obj = value.ToObject();
            return obj;
        });
        let json = JSON.stringify(obj);
        localStorage.setItem(LocalStorageManager.PointAnnotationsName, json);
    }

    public static CategoriesExist(): boolean {
        let output = LocalStorageManager.CategoriesName in localStorage;
        return output;
    }

    public static LoadCategories(): CategoriesManager {
        let exists = LocalStorageManager.CategoriesExist();
        if(!exists) {
            return null;
        }

        let json = localStorage.getItem(LocalStorageManager.CategoriesName);
        let obj = JSON.parse(json);

        let output = new CategoriesManager();
        output.FromObject(obj)

        return output;
    }

    public static SaveCategories(categories: CategoriesManager): void {
        let obj = categories.ToObject();
        let json = JSON.stringify(obj);
        localStorage.setItem(LocalStorageManager.CategoriesName, json);
    }

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

        let output = Vector3Storage.ToVector3FromObj(obj);
        return output;
    }

    public static SavePointLocation(point: Vector3) : void {
        let obj = Vector3Storage.ToObjFromVector3(point);
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