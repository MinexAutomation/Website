import { IMode } from "./Mode";
import { SignalEvent, ISignalEvent } from "../Common/Events/SignalEvent";
import { ControlPanel } from "../Controls/ControlPanel";


export class TemplateMode implements IMode {
    public static readonly ID: string = 'TEMPLATE';


    public get ID(): string {
        return TemplateMode.ID;
    }
    private zDisposed: SignalEvent = new SignalEvent();
    public get Disposed(): ISignalEvent {
        return this.zDisposed.AsEvent();
    }


    public constructor(controlPanel: ControlPanel) {
    }

    public Dispose(): void {
        this.zDisposed.Dispatch();
    }
}