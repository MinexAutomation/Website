import * as wDatGui from "dat.gui";
const dat = (<any>wDatGui).default; // Workaround.

import { ControlPanel } from "./ControlPanel";
import { ISignalEvent, SignalEvent } from "../Common/Events/SignalEvent";
import { ButtonControl } from "./ButtonControl";
import { Application } from "../Application";
import { LightingSpecification } from "../LightingSpecification";



export class SetPointLightControl {
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
        this.HtmlElement.id = SetPointLightControl.HtmlElementID;
        this.HtmlElement.className = ControlPanel.ControlClassName;

        let title = document.createElement('p');
        this.HtmlElement.appendChild(title);
        title.className = ControlPanel.ControlTitleClassName;
        title.innerHTML = 'Point Light';

        this.OnOffButton = new ButtonControl(this.HtmlElement, 'On/Off');
        this.OnOffButton.Click.Subscribe(this.AddRemoveClick);

        this.ModifyButton = new ButtonControl(this.HtmlElement, 'Modify');
        this.ModifyButton.Click.Subscribe(this.ModifyClick);
    }

    private AddRemoveClick = () => {
        this.LightingSpecification.PointOn = !this.LightingSpecification.PointOn;
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

        let directional = this.datGui.addFolder('Point Light');
        directional.open();

        let pointIntensity = directional.add(this.LightingSpecification, 'PointIntensity', 0, 2);
        pointIntensity.listen();
        pointIntensity.onChange(this.OnValueChanged);

        let pointPosition = directional.addFolder('Position');
        pointPosition.open();

        let pointPositionX = pointPosition.add(this.LightingSpecification.PointLocation, 'x');
        pointPositionX.listen();
        pointPositionX.onChange(this.OnValueChanged);
        
        let pointPositionY = pointPosition.add(this.LightingSpecification.PointLocation, 'y');
        pointPositionY.listen();
        pointPositionY.onChange(this.OnValueChanged);

        let pointPositionZ = pointPosition.add(this.LightingSpecification.PointLocation, 'z');
        pointPositionZ.listen();
        pointPositionZ.onChange(this.OnValueChanged);
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