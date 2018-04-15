import * as THREE from "three";
import * as wDatGui from "dat.gui";
const dat = (<any>wDatGui).default; // Workaround.

import { IMode, ModeInfo } from "./Mode";
import { CameraTransformControl } from "../Controls/CameraTransformControl";
import { ControlPanel } from "../Controls/ControlPanel";
import { ModeFactory } from "./ModeFactory";
import { Application } from "../Application";
import { NoneMode } from "./NoneMode";


export class SetPreferredCameraPositionMode implements IMode {
    public static readonly ID: string = 'setPreferredCameraPosition';
    public static readonly Description: string = 'Set Preferred Camera Position';
    public static readonly Info: ModeInfo = new ModeInfo(SetPreferredCameraPositionMode.ID, SetPreferredCameraPositionMode.Description);


    private readonly CameraTransformControl: CameraTransformControl;


    public constructor(controlPanel: ControlPanel) {
        this.CameraTransformControl = new CameraTransformControl(controlPanel);
        this.CameraTransformControl.ApplyButton.AddOnClickListener(this.OnApply)
    }

    private OnApply = () => {
        this.Dispose();

        let index = ModeFactory.GetIndexOfModeByModeInfo(NoneMode.Info);
        Application.ModesControl.SetSelectedIndex(index);
    }

    public get ModeInfo(): ModeInfo {
        return SetPreferredCameraPositionMode.Info;
    }

    public Dispose(): void {
        this.CameraTransformControl.HtmlElement.remove();
    }
}