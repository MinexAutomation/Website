import IFactory = Minex.Common.Lib.IFactory;

import { BoxSurfaceSelector } from "./BoxSurfaceSelector";
import { SphereSurfaceSelector } from "./SphereSurfaceSelector";
import { ISurfaceSelector } from "./ISurfaceSelector";


export class SurfaceSelectorFactory implements IFactory<string, ISurfaceSelector> {
    Construct(surfaceSelectorTypeID: string): ISurfaceSelector {
        let output: ISurfaceSelector;
        switch (surfaceSelectorTypeID) {
            case BoxSurfaceSelector.SurfaceSelectorTypeID:
                output = new BoxSurfaceSelector();
                break;

            case SphereSurfaceSelector.SurfaceSelectorTypeID:
                output = new SphereSurfaceSelector();
                break;
        }

        return output;
    }
}