import { Color } from "three";


export interface IColorSpecification {
    R: number;
    G: number;
    B: number;
}

export class ColorSpecification implements IColorSpecification {
    /**
     * Red channel color (between 0 and 1).
     */
    public R: number;
    /**
     * Green channel color (between 0 and 1).
     */
    public G: number;
    /**
     * Blue channel color (between 0 and 1).
     */
    public B: number;


    public constructor(r: number = 0, g: number = 0, b: number = 0) {
        this.R = r;
        this.G = g;
        this.B = b;
    }

    public ToObject(): IColorSpecification {
        let output: IColorSpecification = {
            R: this.R,
            G: this.G,
            B: this.B,
        };
        return output;
    }

    public FromObject(obj: IColorSpecification): void {
        this.R = obj.R;
        this.G = obj.G;
        this.B = obj.B;
    }

    public Clone(): ColorSpecification {
        let output = new ColorSpecification(this.R, this.G, this.B);
        return output;
    }

    public Copy(other: ColorSpecification): void {
        this.R = other.R;
        this.G = other.G;
        this.B = other.B;
    }
}