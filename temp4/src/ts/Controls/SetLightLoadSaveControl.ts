import { ControlPanel } from "./ControlPanel";
import { SignalEvent, ISignalEvent } from "../Common/Events/SignalEvent";
import { ButtonControl } from "./ButtonControl";
import { LocalStorageManager } from "../LocalStorageManager";
import { CoordinateSystemConversion } from "../CoordinateSystemConversion";
import { Application } from "../Application";
import { LightingSpecification } from "../LightingSpecification";

export class SetLightLoadSaveControl {
    public static readonly HtmlElementID: string = 'SetLightLoadSave';


    private readonly OriginalLightingSpecification: LightingSpecification;
    private readonly LightingSpecification: LightingSpecification;
    private readonly HtmlElement: HTMLElement;
    private readonly zDisposed: SignalEvent = new SignalEvent();
    public get Disposed(): ISignalEvent {
        return this.zDisposed.AsEvent();
    }
    private readonly LoadButton: ButtonControl;
    private readonly SaveButton: ButtonControl;
    private readonly FinishedButton: ButtonControl;
    private readonly CancelButton: ButtonControl;


    public constructor(controlPanel: ControlPanel, lightingSpecification: LightingSpecification) {
        this.LightingSpecification = lightingSpecification;
        this.OriginalLightingSpecification = this.LightingSpecification.Clone(); // For cancellation, create a copy of the lighting specification that can be copied back.

        this.HtmlElement = document.createElement('div');
        controlPanel.HtmlElement.appendChild(this.HtmlElement);
        this.HtmlElement.id = SetLightLoadSaveControl.HtmlElementID;
        this.HtmlElement.className = ControlPanel.ControlClassName;

        this.LoadButton = new ButtonControl(this.HtmlElement, 'Load');
        this.LoadButton.Click.Subscribe(this.LoadClick);

        this.SaveButton = new ButtonControl(this.HtmlElement, 'Save');
        this.SaveButton.Click.Subscribe(this.SaveClick);

        this.FinishedButton = new ButtonControl(this.HtmlElement, 'Finished');
        this.FinishedButton.Click.Subscribe(this.FinishedClick);

        this.CancelButton = new ButtonControl(this.HtmlElement, 'Cancel');
        this.CancelButton.Click.Subscribe(this.CancelClick);
    }

    private CancelClick = () => {
        this.LightingSpecification.Copy(this.OriginalLightingSpecification);
        this.LightingSpecification.OnChange();

        this.Dispose();
    }

    private LoadClick = () => {
        let exists = LocalStorageManager.LightingSpecificationExists();
        if (!exists) {
            alert('No lighting specification found.');
            return;
        }

        let specification = LocalStorageManager.LoadLightingSpecification();
        specification.AdjustToPreferredCoordinateSystem(Application.PreferredCoordinateSystem.Value);

        this.LightingSpecification.Copy(specification);
        this.LightingSpecification.OnChange();
    }

    private SaveClick = () => {
        let specification = this.LightingSpecification.Clone();
        specification.AdjustToStandardCoordinateSystem(Application.PreferredCoordinateSystem.Value);

        LocalStorageManager.SaveLightingSpecification(specification);
    }

    private FinishedClick = () => {
        this.SaveClick(); // Save.

        this.Dispose();
    }

    private IsDisposed: boolean = false;
    public Dispose() {
        if (this.IsDisposed) {
            return;
        }

        this.HtmlElement.remove();
        this.IsDisposed = true;

        this.zDisposed.Dispatch();
    }
}