import { Matrix4, Euler, Vector3, Matrix } from "three";

import { IVector3 } from "./Common";
import { LocalStorageManager } from "./LocalStorageManager";
import { StorageVector3 } from "./Classes/StorageVector3";


export interface ICoordinateSystemConversion {
    readonly Translation: IVector3;
    readonly Rotation: IVector3;
    Scale: number;
}


export class CoordinateSystemConversion {
    public static ConvertPointStandardToPreferred(point: Vector3, standardToPreferred: CoordinateSystemConversion): Vector3 {
        let transformation = CoordinateSystemConversion.TransformationStandardToPreferred(standardToPreferred);

        let output = point.clone();
        output.applyMatrix4(transformation);

        return output;
    }

    public static ConvertPointPreferredToStandard(point: Vector3, standardToPreferred: CoordinateSystemConversion): Vector3 {
        let transformation = CoordinateSystemConversion.TransformationPreferredToStandard(standardToPreferred);

        let output = point.clone();
        output.applyMatrix4(transformation);

        return output;
    }

    public static TransformationStandardToPreferred(standardToPreferred: CoordinateSystemConversion): Matrix4 {
        let rotationStandardToPreferred = CoordinateSystemConversion.RotationStandardToPreferred(standardToPreferred);
        let translationStandardToPreferred = CoordinateSystemConversion.TranslationStandardToPreferred(standardToPreferred);

        let transformation = new Matrix4();
        transformation.premultiply(translationStandardToPreferred);
        transformation.premultiply(rotationStandardToPreferred);

        return transformation;
    }

    public static TransformationPreferredToStandard(standardToPreferred: CoordinateSystemConversion): Matrix4 {
        let rotationPreferredToStandard = CoordinateSystemConversion.RotationPreferredToStandard(standardToPreferred);
        let translationPreferredToStandard = CoordinateSystemConversion.TranslationPreferredToStandard(standardToPreferred);

        let transformation = new Matrix4();
        transformation.premultiply(rotationPreferredToStandard);
        transformation.premultiply(translationPreferredToStandard);
        
        return transformation;
    }

    public static TranslationStandardToPreferred(standardToPreferred: CoordinateSystemConversion): Matrix4 {
        let translationM = new Matrix4();
        translationM.makeTranslation(standardToPreferred.Translation.x, standardToPreferred.Translation.y, standardToPreferred.Translation.z);

        return translationM;
    }

    public static TranslationPreferredToStandard(standardToPreferred: CoordinateSystemConversion): Matrix4 {
        let translationM = new Matrix4();
        translationM.makeTranslation(-standardToPreferred.Translation.x, -standardToPreferred.Translation.y, -standardToPreferred.Translation.z);

        return translationM;
    }

    public static RotationStandardToPreferred(standardToPreferred: CoordinateSystemConversion): Matrix4 {
        let rotationEuler = new Euler();
        rotationEuler.setFromVector3(standardToPreferred.Rotation);

        let rotationM = new Matrix4();
        rotationM.makeRotationFromEuler(rotationEuler);

        return rotationM;
    }

    public static RotationPreferredToStandard(standardToPreferred: CoordinateSystemConversion): Matrix4 {
        let rotationStandardToPreferred = CoordinateSystemConversion.RotationStandardToPreferred(standardToPreferred);

        let rotationPreferredToStandard = new Matrix4();
        rotationPreferredToStandard.getInverse(rotationStandardToPreferred);

        return rotationPreferredToStandard;
    }


    public constructor(
        public readonly Translation = new Vector3(),
        public readonly Rotation = new Vector3(),
        public Scale = 1) {
    }

    // Returns a JS object with no frills that can be easily JSON-stringified.
    public ToObject(): ICoordinateSystemConversion {
        let translation: IVector3 = StorageVector3.ToObject(this.Translation);
        let rotation: IVector3 = StorageVector3.ToObject(this.Rotation);

        let output = {
            Translation: translation,
            Rotation: rotation,
            Scale: this.Scale,
        };
        return output;
    }

    // Parses a JS object with no frills that may have come from JSON-parsing.
    public FromObject(object: ICoordinateSystemConversion) {
        let translation = StorageVector3.FromObject(object.Translation);
        this.Translation.copy(translation);

        let rotation = StorageVector3.FromObject(object.Rotation);
        this.Rotation.copy(rotation);

        this.Scale = object.Scale;
    }

    public GetTransformationMatrix(): Matrix4 {
        let translation = new Matrix4();
        translation.makeTranslation(this.Translation.x, this.Translation.y, this.Translation.z);

        let rotation = new Matrix4();
        let euler = new Euler(this.Rotation.x, this.Rotation.y, this.Rotation.z);
        rotation.makeRotationFromEuler(euler);

        let scale = new Matrix4();
        scale.makeScale(this.Scale, this.Scale, this.Scale);

        let output = new Matrix4();
        output.premultiply(translation);
        output.premultiply(rotation);
        output.premultiply(scale);

        return output;
    }

    public Clone(): CoordinateSystemConversion {
        return new CoordinateSystemConversion(this.Translation, this.Rotation, this.Scale);
    }

    public Copy(other: CoordinateSystemConversion): void {
        this.Translation.copy(other.Translation);
        this.Rotation.copy(other.Rotation);
        this.Scale = other.Scale;
    }
}