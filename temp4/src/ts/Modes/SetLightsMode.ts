import { IMode } from "./Mode";
import { SignalEvent, ISignalEvent } from "../Common/Events/SignalEvent";
import { ControlPanel } from "../Controls/ControlPanel";
import { SetDirectionalLightControl } from "../Controls/SetDirectionalLightControl";
import { SetPointLightControl } from "../Controls/SetPointLightControl";
import { SetAmbientLightControl } from "../Controls/SetAmbientLightControl";
import { SetLightLoadSaveControl } from "../Controls/SetLightLoadSaveControl";
import { LightingSpecification } from "../LightingSpecification";
import { Application } from "../Application";


export class SetLightsMode implements IMode {
    public static ID: string = 'setLights';


    public get ID(): string {
        return SetLightsMode.ID;
    }
    private zDisposed: SignalEvent = new SignalEvent();
    public get Disposed(): ISignalEvent {
        return this.zDisposed.AsEvent();
    }
    private readonly SetAmbientLightControl: SetAmbientLightControl;
    private readonly SetDirectionalLightControl: SetDirectionalLightControl;
    private readonly SetPointLightControl: SetPointLightControl;
    private readonly SetLightLoadSaveControl: SetLightLoadSaveControl;
    private readonly LightingSpecification: LightingSpecification; // Make modifications using a temporary copy.


    public constructor(controlPanel: ControlPanel) {
        this.LightingSpecification = Application.Theater.Lighting.Specification.Clone();
        this.LightingSpecification.Changed.Subscribe(this.LightingSpecificationChanged);

        this.SetAmbientLightControl = new SetAmbientLightControl(controlPanel, this.LightingSpecification);
        this.SetDirectionalLightControl = new SetDirectionalLightControl(controlPanel, this.LightingSpecification);
        this.SetPointLightControl = new SetPointLightControl(controlPanel, this.LightingSpecification);
        this.SetLightLoadSaveControl = new SetLightLoadSaveControl(controlPanel, this.LightingSpecification);
        this.SetLightLoadSaveControl.Disposed.Subscribe(this.LoadSaveDisposed);
    }

    private LightingSpecificationChanged = () => {
        Application.Theater.Lighting.ApplySpecification(this.LightingSpecification);
    }

    private LoadSaveDisposed = () => {
        this.Dispose();
    }

    Dispose(): void {
        this.SetAmbientLightControl.Dispose();
        this.SetDirectionalLightControl.Dispose();
        this.SetPointLightControl.Dispose();
        this.SetLightLoadSaveControl.Dispose();

        Application.Theater.Lighting.Specification.Copy(this.LightingSpecification);
        Application.Theater.Lighting.Specification.OnChange();

        this.zDisposed.Dispatch();
    }
}