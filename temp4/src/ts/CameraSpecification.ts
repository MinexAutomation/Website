import { Vector3 } from "three";
import { Vector3Storage } from "./Classes/Vectors/Vector3Storage";
import { IVector3 } from "./Classes/Vectors/IVector3";


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
        let position = Vector3Storage.ToObjFromVector3(this.Position);
        let rotation = Vector3Storage.ToObjFromVector3(this.Rotation);
        let up = Vector3Storage.ToObjFromVector3(this.Up);
        let target = Vector3Storage.ToObjFromVector3(this.Target);

        let output: ICameraSpecification = {
            Position: position,
            Rotation: rotation,
            Up: up,
            Target: target,
        };
        return output;
    }

    public FromObject(obj: ICameraSpecification) {
        let position = Vector3Storage.ToVector3FromObj(obj.Position);
        this.Position.copy(position);

        let rotation = Vector3Storage.ToVector3FromObj(obj.Rotation);
        this.Rotation.copy(rotation);

        let up = Vector3Storage.ToVector3FromObj(obj.Up);
        this.Up.copy(up);

        let target = Vector3Storage.ToVector3FromObj(obj.Target);
        this.Target.copy(target);
    }

    public Clone(): CameraSpecification {
        let output = new CameraSpecification(this.Position.clone(), this.Rotation.clone(), this.Up.clone(), this.Target.clone());
        return output;
    }
}