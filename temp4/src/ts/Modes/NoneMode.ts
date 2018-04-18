import { ISignalEvent, SignalEvent } from "../Common/Events/SignalEvent";

import { IMode, ModeInfo } from "./Mode";

export class NoneMode implements IMode {
    public static readonly ID: string = 'none';


    public get ID(): string {
        return NoneMode.ID;
    }
    private zDisposed: SignalEvent = new SignalEvent();
    public get Disposed(): ISignalEvent {
        return this.zDisposed.AsEvent();
    }


    public Dispose() : void {
        // Do nothing.

        // Inform listeners.
        this.zDisposed.Dispatch();
    }
}