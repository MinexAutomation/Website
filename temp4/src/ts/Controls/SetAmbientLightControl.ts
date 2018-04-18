import * as wDatGui from "dat.gui";
const dat = (<any>wDatGui).default; // Workaround.

import { ControlPanel } from "./ControlPanel";
import { ISignalEvent, SignalEvent } from "../Common/Events/SignalEvent";
import { ButtonControl } from "./ButtonControl";
import { Application } from "../Application";
import { LightingSpecification } from "../LightingSpecification";


export class SetAmbientLightControl {
    public static readonly HtmlElementID = 'AmbientLightControl';


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
        this.HtmlElement.id = SetAmbientLightControl.HtmlElementID;
        this.HtmlElement.className = ControlPanel.ControlClassName;

        let title = document.createElement('p');
        this.HtmlElement.appendChild(title);
        title.className = ControlPanel.ControlTitleClassName;
        title.innerHTML = 'Ambient Light';

        this.OnOffButton = new ButtonControl(this.HtmlElement, 'On/Off');
        this.OnOffButton.Click.Subscribe(this.OnOffClick);

        this.ModifyButton = new ButtonControl(this.HtmlElement, 'Modify');
        this.ModifyButton.Click.Subscribe(this.ModifyClick);
    }

    private OnOffClick = () => {
        this.LightingSpecification.AmbientOn = !this.LightingSpecification.AmbientOn;
        this.LightingSpecification.OnChange();
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

        let directional = this.datGui.addFolder('Ambient Light');
        directional.open();
        let directionalIntensity = directional.add(this.LightingSpecification, 'AmbientIntensity', 0, 2);
        directionalIntensity.listen();
        directionalIntensity.onChange(() => {
            this.LightingSpecification.OnChange();
        });
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