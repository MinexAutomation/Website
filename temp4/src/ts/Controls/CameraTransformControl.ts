import { ButtonControl } from "./ButtonControl";
import { ControlPanel } from "./ControlPanel";
import { Modal } from "../Modal";
import { Application } from "../Application";
import { LocalStorageManager } from "../LocalStorageManager";
import { ISignalEvent, SignalEvent } from "../Common/Events/SignalEvent";
import { Vector3 } from "three";


export class CameraTransformControl {
    public static readonly HtmlElementId = 'CameraTransformControl';


    private readonly HtmlElement: HTMLDivElement;
    private readonly InstructionsButton: ButtonControl;
    private readonly FinishedButton: ButtonControl;
    private readonly zDisposed: SignalEvent = new SignalEvent();
    public get Disposed(): ISignalEvent {
        return this.zDisposed.AsEvent();
    }


    public constructor(controlPanel: ControlPanel) {
        this.HtmlElement = document.createElement('div');
        controlPanel.HtmlElement.appendChild(this.HtmlElement);
        this.HtmlElement.id = CameraTransformControl.HtmlElementId;
        this.HtmlElement.className = ControlPanel.ControlClassName;

        this.InstructionsButton = new ButtonControl(this.HtmlElement, 'Show Instructions');
        this.InstructionsButton.Click.Subscribe(() => { this.ShowInstructions(); });

        this.FinishedButton = new ButtonControl(this.HtmlElement, 'Finished');
        this.FinishedButton.Click.Subscribe(this.OnApply);

        this.ShowInstructions();
    }

    public Dispose() {
        this.HtmlElement.remove();
        this.zDisposed.Dispatch();
    }

    private OnApply = () => {
        Application.PreferredCameraSpecification.Value.Position.copy(Application.Theater.Camera.position);
        Application.PreferredCameraSpecification.Value.Rotation.copy(Application.Theater.Camera.rotation.toVector3());
        Application.PreferredCameraSpecification.Value.Up.copy(Application.Theater.Camera.up);

        let cameraDirection = new Vector3();
        Application.Theater.Camera.getWorldDirection(cameraDirection);
        let cameraPosition = Application.Theater.Camera.position.clone();
        let target = new Vector3();
        target.copy(Application.Theater.Camera.position);
        target.add(cameraDirection);

        let value = Application.PreferredCameraSpecification.Value;
        Application.PreferredCameraSpecification.Value.Target.copy(target);
        Application.PreferredCameraSpecification;

        LocalStorageManager.SavePreferredCameraSpecification(Application.PreferredCameraSpecification.Value);

        this.Dispose();
    }

    private ShowInstructions(): void {
        Modal.Initialize();

        Modal.HeaderMessage = 'Setup Your Preferred Camera View';

        let bodyElement = Modal.GetBodyHtmlElement();

        let p1 = document.createElement('p');
        bodyElement.appendChild(p1);
        p1.innerHTML = 'Use the mouse to move and rotate until you have the view you want to save as YOUR initial view of the miniature. This setting will be automatically applied the next time you view this miniature';

        let p2 = document.createElement('p');
        bodyElement.appendChild(p2);
        p2.innerHTML = 'When ready, click <b>Finished</b>.';

        Modal.Show();
    }
}