import { IMode, ModeInfo } from "./Mode";


export class NoneMode implements IMode {
    public static readonly ID: string = 'none';
    public static readonly Description: string = 'None';
    public static readonly Info: ModeInfo = new ModeInfo(NoneMode.ID, NoneMode.Description);

    public get ModeInfo(): ModeInfo {
        return NoneMode.Info;
    }

    public Dispose() : void {
        // Do nothing.
    }
}