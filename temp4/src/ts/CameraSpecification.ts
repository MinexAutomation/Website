import { Vector3 } from "three";
import { IVector3 } from "./Common";
import { StorageVector3 } from "./Classes/StorageVector3";


export interface ICameraSpecification {
    Position: IVector3;
    Rotation: IVector3;
    Up: IVector3;
    Target: IVector3;
}


export class CameraSpecification {
    public constructor(
        public readonly Position: Vector3 = new Vector3(),
        public readonly Rotation: Vector3 = new Vector3(),
        public readonly Up: Vector3 = new Vector3(),
        public readonly Target: Vector3 = new Vector3(), ) {
    }

    public ToObject(): ICameraSpecification {
        let position = StorageVector3.ToObject(this.Position);
        let rotation = StorageVector3.ToObject(this.Rotation);
        let up = StorageVector3.ToObject(this.Up);
        let target = StorageVector3.ToObject(this.Target);

        let output: ICameraSpecification = {
            Position: position,
            Rotation: rotation,
            Up: up,
            Target: target,
        };
        return output;
    }

    public FromObject(obj: ICameraSpecification) {
        let position = StorageVector3.FromObject(obj.Position);
        this.Position.copy(position);

        let rotation = StorageVector3.FromObject(obj.Rotation);
        this.Rotation.copy(rotation);

        let up = StorageVector3.FromObject(obj.Up);
        this.Up.copy(up);

        let target = StorageVector3.FromObject(obj.Target);
        this.Target.copy(target);
    }

    public Clone(): CameraSpecification {
        let output = new CameraSpecification(this.Position.clone(), this.Rotation.clone(), this.Up.clone(), this.Target.clone());
        return output;
    }
}