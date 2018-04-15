import { ControlPanel } from "../Controls/ControlPanel";
import { IMode, ModeInfo } from "./Mode";
import { WebGLDetectorControl } from "../Controls/WebGLDetectorControl";


export class InfoMode implements IMode {
    public static readonly ID: string = 'info';
    public static readonly Description: string = 'Info';
    public static readonly Info: ModeInfo = new ModeInfo(InfoMode.ID, InfoMode.Description);


    public get ModeInfo(): ModeInfo {
        return InfoMode.Info;
    }
    public WebGLDetectorControl: WebGLDetectorControl;


    public constructor(controlPanel: ControlPanel) {
        this.WebGLDetectorControl = new WebGLDetectorControl(controlPanel.HtmlElement);
    }

    public Dispose() : void {
        this.WebGLDetectorControl.HtmlElement.remove();
    }
}