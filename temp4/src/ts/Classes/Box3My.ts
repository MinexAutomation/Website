export class Box3My {
    public xMin: number;
    public xMax: number;
    public yMin: number;
    public yMax: number;
    public zMin: number;
    public zMax: number;


    public constructor(
        xMin: number = Number.MAX_VALUE, xMax: number = Number.MIN_VALUE,
        yMin: number = Number.MAX_VALUE, yMax: number = Number.MIN_VALUE,
        zMin: number = Number.MAX_VALUE, zMax: number = Number.MIN_VALUE
    ) {
        this.xMin = xMin;
        this.xMax = xMax;
        this.yMin = yMin;
        this.yMax = yMax;
        this.zMin = zMin;
        this.zMax = zMax;
    }

    public Update(x1: number, x2: number, y1: number, y2: number, z1: number, z2: number): void {
        this.xMax = x1 > x2 ? x1 : x2;
        this.xMin = x1 < x2 ? x1 : x2;

        this.yMax = y1 > y2 ? y1 : y2;
        this.yMin = y1 < y2 ? y1 : y2;

        this.zMax = z1 > z2 ? z1 : z2;
        this.zMin = z1 < z2 ? z1 : z2;
    }

    public Contains(x: number, y: number, z: number): boolean {
        let withinX = x >= this.xMin && x <= this.xMax;
        let withinY = y >= this.yMin && y <= this.yMax;
        let withinZ = z >= this.zMin && z <= this.zMax;

        let output = withinX && withinY && withinZ;
        return output;
    }
}