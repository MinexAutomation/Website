import { ISignalEvent, ISignalEventHandler, SignalEvent } from "../Common/Events/SignalEvent";

import { ControlPanel } from "./ControlPanel";
import { ModeFactory } from "../Modes/ModeFactory";
import { ModeInfo, IMode } from "../Modes/Mode";
import { NoneMode } from "../Modes/NoneMode";
import { InfoMode } from "../Modes/InfoMode";
import { SetPreferredCoordinateSystemMode } from "../Modes/SetPreferredCoordinateSystemMode";
import { SetPreferredCameraSpecificationMode } from "../Modes/SetPreferredCameraSpecificationMode";
import { SelfDisposingMode } from "../Modes/SelfDisposingMode";
import { SetLightsMode } from "../Modes/SetLightsMode";
import { PointMode } from "../Modes/PointMode";


// Allows choosing which mode will put its controls to the control panel.
// The ModesControl should always be first in the Control Panel.
export class ModesControl {
    public static readonly HtmlElementId = 'ModesControl';
    public static readonly SelectHtmlElementId = 'ModesControl-Select';
    public static readonly ModeInfos: ModeInfo[] = [
        new ModeInfo(NoneMode.ID, 'None'),
        new ModeInfo(InfoMode.ID, 'Info'),
        new ModeInfo(SetPreferredCoordinateSystemMode.ID, 'Set Preferred Coordinate System'),
        new ModeInfo(SetPreferredCameraSpecificationMode.ID, 'Set Preferred Camera Specification'),
        new ModeInfo('annotate', 'Annotate'),
        new ModeInfo(SelfDisposingMode.ID, 'Self Disposing'),
        new ModeInfo(SetLightsMode.ID, 'Set Lights'),
        new ModeInfo(PointMode.ID, 'Point Mode'),
    ];


    public static GetIndexOfModeByModeInfo(modeInfo: ModeInfo): number {
        let output = ModesControl.GetIndexOfModeByModeID(modeInfo.ID);
        return output;
    }

    public static GetIndexOfModeByModeID(id: string): number {
        for (let iMode = 0; iMode < ModesControl.ModeInfos.length; iMode++) {
            const element = ModesControl.ModeInfos[iMode];
            if (element.ID == id) {
                return iMode;
            }
        }
        console.error('Mode ID not found: ' + id);
    }


    private readonly HtmlElement: HTMLDivElement;
    private readonly Style: HTMLStyleElement;
    private readonly StyleSheet: CSSStyleSheet;
    private readonly Select: HTMLSelectElement;
    private readonly ModeFactory: ModeFactory;
    private CurrentMode: IMode = null;
    private zModeChanged: SignalEvent = new SignalEvent();
    public get ModeChanged(): ISignalEvent {
        return this.zModeChanged.AsEvent();
    }


    public constructor(controlPanel: ControlPanel) {
        this.ModeFactory = new ModeFactory(controlPanel);

        // HTML.
        this.HtmlElement = document.createElement('div');
        controlPanel.HtmlElement.appendChild(this.HtmlElement);
        this.HtmlElement.id = ModesControl.HtmlElementId;
        this.HtmlElement.className = ControlPanel.ControlClassName;

        this.Style = document.createElement('style');
        document.head.appendChild(this.Style);
        this.StyleSheet = <CSSStyleSheet>this.Style.sheet;

        let title = document.createElement('p');
        title.className = ControlPanel.ControlTitleClassName;
        title.innerHTML = 'Modes';
        this.HtmlElement.appendChild(title);

        // Mode selector.
        this.Select = document.createElement('select');
        this.HtmlElement.appendChild(this.Select);
        this.Select.id = ModesControl.SelectHtmlElementId;

        ModesControl.ModeInfos.forEach(modeInfo => {
            let option = document.createElement('option');
            this.Select.appendChild(option);

            option.value = modeInfo.ID;
            option.innerHTML = modeInfo.Description;
        });

        this.Select.onchange = this.OnSelectChange;

        // Perform the actions to select the default node.
        this.OnSelectChange();

        // Styles.
        this.AddCssRules();
    }

    private AddCssRules() {
        let rule: string;

        rule = `
        width: 100px;
        align: left;
        `;
        this.StyleSheet.addRule('#' + ModesControl.SelectHtmlElementId, rule);
    }

    private OnSelectChange = () => {
        let selectedIndex = this.Select.selectedIndex;
        let selectedID = ModesControl.ModeInfos[selectedIndex].ID;

        if (this.CurrentMode) {
            // If the modes control disposes a node, prevent us from setting the default node.
            this.CurrentMode.Disposed.Unsubscribe(this.OnCurrentModeDisposed);
            this.CurrentMode.Dispose();
        }

        this.CurrentMode = this.ModeFactory.Construct(selectedID);
        // If a mode gets disposed, set the default mode.
        this.CurrentMode.Disposed.SubscribeOnce(this.OnCurrentModeDisposed);
    }

    private OnCurrentModeDisposed = () =>
     {
         this.SetDefaultMode();
     }

    private SetDefaultMode(): void {
        this.SetCurrentModeByID(NoneMode.ID);
    }

    public SetCurrentModeByIndex(index: number): void {
        if (this.Select.selectedIndex !== index) {
            this.Select.selectedIndex = index;

            this.OnSelectChange();
        }
    }

    public SetCurrentModeByID(id: string): void {
        let index = ModesControl.GetIndexOfModeByModeID(id);
        if (this.Select.selectedIndex !== index) {
            this.Select.selectedIndex = index;

            this.OnSelectChange();
        }
    }
}