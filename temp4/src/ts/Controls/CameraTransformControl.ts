import { ButtonControl } from "./ButtonControl";
import { ControlPanel } from "./ControlPanel";
import { Modal } from "../Modal";
import { Application } from "../Application";
import { LocalStorageManager } from "../LocalStorageManager";


export class CameraTransformControl {
    public static readonly HtmlElementId = 'CameraTransformControl';


    public readonly HtmlElement: HTMLDivElement;
    private readonly InstructionsButton: ButtonControl;
    public readonly ApplyButton: ButtonControl;


    public constructor(controlPanel: ControlPanel) {
        this.HtmlElement = document.createElement('div');
        controlPanel.HtmlElement.appendChild(this.HtmlElement);
        this.HtmlElement.id = CameraTransformControl.HtmlElementId;
        this.HtmlElement.className = ControlPanel.ControlClassName;

        this.InstructionsButton = new ButtonControl(this.HtmlElement, 'Show Instructions');
        this.InstructionsButton.AddOnClickListener(() => { this.ShowInstructions(); });

        this.ApplyButton = new ButtonControl(this.HtmlElement, 'Apply');
        this.ApplyButton.AddOnClickListener(this.OnApply);

        this.ShowInstructions();
    }

    private OnApply = () => {
        Application.PreferredCameraPosition.Translation.copy(Application.Theater.Camera.position);
        Application.PreferredCameraPosition.Rotation.copy(Application.Theater.Camera.rotation.toVector3());

        LocalStorageManager.SavePreferredCameraPosition(Application.PreferredCameraPosition);
    }

    private ShowInstructions(): void {
        Modal.Initialize();

        Modal.HeaderMessage = 'Setup Your Preferred Camera View';

        let bodyElement = Modal.GetBodyHtmlElement();

        let p1 = document.createElement('p');
        bodyElement.appendChild(p1);
        p1.innerHTML = 'Use the mouse to move until you have the view you want to save as YOUR initial view of the miniature. This setting will be automatically applied the next time you view this miniature';

        let p2 = document.createElement('p');
        bodyElement.appendChild(p2);
        p2.innerHTML = 'When ready, click <b>Apply</b>.';

        Modal.FooterMessage = 'Click outside to close';

        Modal.Show();
    }
}