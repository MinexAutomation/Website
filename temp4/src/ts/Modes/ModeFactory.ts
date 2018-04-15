import { ControlPanel } from "../Controls/ControlPanel";
import { InfoMode } from "./InfoMode";
import { ModeInfo, IMode } from "./Mode";
import { NoneMode } from "./NoneMode";
import { SetPreferredCoordinateSystemMode } from "./SetPreferredCoordinateSystemMode";
import { SetPreferredCameraPositionMode } from "./SetPreferredCameraPositionMode";


export class ModeFactory {
    public static readonly ModeInfos: ModeInfo[] = [
        NoneMode.Info,
        InfoMode.Info,
        SetPreferredCoordinateSystemMode.Info,
        SetPreferredCameraPositionMode.Info,
        new ModeInfo('annotate', 'Annotate'),
    ];


    public static GetIndexOfModeByModeInfo(modeInfo: ModeInfo): number {
        let output = ModeFactory.GetIndexOfModeByModeID(modeInfo.ID);
        return output;
    }

    public static GetIndexOfModeByModeID(id: string): number {
        for (let iMode = 0; iMode < ModeFactory.ModeInfos.length; iMode++) {
            const element = ModeFactory.ModeInfos[iMode];
            if (element.ID == id) {
                return iMode;
            }
        }
    }


    private readonly ControlPanel: ControlPanel;


    public constructor(controlPanel: ControlPanel) {
        this.ControlPanel = controlPanel;
    }

    public GetModeByID(id: string): IMode {
        let output: IMode;
        switch (id) {
            case InfoMode.ID:
                output = new InfoMode(this.ControlPanel);
                break;

            case SetPreferredCameraPositionMode.ID:
                output = new SetPreferredCameraPositionMode(this.ControlPanel);
                break;

            case SetPreferredCoordinateSystemMode.ID:
                output = new SetPreferredCoordinateSystemMode(this.ControlPanel);
                break;

            case NoneMode.ID:
            default:
                output = new NoneMode();
                break;
        }
        return output;
    }

    public GetModeByModeInfo(modeInfo: ModeInfo): IMode {
        let output = this.GetModeByID(modeInfo.ID);
        return output;
    }
}