import { Application } from "../Application";
import { AxesTransformController } from "../Controllers/AxesTransformController";
import { ButtonControl } from "./ButtonControl";
import { ControlPanel } from "./ControlPanel";
import { LocalStorageManager } from "../LocalStorageManager";
import { Modal } from "../Modal";
import { CoordinateSystemConversion } from "../CoordinateSystemConversion";
import { Euler, Matrix4, Vector4 } from "three";
import { ISignalEvent, SignalEvent } from "../Common/Events/SignalEvent";


export class AxesTransformControl {
    public static readonly HtmlElementId = 'AxesTransformControl'
    public static readonly ButtonHtmlElementId = 'AxesTransformControl-Button'


    public readonly HtmlElement: HTMLDivElement;
    private readonly InstructionsButton: ButtonControl;
    private readonly TransformToggleButton: ButtonControl;
    private readonly LoadButton: ButtonControl;
    private readonly FinishedButton: ButtonControl = new ButtonControl(undefined, 'Finished');


    private zEnable: boolean;
    private get Enable(): boolean {
        return this.zEnable;
    }
    private set Enable(value: boolean) {
        this.zEnable = value;

        Application.TrackballController.Controls.enabled = !this.Enable;
        this.SetTransformToggleButtonText();
        if (this.zEnable) {
            this.Controller.Attach(Application.Theater.Axes);

            this.LoadButton.Enable();
        } else {
            this.Controller.Detach();

            this.LoadButton.Disable();
        }
    }
    private zController: AxesTransformController;
    public get Controller(): AxesTransformController {
        return this.zController;
    }
    private zFinished: SignalEvent = new SignalEvent();
    public get Finished() : ISignalEvent {
        return this.zFinished.AsEvent();
    }


    public constructor(controlPanel: ControlPanel) {
        this.zController = new AxesTransformController(Application.Theater);

        this.HtmlElement = document.createElement('div');
        controlPanel.HtmlElement.appendChild(this.HtmlElement);
        this.HtmlElement.id = AxesTransformControl.HtmlElementId;
        this.HtmlElement.className = ControlPanel.ControlClassName;

        let title = document.createElement('p');
        title.className = ControlPanel.ControlTitleClassName;
        title.innerHTML = 'Axes Transform';
        this.HtmlElement.appendChild(title);

        this.InstructionsButton = new ButtonControl(this.HtmlElement, 'Show Instructions');
        this.InstructionsButton.Click.Subscribe(() => { this.ShowInstructions(); });

        this.TransformToggleButton = new ButtonControl(this.HtmlElement);
        this.TransformToggleButton.Click.Subscribe(this.TransformToggleButtonOnClick)

        this.LoadButton = new ButtonControl(this.HtmlElement, 'Load');
        this.LoadButton.Click.Subscribe(this.LoadButtonOnClick);

        this.HtmlElement.appendChild(this.FinishedButton.HtmlElement);
        this.FinishedButton.Click.Subscribe(this.FinishedClick);

        this.Enable = false;

        this.ShowInstructions();
    }

    private ShowInstructions(): void {
        Modal.Initialize();

        Modal.HeaderMessage = 'Setup Your Preferred Origin and Rotation';

        let bodyElement = Modal.GetBodyHtmlElement();

        let p1 = document.createElement('p');
        bodyElement.appendChild(p1);
        p1.innerHTML = 'Miniatures created via 3D reconstruction come with their own origin and rotation. Here you can set the preferred origin and rotation that will automatically be applied in the future.';

        let p2 = document.createElement('p');
        bodyElement.appendChild(p2);
        p2.innerHTML = 'Click <b>Enable</b> in the Axes Transform menu to move and rotate the axes. Click <b>Disable</b> to go back to moving and rotating the view.';

        let p3 = document.createElement('p');
        bodyElement.appendChild(p3);
        p3.innerHTML = 'When ready, click <b>Finished</b>.';

        Modal.Show();
    }

    private FinishedClick = () => {
        let coordinateSystem = new CoordinateSystemConversion();

        let additionalTranslation = Application.Theater.Axes.position.clone();

        let additionalRotationMatrix = new Matrix4();
        additionalRotationMatrix.makeRotationFromEuler(Application.Theater.Axes.rotation);

        // We have moved the axes in the world, the world has moved oppositely from the axes.
        additionalTranslation.negate();

        let additionalRotationMatrixInverse = new Matrix4;
        additionalRotationMatrixInverse.getInverse(additionalRotationMatrix);

        // Update the preferred coordinate system.
        // The angles must be dealt with as transformation matrices; adding the Euler angles would be wrong!
        let currentRotationEuler = new Euler();
        currentRotationEuler.setFromVector3(Application.PreferredCoordinateSystem.Value.Rotation);

        let currentRotationMatrix = new Matrix4();
        currentRotationMatrix.makeRotationFromEuler(currentRotationEuler);

        let updatedRotationMatrix = currentRotationMatrix.clone();
        updatedRotationMatrix.premultiply(additionalRotationMatrixInverse);

        let updatedRotationEuler = new Euler();
        updatedRotationEuler.setFromRotationMatrix(updatedRotationMatrix);

        let updatedRotation = updatedRotationEuler.toVector3();

        coordinateSystem.Rotation.copy(updatedRotation);

        // The additional translation in this coordinate system was in fact a translation in a different direction in the standard coordinate system.
        let currentRotationMatrixInverse = new Matrix4();
        currentRotationMatrixInverse.getInverse(currentRotationMatrix);

        let standardSystemTranslation = additionalTranslation.clone();
        standardSystemTranslation.applyMatrix4(currentRotationMatrixInverse);

        coordinateSystem.Translation.copy(Application.PreferredCoordinateSystem.Value.Translation);
        coordinateSystem.Translation.add(standardSystemTranslation);

        Application.PreferredCoordinateSystem.Value = coordinateSystem;

        // Save the updated coordinate system.
        LocalStorageManager.SavePreferredCoordinateSystem(Application.PreferredCoordinateSystem.Value);

        // Finally, update the screen.
        Application.ApplyPreferredCoordinateSystem();
    }

    private LoadButtonOnClick = () => {
        let cs = LocalStorageManager.LoadPreferredCoordinateSystem();
        if (cs) {
            Application.PreferredCoordinateSystem.Value = cs;
        }
        Application.ApplyPreferredCoordinateSystem();
    }

    private TransformToggleButtonOnClick = () => {
        this.Enable = !this.Enable;
    }

    private SetTransformToggleButtonText() {
        if (this.Enable) {
            this.TransformToggleButton.Text = 'Disable';
        } else {
            this.TransformToggleButton.Text = 'Enable';
        }
    }
}