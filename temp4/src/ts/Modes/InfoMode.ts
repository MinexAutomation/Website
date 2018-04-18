import { ISignalEvent, SignalEvent } from "../Common/Events/SignalEvent";

import { ControlPanel } from "../Controls/ControlPanel";
import { IMode, ModeInfo } from "./Mode";
import { WebGLDetectorControl } from "../Controls/WebGLDetectorControl";


export class InfoMode implements IMode {
    public static readonly ID: string = 'info';


    public get ID(): string {
        return InfoMode.ID;
    }
    private zDisposed: SignalEvent = new SignalEvent();
    public get Disposed(): ISignalEvent {
        return this.zDisposed.AsEvent();
    }
    public WebGLDetectorControl: WebGLDetectorControl;


    public constructor(controlPanel: ControlPanel) {
        this.WebGLDetectorControl = new WebGLDetectorControl(controlPanel.HtmlElement);
    }

    public Dispose(): void {
        this.WebGLDetectorControl.HtmlElement.remove();
        this.zDisposed.Dispatch();
    }
}