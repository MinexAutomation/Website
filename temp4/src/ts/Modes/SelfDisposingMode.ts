import { IMode } from "./Mode";
import { ISignalEvent, SignalEvent } from "../Common/Events/SignalEvent";
import { ControlPanel } from "../Controls/ControlPanel";
import { ButtonControl } from "../Controls/ButtonControl";


/**
 * A mode that tests the self disposal of modes.
 */
export class SelfDisposingMode implements IMode {
    public static readonly ID: string = 'selfDisposing';
    public static readonly HtmlElementID = 'SelfDisposing';


    public ID: string;
    private zDisposed: SignalEvent = new SignalEvent();
    public get Disposed(): ISignalEvent {
        return this.zDisposed.AsEvent();
    }
    private readonly HtmlElement: HTMLElement;
    private DisposeButton: ButtonControl;
    


    public constructor(controlPanel: ControlPanel) {
        this.HtmlElement = document.createElement('div');
        controlPanel.HtmlElement.appendChild(this.HtmlElement);
        this.HtmlElement.id = SelfDisposingMode.HtmlElementID;
        this.HtmlElement.className = ControlPanel.ControlClassName;

        this.DisposeButton = new ButtonControl(this.HtmlElement, 'Dispose');
        this.DisposeButton.Click.Subscribe(this.OnDisposeButtonClick);
    }

    private OnDisposeButtonClick = () => {
        this.Dispose();
    }

    Dispose(): void {
        this.HtmlElement.remove();
        this.zDisposed.Dispatch();
    }
}