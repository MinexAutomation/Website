import { ColorRgb } from "./Colors/ColorRgb";
import { IColorRgb } from "./Colors/IColorRgb";
import { SimpleEvent, ISimpleEvent } from "../Common/Events/SimpleEvent";


export interface IVisualSpecification {
    Size: number;
    Color: IColorRgb;
    Transparency: number;
}

/**
 * An evented model class representing visual information.
 */
export class VisualSpecification {
    private zSize: number;
    /**
     * A scale factor to apply to the specific object's size.
     */
    public get Size(): number {
        return this.zSize;
    }
    public set Size(value: number) {
        this.zSize = value;

        this.OnChanged();
    }
    private zColor: ColorRgb = null;
    public get Color(): ColorRgb {
        return this.zColor;
    }
    public set Color(value: ColorRgb) {
        if(null !== this.zColor) {
            this.zColor.Changed.Unsubscribe(this.ColorChangedHandler);
        }

        this.zColor = value;

        this.zColor.Changed.Subscribe(this.ColorChangedHandler);
    }
    private ColorChangedHandler = () => {
        this.OnChanged();
    }
    private zTransparency: number;
    /**
     * A value from 0 to 1.
     */
    public get Transparency(): number {
        return this.zTransparency;
    }
    public set Transparency(value: number) {
        this.zTransparency = value;

        this.OnChanged();
    }
    private zChanged = new SimpleEvent<VisualSpecification>();
    public get Changed(): ISimpleEvent<VisualSpecification> {
        return this.zChanged.AsEvent();
    }
    private OnChanged(): void {
        this.zChanged.Dispatch(this);
    }


    public constructor(size: number = 1, color: ColorRgb = new ColorRgb(), transparency: number = 1) {
        this.zSize = size;
        this.zColor = color;
        this.zTransparency = transparency;
    }

    public Dispose(): void {
        this.Color.Changed.Unsubscribe(this.ColorChangedHandler);
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
        this.zSize = obj.Size;
        this.zColor.FromObject(obj.Color);
        this.zTransparency = obj.Transparency;

        this.OnChanged();
    }

    public Clone(): VisualSpecification {
        let output = new VisualSpecification(this.Size, this.Color.Clone(), this.Transparency);
        return output;
    }

    public Copy(other: VisualSpecification): void {
        this.zSize = other.Size;
        this.zColor.Copy(other.Color);
        this.zTransparency = other.Transparency;

        this.OnChanged();
    }
}