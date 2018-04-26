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
        this.PluralHtmlElement = controlPanel.CreateChildControlElement(PointAnnotationMode.PluralHtmlElementID);

        controlPanel.CreateChildControlTitle(this.PluralHtmlElement, 'Point Annotations');

        this.LoadButton = new ButtonControl(this.PluralHtmlElement, 'Load');
        this.LoadButton.Click.Subscribe(this.LoadClick)

        this.SaveButton = new ButtonControl(this.PluralHtmlElement, 'Save');
        this.SaveButton.Click.Subscribe(this.SaveClick);

        this.FinishedButton = new ButtonControl(this.PluralHtmlElement, 'Finished');
        this.FinishedButton.Click.Subscribe(this.FinishedClick);

        this.SingularHtmlElement = controlPanel.CreateChildControlElement(PointAnnotationMode.SingularHtmlElementID);

        controlPanel.CreateChildControlTitle(this.SingularHtmlElement, 'Point Annotation');

        this.Select = document.createElement('select');
        this.SingularHtmlElement.appendChild(this.Select);
        this.FillSelect();
        this.Annotations.Changed.Subscribe(this.AnnotationsChanged);

        this.AddButton = new ButtonControl(this.SingularHtmlElement, 'Add');
        this.AddButton.Click.Subscribe(this.AddClick);

        this.EditButton = new ButtonControl(this.SingularHtmlElement, 'Edit');
        this.EditButton.Click.Subscribe(this.EditClick);

        this.RemoveButton = new ButtonControl(this.SingularHtmlElement, 'Remove');
        this.RemoveButton.Click.Subscribe(this.RemoveClick);
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

    private AnnotationsChanged = (changed: EventedArrayChanged<PointAnnotation>) => {
        switch (changed.Type) {
            case 'Added':
                this.FillSelect();
                break;

            case 'Inserted':
                this.FillSelect();
                break;

            case 'Removed':
                this.FillSelect();
                break;

            case 'Reset':
                this.FillSelect();
                break;

            default:
                // Do nothing.
                break;
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
        console.log(this);
    }

    private EditClick = () => {
        let option = <HTMLOptionElement>this.Select.children[this.Select.selectedIndex];
        let category = this.Annotations.GetByIDString(option.value);

        let instanceForEdit = category.Clone();

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

        this.EditorUseCategoryHtmlElement.onchange = () => {
            if(this.EditorUseCategoryHtmlElement.checked) {
                this.EditorCategoryHtmlElement.disabled = false;
                
                this.EditorColorHtmlElement.style.pointerEvents = 'none';
                this.EditorColorHtmlElement.style.opacity = '0.5';

                this.EditorSizeHtmlElement.disabled = true;
                this.EditorTransparencyHtmlElement.disabled = true;
            } else {
                this.EditorCategoryHtmlElement.disabled = true;

                this.EditorColorHtmlElement.style.pointerEvents = 'auto';
                this.EditorColorHtmlElement.style.opacity = '1';

                this.EditorSizeHtmlElement.disabled = false;
                this.EditorTransparencyHtmlElement.disabled = false;
            }
        }

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

        // The visuals color picker.
        this.EditorVisualsDatGUI = new dat.GUI({ autoPlace: false });
        this.EditorColorHtmlElement.appendChild(this.EditorVisualsDatGUI.domElement);

        let r = Math.round(editor.Instance.Visuals.Color.R);
        let g = Math.round(editor.Instance.Visuals.Color.G);
        let b = Math.round(editor.Instance.Visuals.Color.B);

        let tempObj = { ColorValue: [r, g, b], };
        let color = this.EditorVisualsDatGUI.addColor(tempObj, 'ColorValue');
        color.onChange(() => {
            editor.Instance.Visuals.Color.R = tempObj.ColorValue[0];
            editor.Instance.Visuals.Color.G = tempObj.ColorValue[1];
            editor.Instance.Visuals.Color.B = tempObj.ColorValue[2];
            console.log(editor.Instance.Visuals.Color);
        });


        // let nameLabel = document.createElement('label');
        // body.appendChild(nameLabel);
        // nameLabel.innerHTML = 'Name:';

        // let br = document.createElement('br');
        // body.appendChild(br);

        // let name = document.createElement('input');
        // body.appendChild(name);
        // name.type = 'text';
        // name.name = 'name';
        // name.placeholder = 'Name...';
        // name.value = editor.Instance.Name;
        // name.onchange = () => {
        //     this.Editor.Instance.Name = name.value;
        // }
        // name.style.width = '100%';

        // br = document.createElement('br');
        // body.appendChild(br);

        // let descriptionLabel = document.createElement('label');
        // body.appendChild(descriptionLabel);
        // descriptionLabel.innerHTML = 'Description:'

        // br = document.createElement('br');
        // body.appendChild(br);

        // let description = document.createElement('textarea');
        // body.appendChild(description);
        // description.name = 'description';
        // description.placeholder = 'Description...';
        // description.value = editor.Instance.Description;
        // description.onchange = () => {
        //     this.Editor.Instance.Description = description.value;
        // };
        // description.style.width = '100%'

        // let useCategoryLabel = document.createElement('label');
        // body.appendChild(useCategoryLabel);
        // useCategoryLabel.innerHTML = 'Use Category:';

        // br = document.createElement('br');
        // body.appendChild(br);

        // let useCategory = document.createElement('input');
        // body.appendChild(useCategory);
        // useCategory.type = 'checkbox';

        // br = document.createElement('br');
        // body.appendChild(br);

        // let categoryIDLabel = document.createElement('label');
        // body.appendChild(categoryIDLabel);
        // categoryIDLabel.innerHTML = 'Category ID:';

        // br = document.createElement('br');
        // body.appendChild(br);

        // let categoryID = document.createElement('input');
        // body.appendChild(categoryID);
        // categoryID.type = 'text';
        // categoryID.placeholder = 'Integer ID...'
        // categoryID.pattern = '\d+';
        // categoryID.oninvalid = () => {
        //     console.log('invalid');
        // }

        // br = document.createElement('br');
        // body.appendChild(br);

        // let visualPropertiesLabel = document.createElement('label');
        // body.appendChild(visualPropertiesLabel);
        // visualPropertiesLabel.innerHTML = 'Visual Properties:'

        // let guiPositioner = document.createElement('div');
        // body.appendChild(guiPositioner);
        // guiPositioner.style.paddingBottom = '25px';
        // guiPositioner.style.left = '0px';
        // guiPositioner.style.pointerEvents = 'none';
        // guiPositioner.style.opacity = '0.5';

        // this.EditorVisualsDatGUI = new dat.GUI({ autoPlace: false });
        // guiPositioner.appendChild(this.EditorVisualsDatGUI.domElement);

        // let r = Math.round(editor.Instance.Visuals.Color.R);
        // let g = Math.round(editor.Instance.Visuals.Color.G);
        // let b = Math.round(editor.Instance.Visuals.Color.B);

        // let tempObj = { ColorValue: [r, g, b], };
        // let color = this.EditorVisualsDatGUI.addColor(tempObj, 'ColorValue');
        // color.onChange(() => {
        //     editor.Instance.Visuals.Color.R = tempObj.ColorValue[0];
        //     editor.Instance.Visuals.Color.G = tempObj.ColorValue[1];
        //     editor.Instance.Visuals.Color.B = tempObj.ColorValue[2];
        //     console.log(editor.Instance.Visuals.Color);
        // });
        // let size = this.EditorVisualsDatGUI.add(editor.Instance.Visuals, 'Size');
        // let transparency = this.EditorVisualsDatGUI.add(editor.Instance.Visuals, 'Transparency', 0, 1);

        // // Events.
        // useCategory.onchange = () => {
        //     if(useCategory.checked) {
        //         // categoryID.style.pointerEvents = 'auto';
        //         // categoryID.style.opacity = '1';
        //         categoryID.disabled = false;
        //         guiPositioner.style.pointerEvents = 'auto';
        //         guiPositioner.style.opacity = '1';
        //     } else {
        //         // categoryID.style.pointerEvents = 'none';
        //         // categoryID.style.opacity = '0.5';
        //         categoryID.disabled = true;
        //         guiPositioner.style.pointerEvents = 'none';
        //         guiPositioner.style.opacity = '0.5';
        //     }
        // }

        editor.Show();
    }

    private EditorClosed = (result: EditorBoxResult<PointAnnotation>) => {
        if (result.Action === 'Accept') {
            let category = this.Annotations.GetByID(result.Instance.ID);
            category.Copy(result.Instance);
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

        this.zDisposed.Dispatch();
    }
}