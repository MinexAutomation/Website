import * as wDatGui from "dat.gui";
const dat = (<any>wDatGui).default; // Workaround.

import { ControlPanel } from "./ControlPanel";
import { ISignalEvent, SignalEvent } from "../Common/Events/SignalEvent";
import { ButtonControl } from "./ButtonControl";
import { Application } from "../Application";
import { LightingSpecification } from "../LightingSpecification";


export class SetDirectionalLightControl {
    public static HtmlElementID = 'SetDirectionalLightControl';


    private readonly LightingSpecification: LightingSpecification;
    private readonly HtmlElement: HTMLElement;
    private datGui: wDatGui.GUI = null;
    private readonly zDisposed: SignalEvent = new SignalEvent();
    public get Disposed(): ISignalEvent {
        return this.zDisposed.AsEvent();
    }
    private readonly OnOffButton: ButtonControl;
    private readonly ModifyButton: ButtonControl;


    public constructor(controlPanel: ControlPanel, lightingSpecification: LightingSpecification) {
        this.LightingSpecification = lightingSpecification;

        this.HtmlElement = document.createElement('div');
        controlPanel.HtmlElement.appendChild(this.HtmlElement);
        this.HtmlElement.id = SetDirectionalLightControl.HtmlElementID;
        this.HtmlElement.className = ControlPanel.ControlClassName;

        let title = document.createElement('p');
        this.HtmlElement.appendChild(title);
        title.className = ControlPanel.ControlTitleClassName;
        title.innerHTML = 'Directional Light';

        this.OnOffButton = new ButtonControl(this.HtmlElement, 'On/Off');
        this.OnOffButton.Click.Subscribe(this.OnOffClick);

        this.ModifyButton = new ButtonControl(this.HtmlElement, 'Modify');
        this.ModifyButton.Click.Subscribe(this.ModifyClick);
    }

    private OnOffClick = () => {
        this.LightingSpecification.DirectionalOn = !this.LightingSpecification.DirectionalOn;
        this.OnValueChanged();
    }

    private Modify: boolean = false;
    private ModifyClick = () => {
        this.Modify = !this.Modify;
        if(this.Modify) {
            this.AddDatGUI(); 
        } else {
            this.RemoveDatGUI();
        }
    }

    private AddDatGUI() {
        this.datGui = new dat.GUI(); // No intellisense support here, but does work.

        let directional = this.datGui.addFolder('Directional');
        directional.open();
        let directionalIntensity = directional.add(this.LightingSpecification, 'DirectionalIntensity', 0, 2);
        directionalIntensity.listen();
        directionalIntensity.onChange(this.OnValueChanged);

        let directionalPosition = directional.addFolder('Position');
        directionalPosition.open();

        let directionalPositionX = directionalPosition.add(this.LightingSpecification.DirectionalPosition, 'x', -1, 1);
        directionalPositionX.listen();
        directionalPositionX.onChange(this.OnValueChanged);

        let directionalPositionY = directionalPosition.add(this.LightingSpecification.DirectionalPosition, 'y', -1, 1);
        directionalPositionY.listen();
        directionalPositionY.onChange(this.OnValueChanged);

        let directionalPositionZ = directionalPosition.add(this.LightingSpecification.DirectionalPosition, 'z', -1, 1);
        directionalPositionZ.listen();
        directionalPositionZ.onChange(this.OnValueChanged);
    }

    private OnValueChanged = () => {
        this.LightingSpecification.OnChange();
    }

    private RemoveDatGUI() {
        if (this.datGui) {
            this.datGui.destroy();
            this.datGui = null;
        }
    }

    public Dispose() {
        this.HtmlElement.remove();
        this.RemoveDatGUI();

        this.zDisposed.Dispatch();
    }
}