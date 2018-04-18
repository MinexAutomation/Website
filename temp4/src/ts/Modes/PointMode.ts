import * as wDatGui from "dat.gui";
const dat = (<any>wDatGui).default; // Workaround.

import { IMode } from "./Mode";
import { SignalEvent, ISignalEvent } from "../Common/Events/SignalEvent";
import { ControlPanel } from "../Controls/ControlPanel";
import { MeshBasicMaterial, SphereGeometry, Mesh, ColladaLoader } from "three";
import { ButtonControl } from "../Controls/ButtonControl";
import { Application } from "../Application";
import { LocalStorageManager } from "../LocalStorageManager";
import { CoordinateSystemConversion } from "../CoordinateSystemConversion";


export class PointMode implements IMode {
    public static readonly ID: string = 'PointMode';
    public static readonly ControlHtmlElementID = 'PointModeControl';


    public get ID(): string {
        return PointMode.ID;
    }
    private zDisposed: SignalEvent = new SignalEvent();
    public get Disposed(): ISignalEvent {
        return this.zDisposed.AsEvent();
    }
    private readonly ControlHtmlElement: HTMLElement;
    private readonly Marker: Mesh;
    private readonly OnOffButton: ButtonControl;
    private readonly LoadButton: ButtonControl;
    private readonly SaveButton: ButtonControl;
    private readonly ResetButton: ButtonControl;
    private DatGUI: wDatGui.GUI = null;
    private readonly Marker2: Mesh;


    public constructor(controlPanel: ControlPanel) {
        let sphereGeometry = new SphereGeometry(1);
        let sphereMaterial = new MeshBasicMaterial({ color: 0x2194ce });
        this.Marker = new Mesh(sphereGeometry, sphereMaterial);

        Application.Theater.Scene.add(this.Marker);

        this.AddDatGUI();

        this.ControlHtmlElement = document.createElement('div');
        controlPanel.HtmlElement.appendChild(this.ControlHtmlElement);
        this.ControlHtmlElement.id = PointMode.ControlHtmlElementID;
        this.ControlHtmlElement.className = ControlPanel.ControlClassName;

        let title = document.createElement('p');
        this.ControlHtmlElement.appendChild(title);
        title.className = ControlPanel.ControlTitleClassName;
        title.innerHTML = 'Point';

        this.OnOffButton = new ButtonControl(this.ControlHtmlElement, 'On/Off');
        this.OnOffButton.Click.Subscribe(this.OnOffClick);

        this.LoadButton = new ButtonControl(this.ControlHtmlElement, 'Load');
        this.LoadButton.Click.Subscribe(this.OnLoad);

        this.SaveButton = new ButtonControl(this.ControlHtmlElement, 'Save');
        this.SaveButton.Click.Subscribe(this.OnSave);

        this.ResetButton = new ButtonControl(this.ControlHtmlElement, 'Reset');
        this.ResetButton.Click.Subscribe(this.ResetClick);
    }

    private ResetClick = () => {
        this.Marker.position.set(0, 0, 0);
    }

    private AddDatGUI(): void {
        this.DatGUI = new dat.GUI();

        let position = this.DatGUI.addFolder('Position');
        position.open();

        let x = position.add(this.Marker.position, 'x');
        x.listen();

        let y = position.add(this.Marker.position, 'y');
        y.listen();

        let z = position.add(this.Marker.position, 'z');
        z.listen();
    }

    private RemoveDatGUI(): void {
        if(this.DatGUI) {
            this.DatGUI.destroy();
        }
    }

    private OnLoad = () => {
        let exists = LocalStorageManager.PointLocationExists();
        if(exists) {
            let locationStandard = LocalStorageManager.LoadPointLocation();

            let locationPreferred = CoordinateSystemConversion.ConvertPointStandardToPreferred(locationStandard, Application.PreferredCoordinateSystem.Value);

            this.Marker.position.copy(locationPreferred);
        } else {
            alert('No point location found.');
        }
    }

    private OnSave = () => {
        let locationPreferred = this.Marker.position.clone();

        let locationStandard = CoordinateSystemConversion.ConvertPointPreferredToStandard(locationPreferred, Application.PreferredCoordinateSystem.Value);

        LocalStorageManager.SavePointLocation(locationStandard);
    }

    private MarkerOn: boolean = true;
    private OnOffClick = () => {
        this.MarkerOn = !this.MarkerOn;
        if (this.MarkerOn) {
            this.AddMarkerToScene();
        } else {
            this.RemoveMarkerFromScene();
        }
    }

    private AddMarkerToScene(): void {
        Application.Theater.Scene.add(this.Marker);
    }

    private RemoveMarkerFromScene(): void {
        Application.Theater.Scene.remove(this.Marker);
    }

    Dispose(): void {
        this.RemoveMarkerFromScene();
        this.RemoveDatGUI();
        this.ControlHtmlElement.remove();

        this.zDisposed.Dispatch();
    }
}