import IFactory = Minex.Common.Lib.IFactory;
import { ISurfaceSelector } from "./ISurfaceSelector";
import { BoxSurfaceSelectorVisual } from "./BoxSurfaceSelectorVisual";
import { SphereSurfaceSelectorVisual } from "./SphereSurfaceSelectorVisual";
import { BoxSurfaceSelector } from "./BoxSurfaceSelector";
import { ControlPanel } from "../Controls/ControlPanel";
import { SphereSurfaceSelector } from "./SphereSurfaceSelector";


export class SurfaceSelectorVisualFactory implements IFactory<ISurfaceSelector, BoxSurfaceSelectorVisual | SphereSurfaceSelectorVisual> {
    private ControlPanel: ControlPanel;


    public constructor(controlPanel: ControlPanel) {
        this.ControlPanel = controlPanel;
    }

    Construct(selector: ISurfaceSelector): BoxSurfaceSelectorVisual | SphereSurfaceSelectorVisual {
        if(BoxSurfaceSelector.IsBoxSurfaceSelector(selector)) {
            let output = new BoxSurfaceSelectorVisual(selector, this.ControlPanel);
            return output;
        }

        if(SphereSurfaceSelector.IsSphereSurfaceSelector(selector)) {
            let output = new SphereSurfaceSelectorVisual(selector, this.ControlPanel);
            return output;
        }

        console.error('Unrecognized surface selector.')
    }
}