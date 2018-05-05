import * as wDatGui from "dat.gui";
const dat = (<any>wDatGui).default; // Workaround.

import { Application } from "../Application";
import { ButtonControl } from "../Controls/ButtonControl";
import { ControlPanel } from "../Controls/ControlPanel";
import { IMode } from "./Mode";
import { SignalEvent, ISignalEvent } from "../Common/Events/SignalEvent";
import { EventedArrayChanged } from "../Common/EventedArray";
import { PointAnnotation } from "../Annotations/PointAnnotation";
import { LocalStorageManager } from "../LocalStorageManager";
import { EditorBox, EditorBoxResult } from "../Common/Boxes/EditorBox";

import * as template from "./PointAnnotationMode.html";
import "./PointAnnotationMode.css";
import { CoordinateSystemConversion } from "../CoordinateSystemConversion";
import { Vector3, InstancedBufferAttribute } from "three";
import { Vector3My } from "../Classes/Vectors/Vector3My";
import { PointVisualsManager } from "../Classes/PointVisualsManager";
import { Category } from "../Annotations/Category";
import { VisualSpecification } from "../Classes/VisualSpecification";


export class PointAnnotationMode implements IMode {
    public static readonly ID: string = 'pointAnnotation';
    public static readonly PluralHtmlElementID = 'PointAnnotations-Plural';
    public static readonly SingularHtmlElementID = 'PointAnnotations-Singular';
    public static readonly EditorBodyHtmlElementID = 'PointAnnotations-EditorBody';
    public static readonly EditorNameHtmlElementID = 'PointAnnotations-EditorName';
    public static readonly EditorDescriptionHtmlElementID = 'PointAnnotations-EditorDescription';
    public static readonly EditorUseCategoryHtmlElementID = 'PointAnnotations-EditorUseCategory';
    public static readonly EditorCategoryHtmlElementID = 'PointAnnotations-EditorCategory';
    public static readonly EditorColorHtmlElementID = 'PointAnnotations-EditorColor';
    public static readonly EditorSizeHtmlElementID = 'PointAnnotations-EditorSize';
    public static readonly EditorTransparencyHtmlElementID = 'PointAnnotations-EditorTransparency';
    public static readonly EditorModelLocationHtmlElementID = 'PointAnnotations-EditorModelLocation';
    public static readonly EditorStandardLocationHtmlElementID = 'PointAnnotations-EditorStandardLocation';
    public static readonly EditorPointIDHtmlElementID = 'PointAnnotations-EditorPointID';


    public get ID(): string {
        return PointAnnotationMode.ID;
    }
    private zDisposed: SignalEvent = new SignalEvent();
    public get Disposed(): ISignalEvent {
        return this.zDisposed.AsEvent();
    }
    private Annotations = Application.PointAnnotationsManager;
    private AnnotationVisuals = new Array<PointVisualsManager>();
    private readonly PluralHtmlElement: HTMLElement
    private readonly LoadButton: ButtonControl;
    private readonly SaveButton: ButtonControl;
    private readonly FinishedButton: ButtonControl;
    private readonly SingularHtmlElement: HTMLElement;
    private readonly Select: HTMLSelectElement;
    private readonly AddButton: ButtonControl;
    private readonly RemoveButton: ButtonControl;
    private readonly EditButton: ButtonControl;
    private Editor: EditorBox<PointAnnotation>;
    private EditorVisualsDatGUI: wDatGui.GUI;

    private EditorNameHtmlElement: HTMLInputElement;
    private EditorDescriptionHtmlElement: HTMLInputElement;
    private EditorUseCategoryHtmlElement: HTMLInputElement;
    private EditorCategoryHtmlElement: HTMLSelectElement;
    private EditorColorHtmlElement: HTMLDivElement;
    private EditorSizeHtmlElement: HTMLInputElement;
    private EditorTransparencyHtmlElement: HTMLInputElement;
    private EditorModelLocationHtmlElement: HTMLLabelElement;
    private EditorStandardLocationHtmlElement: HTMLLabelElement;
    private EditorPointIDHtmlElement: HTMLLabelElement;


