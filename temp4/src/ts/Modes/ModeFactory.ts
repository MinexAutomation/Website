import IFactory = Minex.Common.Lib.IFactory;

import { ControlPanel } from "../Controls/ControlPanel";
import { InfoMode } from "./InfoMode";
import { ModeInfo, IMode } from "./Mode";
import { NoneMode } from "./NoneMode";
import { SetPreferredCoordinateSystemMode } from "./SetPreferredCoordinateSystemMode";
import { SetPreferredCameraSpecificationMode } from "./SetPreferredCameraSpecificationMode";
import { SelfDisposingMode } from "./SelfDisposingMode";
import { SetLightsMode } from "./SetLightsMode";
import { PointMode } from "./PointMode";
import { PointAnnotationMode } from "./PointAnnotationMode";
import { CategoryManagementMode } from "./CategoryManagementMode";
import { SurfaceAnnotationMode } from "./SurfaceAnnotationMode";


export class ModeFactory implements IFactory<string, IMode> {
    private readonly ControlPanel: ControlPanel;


    public constructor(controlPanel: ControlPanel) {
        this.ControlPanel = controlPanel;
    }

    public Construct(id: string): IMode {
        let output: IMode;
        switch (id) {
            case CategoryManagementMode.ID:
                output = new CategoryManagementMode(this.ControlPanel);
                break;

            case InfoMode.ID:
                output = new InfoMode(this.ControlPanel);
                break;

            case PointAnnotationMode.ID:
                output = new PointAnnotationMode(this.ControlPanel);
                break;

            case PointMode.ID:
                output = new PointMode(this.ControlPanel);
                break;

            case SelfDisposingMode.ID:
                output = new SelfDisposingMode(this.ControlPanel);
                break;

            case SetLightsMode.ID:
                output = new SetLightsMode(this.ControlPanel);
                break;

            case SetPreferredCameraSpecificationMode.ID:
                output = new SetPreferredCameraSpecificationMode(this.ControlPanel);
                break;

            case SetPreferredCoordinateSystemMode.ID:
                output = new SetPreferredCoordinateSystemMode(this.ControlPanel);
                break;

            case SurfaceAnnotationMode.ID:
                output = new SurfaceAnnotationMode(this.ControlPanel);
                break;

            default:
                console.warn('ModeFactory - No constructor for mode ID: ' + id);
            case NoneMode.ID:
                output = new NoneMode();
                break;
        }
        return output;
    }
}