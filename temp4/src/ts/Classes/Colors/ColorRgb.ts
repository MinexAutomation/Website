import { IColorRgb } from "./IColorRgb";
import { SimpleEvent, ISimpleEvent } from "../../Common/Events/SimpleEvent";

/**
 * An evented model class for colors.
 * 
 * Changes are only notified at the level of the whole color, not individual color channels. Thus we can only change the whole color, not individual channel values.
 */
export class ColorRgb implements IColorRgb {
    private zR: number;
    public get R(): number {
        return this.zR;
    }
    private zG: number;
    public get G(): number {
        return this.zG;
    }
    private zB: number;
    public get B(): number {
        return this.zB;
    }
    private zChanged = new SimpleEvent<ColorRgb>();
    public get Changed(): ISimpleEvent<ColorRgb> {
        return this.zChanged.AsEvent();
    }
    private OnChanged(): void {
        this.zChanged.Dispatch(this);
    }


    public constructor(r: number = 0, g: number = 0, b: number = 0) {
        this.zR = r;
        this.zG = g;
        this.zB = b;
    }

    public Set(r: number, g: number, b: number) {
        this.zR = r;
        this.zG = g;
        this.zB = b;

        this.OnChanged();
    }

    public ToObject(): IColorRgb {
        let output = {
            R: this.R,
            G: this.G,
            B: this.B,
        };
        return output;
    }

    public FromObject(obj: IColorRgb): void {
        this.zR = obj.R;
        this.zG = obj.G;
        this.zB = obj.B;

        this.OnChanged();
    }

    public Clone(): ColorRgb {
        return new ColorRgb(this.R, this.G, this.B);
    }

    public Copy(other: ColorRgb): void {
        this.zR = other.R;
        this.zG = other.G;
        this.zB = other.B;
    }
}