    public constructor(controlPanel: ControlPanel) {
        // Setup controls.
        this.PluralHtmlElement = controlPanel.CreateChildControlElement(PointAnnotationMode.PluralHtmlElementID);

        controlPanel.CreateChildControlTitle(this.PluralHtmlElement, 'Point Annotations');

        this.LoadButton = new ButtonControl(this.PluralHtmlElement, 'Load');
        this.LoadButton.Click.Subscribe(this.LoadClick);

        this.SaveButton = new ButtonControl(this.PluralHtmlElement, 'Save');
        this.SaveButton.Click.Subscribe(this.SaveClick);

        this.FinishedButton = new ButtonControl(this.PluralHtmlElement, 'Finished');
        this.FinishedButton.Click.Subscribe(this.FinishedClick);

        this.SingularHtmlElement = controlPanel.CreateChildControlElement(PointAnnotationMode.SingularHtmlElementID);

        controlPanel.CreateChildControlTitle(this.SingularHtmlElement, 'Point Annotation');

        this.Select = document.createElement('select');
        this.SingularHtmlElement.appendChild(this.Select);
        this.FillSelect();

        this.AddButton = new ButtonControl(this.SingularHtmlElement, 'Add');
        this.AddButton.Click.Subscribe(this.AddClick);

        this.EditButton = new ButtonControl(this.SingularHtmlElement, 'Edit');
        this.EditButton.Click.Subscribe(this.EditClick);

        this.RemoveButton = new ButtonControl(this.SingularHtmlElement, 'Remove');
        this.RemoveButton.Click.Subscribe(this.RemoveClick);

        // Connect to events of the annotation array.
        this.Annotations.Changed.Subscribe((changed: EventedArrayChanged<PointAnnotation>) => this.AnnotationsChanged(changed));

        // Place the initial annotations.
        this.ResetAnnotations();
    }

    private FillSelect() {
        // Remove all children, if present.
        while (this.Select.firstChild) {
            this.Select.removeChild(this.Select.firstChild);
        }

        // Add children.
        this.Annotations.Values.forEach(value => {
            let option = document.createElement('option');
            this.Select.appendChild(option);
            option.value = value.ID.toString();
            option.innerHTML = value.Name;
        });
    }

    private DisconnectEvents(): void {
        this.Annotations.Changed.Unsubscribe(this.AnnotationsChanged);
    }

    private AnnotationsChanged(changed: EventedArrayChanged<PointAnnotation>) {
        switch (changed.Type) {
            case 'Added':
                this.AddAnnotation(changed.Value);
                break;

            case 'Inserted':
                this.AddAnnotation(changed.Value);
                break;

            case 'Removed':
                this.RemoveAnnotation(changed.Value);
                break;

            case 'Reset':
                this.ResetAnnotations();
                break;

            default:
                // Do nothing.
                break;
        }

        // Update the select.
        this.FillSelect();
    }

    private AddAnnotation(annotation: PointAnnotation): void {
        let annotationVisual = new PointVisualsManager(annotation);
        this.AnnotationVisuals.push(annotationVisual);
    }

    private RemoveAnnotation(annotation: PointAnnotation): void {
        for (let iIndex = 0; iIndex < this.AnnotationVisuals.length; iIndex++) {
            const visual = this.AnnotationVisuals[iIndex];
            if (visual.PointAnnotation === annotation) {
                this.AnnotationVisuals.splice(iIndex, 1);
                visual.Dispose();
            }
        }
    }

    private ResetAnnotations(): void {
        // Remove all.
        for (let iIndex = 0; iIndex < this.AnnotationVisuals.length; iIndex++) {
            const visual = this.AnnotationVisuals[iIndex];
            visual.Dispose();
        }
        this.AnnotationVisuals.splice(0);

        // Add for each annotation.
        let values = this.Annotations.Values;
        for (let iAnnotation = 0; iAnnotation < values.length; iAnnotation++) {
            const annotation = values[iAnnotation];
            this.AddAnnotation(annotation);
        }
    }

    private LoadClick = () => {
        let loaded = LocalStorageManager.LoadPointAnnotations();
        this.Annotations.Copy(loaded);

        this.FillSelect();
    }

    private SaveClick = () => {
        LocalStorageManager.SavePointAnnotations(this.Annotations);
    }

    private FinishedClick = () => {
        this.SaveClick(); // Save.
        this.Dispose(); // Dispose.
    }

