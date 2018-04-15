import { Matrix4, Euler, Vector3 } from "three";

import { IVector3 } from "./Common";


export interface ICoordinateSystemConversion {
    readonly Translation: IVector3;
    readonly Rotation: IVector3;
    Scale: number;
}


export class CoordinateSystemConversion implements ICoordinateSystemConversion {
    public readonly Translation: Vector3;
    public readonly Rotation: Vector3;
    public Scale: number;


    public constructor(
        translation = new Vector3(),
        rotation = new Vector3(),
        scale = 1,
    ) {
        this.Translation = translation;
        this.Rotation = rotation;
        this.Scale = scale;
    }

    // Returns a JS object with no frills that can be easily JSON-stringified.
    public ToObject() : ICoordinateSystemConversion {
        let output = {
            Translation: {
                x: this.Translation.x,
                y: this.Translation.y,
                z: this.Translation.z,
            },
            Rotation: {
                x: this.Rotation.x,
                y: this.Rotation.y,
                z: this.Rotation.z,
            },
            Scale: this.Scale,
        };
        return output;
    }

    // Parses a JS object with no frills that may have come from JSON-parsing.
    public FromObject(object: ICoordinateSystemConversion) {
        let objTranslation = object.Translation;
        this.Translation.set(objTranslation.x, objTranslation.y, objTranslation.z);
        
        let objRotation = object.Rotation;
        this.Rotation.set(objRotation.x, objRotation.y, objRotation.z);

        this.Scale = object.Scale;
    }

    public GetTransformationMatrix() : Matrix4 {
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