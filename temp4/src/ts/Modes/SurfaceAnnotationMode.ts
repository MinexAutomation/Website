import ITuple = Minex.Common.Lib.ITuple;

import { IMode } from "./Mode";
import { SignalEvent, ISignalEvent } from "../Common/Events/SignalEvent";
import { ControlPanel } from "../Controls/ControlPanel";
import { EventedArray, EventedArrayChanged } from "../Common/EventedArray";
import { SurfaceAnnotation } from "../Annotations/SurfaceAnnotation";
import { SurfaceAnnotationVisual } from "../Annotations/SurfaceAnnotationVisual";
import { ButtonControl } from "../Controls/ButtonControl";

import "./SurfaceAnnotationMode.css";
import { SurfaceSelectorFactory } from "../Annotations/SurfaceSelectorFactory";
import { BoxSurfaceSelector } from "../Annotations/BoxSurfaceSelector";
import { SphereSurfaceSelector } from "../Annotations/SphereSurfaceSelector";
import { SurfaceSelectorVisualFactory } from "../Annotations/SurfaceSelectorVisualFactory";
import { ISurfaceSelector } from "../Annotations/ISurfaceSelector";
import { IdentifiedManager } from "../Common/IdentifiedManager";
import { LocalStorageManager } from "../LocalStorageManager";


export class SurfaceAnnotationMode implements IMode {
    public static readonly ID: string = 'surfaceAnnotation';
    public static readonly PluralHtmlElementID: string = 'SurfaceAnnotations-Plural';
    public static readonly SingularHtmlElementID: string = 'SurfaceAnnotations-Singular';
    public static readonly SelectorTypeSelectHtmlElementID: string = 'SurfaceAnnotations-SelectorTypeSelect';
    public static readonly DefaultAnnotationID: number = -1;
    public static readonly DefaultAnnotationName: string = '- None -';


    public get ID(): string {
        return SurfaceAnnotationMode.ID;
    }

    private zDisposed: SignalEvent = new SignalEvent();
    public get Disposed(): ISignalEvent {
        return this.zDisposed.AsEvent();
    }

    private zSelectedAnnotation: SurfaceAnnotation = null;
    private get SelectedAnnotation(): SurfaceAnnotation {
        return this.zSelectedAnnotation;
    }
    private set SelectedAnnotation(v: SurfaceAnnotation) {
        this.zSelectedAnnotation = v;
    }

    private ControlPanel: ControlPanel;

    private PluralHtmlElement: HTMLElement;
    private LoadButton: ButtonControl;
    private SaveButton: ButtonControl;
    private FinishedButton: ButtonControl;

    private SingularHtmlElement: HTMLElement;
    private SelectorTypeSelect: HTMLSelectElement;
    private AddButton: ButtonControl;
    private Select: HTMLSelectElement;
    private SelectButton: ButtonControl;
    private PositionButton: ButtonControl;
    private EditButton: ButtonControl;
    private HideButton: ButtonControl;
    private ShowButton: ButtonControl;
    private RemoveButton: ButtonControl;

    private SurfaceSelectorFactory: SurfaceSelectorFactory = new SurfaceSelectorFactory();
    private SurfaceSelectorVisualFactory: SurfaceSelectorVisualFactory;
    private Annotations: IdentifiedManager<SurfaceAnnotation> = new IdentifiedManager<SurfaceAnnotation>();
    private Visuals: Array<SurfaceAnnotationVisual> = new Array<SurfaceAnnotationVisual>();


    public constructor(controlPanel: ControlPanel) {
        this.ControlPanel = controlPanel;

        this.SurfaceSelectorVisualFactory = new SurfaceSelectorVisualFactory(this.ControlPanel);

        this.CreateModeControls()
        this.ConnectAnnotationsEvents();
    }