    private AddClick = () => {
        // Application.Theater.Renderer.domElement.addEventListener("mousedown", (ev: MouseEvent) => this.OnWebGlOutputMouseDown(ev));
        Application.Theater.Renderer.domElement.addEventListener("mousedown", this.OnWebGlOutputMouseDown);

        let ID = this.Annotations.GetNextID();
        let annotation = new PointAnnotation(ID, 'Annotation ' + ID);
        this.Annotations.Add(annotation);

        this.FillSelect();
    }

    private OnWebGlOutputMouseDown = (ev: MouseEvent) => {

    }

    private EditClick = () => {
        let option = <HTMLOptionElement>this.Select.children[this.Select.selectedIndex];
        let annotation = this.Annotations.GetByIDString(option.value);

        let instanceForEdit = annotation.Clone();

        let editor = new EditorBox<PointAnnotation>(instanceForEdit, 'Edit Point Annotation');
        this.Editor = editor;
        editor.Closed.SubscribeOnce(this.EditorClosed);

        let editorBody = editor.BodyHtmlElement;

        let body = document.createElement('div');
        editorBody.appendChild(body);
        body.id = PointAnnotationMode.EditorBodyHtmlElementID;

        body.innerHTML += template;

        this.EditorNameHtmlElement = <HTMLInputElement>document.getElementById(PointAnnotationMode.EditorNameHtmlElementID);
        this.EditorDescriptionHtmlElement = <HTMLInputElement>document.getElementById(PointAnnotationMode.EditorDescriptionHtmlElementID);
        this.EditorUseCategoryHtmlElement = <HTMLInputElement>document.getElementById(PointAnnotationMode.EditorUseCategoryHtmlElementID);
        this.EditorCategoryHtmlElement = <HTMLSelectElement>document.getElementById(PointAnnotationMode.EditorCategoryHtmlElementID);
        this.EditorColorHtmlElement = <HTMLDivElement>document.getElementById(PointAnnotationMode.EditorColorHtmlElementID);
        this.EditorSizeHtmlElement = <HTMLInputElement>document.getElementById(PointAnnotationMode.EditorSizeHtmlElementID);
        this.EditorTransparencyHtmlElement = <HTMLInputElement>document.getElementById(PointAnnotationMode.EditorTransparencyHtmlElementID);
        this.EditorModelLocationHtmlElement = <HTMLLabelElement>document.getElementById(PointAnnotationMode.EditorModelLocationHtmlElementID);
        this.EditorStandardLocationHtmlElement = <HTMLLabelElement>document.getElementById(PointAnnotationMode.EditorStandardLocationHtmlElementID);
        this.EditorPointIDHtmlElement = <HTMLLabelElement>document.getElementById(PointAnnotationMode.EditorPointIDHtmlElementID);

        // Start off with the category disabled.
        this.EditorCategoryHtmlElement.disabled = true;

        // All the categories into the select.
        let categories = Application.CategoryManager.Categories;
        categories.forEach(category => {
            let option = <HTMLOptionElement>document.createElement('option');
            option.value = category.ID.toString();
            option.innerHTML = category.Name;
            this.EditorCategoryHtmlElement.appendChild(option);
        }, this);

        // If the point annotation has a category, determine its index, and set the selected index. Note: makes use of the same ordering as categories were added above.
        if (null !== instanceForEdit.Category) {
            for (let iCategory = 0; iCategory < categories.length; iCategory++) {
                const category = categories[iCategory];
                if (category === instanceForEdit.Category) {
                    this.EditorCategoryHtmlElement.selectedIndex = iCategory;
                    break;
                }
            }
        }

        // The visuals color picker.
        this.EditorVisualsDatGUI = new dat.GUI({ autoPlace: false });
        this.EditorColorHtmlElement.appendChild(this.EditorVisualsDatGUI.domElement);

        let r = editor.Instance.Visuals.Color.R * 255;
        let g = editor.Instance.Visuals.Color.G * 255;
        let b = editor.Instance.Visuals.Color.B * 255;

        let tempObj = { ColorValue: [r, g, b], };
        let color = this.EditorVisualsDatGUI.addColor(tempObj, 'ColorValue');
        color.onChange(() => {
            editor.Instance.Visuals.Color.Set(tempObj.ColorValue[0] / 255, tempObj.ColorValue[1] / 255, tempObj.ColorValue[2] / 255);
        });

        // Set form values.
        this.EditorNameHtmlElement.value = instanceForEdit.Name;
        this.EditorDescriptionHtmlElement.value = instanceForEdit.Description;
        let useCategory = null !== instanceForEdit.Category;
        this.EditorUseCategoryHtmlElement.checked = useCategory;
        if (useCategory) {
            this.SetUseCategoryVisuals();
        } else {
            this.SetUseAnnotationVisuals();
        }
        this.EditorSizeHtmlElement.value = instanceForEdit.Visuals.Size.toString();
        this.EditorTransparencyHtmlElement.value = instanceForEdit.Visuals.Transparency.toString();
        this.EditorStandardLocationHtmlElement.innerHTML = instanceForEdit.StandardLocation.ToString();

        let standardLocation = instanceForEdit.StandardLocation.ToVector3();
        let preferredLocation = CoordinateSystemConversion.ConvertPointStandardToPreferred(standardLocation, Application.PreferredCoordinateSystem.Value);
        let pref = new Vector3My();
        pref.FromVector3(preferredLocation);
        this.EditorModelLocationHtmlElement.innerHTML = pref.ToString();

        this.EditorPointIDHtmlElement.innerHTML = instanceForEdit.ID.toString();

        // Update temporary instance in response to form changes.
        this.EditorNameHtmlElement.onchange = () => {
            this.Editor.Instance.Name = this.EditorNameHtmlElement.value;
        }
        this.EditorDescriptionHtmlElement.onchange = () => {
            this.Editor.Instance.Description = this.EditorDescriptionHtmlElement.value;
        }
        this.EditorUseCategoryHtmlElement.onchange = () => {
            if (this.EditorUseCategoryHtmlElement.checked) {
                this.SetUseCategoryVisuals();
                this.Editor.Instance.Category = this.GetCategory(); // Set the category initially.
            } else {
                this.SetUseAnnotationVisuals();
                this.Editor.Instance.Category = null;
            }
        }
        this.EditorCategoryHtmlElement.onchange = () => {
            this.Editor.Instance.Category = this.GetCategory();
        }
        this.EditorSizeHtmlElement.onchange = () => {
            this.Editor.Instance.Visuals.Size = parseFloat(this.EditorSizeHtmlElement.value);
        }
        this.EditorTransparencyHtmlElement.onchange = () => {
            this.Editor.Instance.Visuals.Transparency = parseFloat(this.EditorTransparencyHtmlElement.value);
        }

        editor.Show();
    }

