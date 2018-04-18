import * as THREE from "three";
import * as wDatGui from "dat.gui";
const dat = (<any>wDatGui).default; // Workaround.

import { ISignalEvent, SignalEvent } from "../Common/Events/SignalEvent";

import { IMode, ModeInfo } from "./Mode";
import { CameraTransformControl } from "../Controls/CameraTransformControl";
import { ControlPanel } from "../Controls/ControlPanel";
import { ModeFactory } from "./ModeFactory";
import { Application } from "../Application";
import { NoneMode } from "./NoneMode";


export class SetPreferredCameraSpecificationMode implements IMode {
    public static readonly ID: string = 'setPreferredCameraSpecification';


    public get ID(): string {
        return SetPreferredCameraSpecificationMode.ID;
    }
    private zDisposed: SignalEvent = new SignalEvent();
    public get Disposed(): ISignalEvent {
        return this.zDisposed.AsEvent();
    }
    private readonly CameraTransformControl: CameraTransformControl;


    public constructor(controlPanel: ControlPanel) {
        this.CameraTransformControl = new CameraTransformControl(controlPanel);
        this.CameraTransformControl.Disposed.Subscribe(this.OnCameraTransformControlFinished);
    }

    private OnCameraTransformControlFinished = () => {
        this.Dispose();
    }

    public Dispose(): void {
        this.zDisposed.Dispatch();
    }
}