    private CreateModeControls(): void {
        this.PluralHtmlElement = this.ControlPanel.CreateChildControlElement(SurfaceAnnotationMode.PluralHtmlElementID);

        this.ControlPanel.CreateChildControlTitle(this.PluralHtmlElement, 'Surface Annotations');

        this.LoadButton = new ButtonControl(this.PluralHtmlElement, 'Load');
        this.LoadButton.Click.Subscribe(this.LoadClick);

        this.SaveButton = new ButtonControl(this.PluralHtmlElement, 'Save');
        this.SaveButton.Click.Subscribe(this.SaveClick);

        this.FinishedButton = new ButtonControl(this.PluralHtmlElement, 'Finished');
        this.FinishedButton.Click.Subscribe(this.FinishedClick);

        this.SingularHtmlElement = this.ControlPanel.CreateChildControlElement(SurfaceAnnotationMode.SingularHtmlElementID);

        this.ControlPanel.CreateChildControlTitle(this.SingularHtmlElement, 'Surface Annotation');

        let p = document.createElement('p');
        this.SingularHtmlElement.appendChild(p);
        p.innerHTML = 'Selector Type:';

        this.SelectorTypeSelect = document.createElement('select');
        this.SingularHtmlElement.appendChild(this.SelectorTypeSelect);
        this.SelectorTypeSelect.id = SurfaceAnnotationMode.SelectorTypeSelectHtmlElementID;
        this.FillSelectorTypeSelect();

        this.AddButton = new ButtonControl(this.SingularHtmlElement, 'Add');
        this.AddButton.Click.Subscribe(this.AddClick);

        let hr = document.createElement('hr');
        this.SingularHtmlElement.appendChild(hr);

        this.Select = document.createElement('select');
        this.SingularHtmlElement.appendChild(this.Select);
        this.FillAnnotationsSelect();
        this.Select.onchange = this.SelectOnChangeHandler;

        let hr2 = document.createElement('hr');
        this.SingularHtmlElement.appendChild(hr2);

        this.SelectButton = new ButtonControl(this.SingularHtmlElement, 'Select');
        this.SelectButton.Click.Subscribe(this.SelectClick);

        let hr3 = document.createElement('hr');
        this.SingularHtmlElement.appendChild(hr3);

        this.PositionButton = new ButtonControl(this.SingularHtmlElement, 'Position');
        this.PositionButton.Click.Subscribe(this.PositionClick);

        this.EditButton = new ButtonControl(this.SingularHtmlElement, 'Edit');
        this.EditButton.Click.Subscribe(this.EditClick);

        this.HideButton = new ButtonControl(this.SingularHtmlElement, 'Hide');
        this.HideButton.Click.Subscribe(this.HideClick);

        this.ShowButton = new ButtonControl(this.SingularHtmlElement, 'Show');
        this.ShowButton.Click.Subscribe(this.ShowClick);

        this.RemoveButton = new ButtonControl(this.SingularHtmlElement, 'Remove');
        this.RemoveButton.Click.Subscribe(this.RemoveClick);
    }

    private RemoveModeControls(): void {
        this.SingularHtmlElement.remove();
        this.PluralHtmlElement.remove();
    }

    private ConnectAnnotationsEvents(): void {
        this.Annotations.Changed.Subscribe(this.AnnotationsChangedHandler);
    }

    private DisconnectAnnotationsEvents(): void {
        this.Annotations.Changed.Unsubscribe(this.AnnotationsChangedHandler);
    }

    private AnnotationsChangedHandler = (changed: EventedArrayChanged<SurfaceAnnotation>) => {
        switch (changed.Type) {
            case 'Added':
                this.AddAnnotationVisual(changed.Value);
                break;

            case 'Inserted':
                this.AddAnnotationVisual(changed.Value);
                break;

            case 'Removed':
                this.RemoveAnnotationVisual(changed.Value);
                break;

            case 'Reset':
                this.ResetAnnotationVisuals();
                break;

            default:
                // Do nothing.
                break;
        }
    }

    Dispose(): void {
        this.DisconnectAnnotationsEvents();

        // Clear the visuals.
        this.Visuals.forEach(visual => {
            visual.Dispose();
        });
        this.Visuals.splice(0);

        // Clear the annotations.
        let annotations = this.Annotations.Values;
        annotations.forEach(annotation => {
            annotation.Dispose();
        });
        this.Annotations.Clear();

        this.RemoveModeControls();

        this.zDisposed.Dispatch();
    }

    private FillSelectorTypeSelect(): void {
        let selectorTypeInfos: ITuple<string, string>[] = [
            {
                Item1: SphereSurfaceSelector.SurfaceSelectorTypeID,
                Item2: 'Sphere',
            },
            {
                Item1: BoxSurfaceSelector.SurfaceSelectorTypeID,
                Item2: 'Box',
            },
        ];

        selectorTypeInfos.forEach(info => {
            let option = document.createElement('option');
            this.SelectorTypeSelect.appendChild(option);
            option.value = info.Item1;
            option.innerHTML = info.Item2;
        });
    }

    private AddAnnotationVisual(annotation: SurfaceAnnotation): void {
        let visual = new SurfaceAnnotationVisual(annotation);
        this.Visuals.push(visual);
    }

    private RemoveAnnotationVisual(annotation: SurfaceAnnotation): void {
        for (let iVisual = 0; iVisual < this.Visuals.length; iVisual++) {
            const visual = this.Visuals[iVisual];
            if (visual.Annotation === annotation) {
                this.Visuals.splice(iVisual, 1);
                break;
            }
        }
    }