    private GetCategory(): Category {
        if (0 < this.EditorCategoryHtmlElement.childNodes.length) {
            let option = <HTMLOptionElement>this.EditorCategoryHtmlElement.childNodes[this.EditorCategoryHtmlElement.selectedIndex];
            let IDStr = option.value;
            let category = Application.CategoryManager.GetCategoryByIDString(IDStr);
            return category;
        } else {
            return null;
        }
    }

    private SetUseCategoryVisuals(): void {
        this.EditorCategoryHtmlElement.disabled = false;

        this.EditorColorHtmlElement.style.pointerEvents = 'none';
        this.EditorColorHtmlElement.style.opacity = '0.5';

        this.EditorSizeHtmlElement.disabled = true;
        this.EditorTransparencyHtmlElement.disabled = true;
    }

    private SetUseAnnotationVisuals(): void {
        this.EditorCategoryHtmlElement.disabled = true;

        this.EditorColorHtmlElement.style.pointerEvents = 'auto';
        this.EditorColorHtmlElement.style.opacity = '1';

        this.EditorSizeHtmlElement.disabled = false;
        this.EditorTransparencyHtmlElement.disabled = false;
    }
    
    private EditorClosed = (result: EditorBoxResult<PointAnnotation>) => {
        if (result.Action === 'Accept') {
            let annotation = this.Annotations.GetByID(result.Instance.ID);
            annotation.Copy(result.Instance);
        }

        this.EditorVisualsDatGUI.destroy();

        this.FillSelect();
    }

    private RemoveClick = () => {
        let option = <HTMLOptionElement>this.Select.children[this.Select.selectedIndex];
        let annotation = this.Annotations.GetByIDString(option.value);
        this.Annotations.Remove(annotation);

        this.FillSelect();
    }

    public Dispose(): void {
        this.DisconnectEvents();

        this.SingularHtmlElement.remove();
        this.PluralHtmlElement.remove();

        this.AnnotationVisuals.forEach(visual => {
            visual.Dispose();
        });
        this.AnnotationVisuals.splice(0);

        this.zDisposed.Dispatch();
    }
}