import { ISignalEvent } from "../Common/Events/SignalEvent";


export class ModeInfo {
    private zID: string;
    public get ID(): string {
        return this.zID;
    }
    private zDescription: string;
    public get Description() : string {
        return this.zDescription;
    }


    public constructor(id: string, description: string) {
        this.zID = id;
        this.zDescription = description;
    }
}


export interface IMode {
    readonly ID: string; // Usually returns a static instance.


    Dispose(): void; // Removes all controls associated with the mode from the control panel.
    Disposed: ISignalEvent;
}