    private ResetAnnotationVisuals(): void {
        this.Visuals.splice(0);

        this.Annotations.Values.forEach(annotation => {
            this.AddAnnotationVisual(annotation);
        });
    }

    private LoadClick = () => {
        let loaded = LocalStorageManager.LoadSurfaceAnnotations();
        this.Annotations.Copy(loaded);

        this.FillAnnotationsSelect();
    }

    private SaveClick = () => {
        LocalStorageManager.SaveSurfaceAnnotations(this.Annotations);
    }

    private FinishedClick = () => {
        this.Dispose();
    }

    private AddClick = () => {
        let id = this.Annotations.GetNextID();
        let name = `Annotation ${id}`;

        let selector = this.GetSelector();

        let annotation = new SurfaceAnnotation(selector, id, name);
        this.Annotations.Add(annotation); // Adding to the annotations list will setup the selected surface visual.

        this.SelectedAnnotation = annotation;

        let selectorVisual = this.SurfaceSelectorVisualFactory.Construct(annotation.Selector);

        this.FillAnnotationsSelect();
    }

    private SelectOnChangeHandler = () => {
        // Set the selected annotation to be the annotation whose name is selected.
        let option = <HTMLOptionElement>this.Select.childNodes[this.Select.selectedIndex];
        let id = option.value;

        if(id === SurfaceAnnotationMode.DefaultAnnotationID.toString()) {
            this.SelectedAnnotation = null;
            return;
        }

        let values = this.Annotations.Values;
        for (let iElement = 0; iElement < values.length; iElement++) {
            const annotation = this.Annotations.Values[iElement];
            if (id === annotation.ID.toString()) {
                this.SelectedAnnotation = annotation;
                return;
            }
        }

        console.error('No annotation found for selected option.');
    }

    private SelectClick = () => {

    }

    private PositionClick = () => {
        let selectorVisual = this.SurfaceSelectorVisualFactory.Construct(this.SelectedAnnotation.Selector);
    }

    private EditClick = () => {

    }

    private HideClick = () => {
        let visual = this.GetVisualForAnnotation(this.SelectedAnnotation);
        visual.Hide();
    }

    private ShowClick = () => {
        let visual = this.GetVisualForAnnotation(this.SelectedAnnotation);
        visual.Show();
    }

    private RemoveClick = () => {
        if(null !== this.SelectedAnnotation) {
            this.Annotations.Remove(this.SelectedAnnotation);
            this.SelectedAnnotation.Dispose();

            this.SelectedAnnotation = null;

            this.FillSelectorTypeSelect();
        }
    }

    private GetSelector(): ISurfaceSelector {
        let option = <HTMLOptionElement>this.SelectorTypeSelect.childNodes[this.SelectorTypeSelect.selectedIndex];
        let surfaceSelectorTypeID = option.value;

        let selector = this.SurfaceSelectorFactory.Construct(surfaceSelectorTypeID);
        return selector;
    }

    private FillAnnotationsSelect(): void {
        let annotations = this.Annotations.Values;
        annotations.sort((a, b) => {
            if (a.Name === b.Name) {
                return 0;
            }

            if (a.Name > b.Name) {
                return 1;
            } else {
                return -1;
            }
        });

        // Remove all child options.
        while (this.Select.firstChild) {
            this.Select.removeChild(this.Select.firstChild);
        }

        // Add the default none option.
        let option = <HTMLOptionElement>document.createElement('option');
        this.Select.appendChild(option);
        option.value = SurfaceAnnotationMode.DefaultAnnotationID.toString();
        option.innerHTML = SurfaceAnnotationMode.DefaultAnnotationName;

        // Add the options foreach annotation.
        annotations.forEach(annotation => {
            let option = <HTMLOptionElement>document.createElement('option');
            this.Select.appendChild(option);
            option.value = annotation.ID.toString();
            option.innerHTML = annotation.Name;
        });

        // Set the selected index to match the selected annotation.
        if (null !== this.zSelectedAnnotation) {
            for (let iElement = 0; iElement < annotations.length; iElement++) {
                const annotation = annotations[iElement];
                if (this.zSelectedAnnotation.ID === annotation.ID) {
                    this.Select.selectedIndex = iElement;
                    break;
                }
            }
        }
    }

    /**
     * If a visual is not found for the annotation, returns null.
     */
    private GetVisualForAnnotation(annotation: SurfaceAnnotation): SurfaceAnnotationVisual {
        for (let iVisual = 0; iVisual < this.Visuals.length; iVisual++) {
            const visual = this.Visuals[iVisual];
            if(visual.Annotation === annotation) {
                return visual;
            }
        }

        return null;
    }
}