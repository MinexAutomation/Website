import { ColorSpecification, IColorSpecification } from "./ColorSpecification";


export interface IVisualSpecification {
    Size: number;
    Color: IColorSpecification;
    Transparency: number;
}

export class VisualSpecification {
    /**
     * A scale factor to apply to the specific object's size.
     */
    public Size: number;
    public readonly Color: ColorSpecification
    /**
     * A value from 0 to 1.
     */
    public Transparency: number;


    public constructor(size: number = 1, color: ColorSpecification = new ColorSpecification(), transparency: number = 1) {
        this.Size = size;
        this.Color = color;
        this.Transparency = transparency;
    }

    public ToObject(): IVisualSpecification {
        let output: IVisualSpecification = {
            Size: this.Size,
            Color: this.Color.ToObject(),
            Transparency: this.Transparency,
        };
        return output;
    }

    public FromObject(obj: IVisualSpecification): void {
        this.Size = obj.Size;
        this.Color.FromObject(obj.Color);
        this.Transparency = obj.Transparency;
    }

    public Clone(): VisualSpecification {
        let output = new VisualSpecification(this.Size, this.Color.Clone(), this.Transparency);
        return output;
    }

    public Copy(other: VisualSpecification): void {
        this.Size = other.Size;
        this.Color.Copy(other.Color);
        this.Transparency = other.Transparency;
    }
}