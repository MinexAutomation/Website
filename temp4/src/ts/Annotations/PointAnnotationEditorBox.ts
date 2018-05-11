import * as wDatGui from "dat.gui";
const dat = (<any>wDatGui).default; // Workaround.

import { EditorBox, EditorBoxResultAction, EditorBoxResult } from "../Common/Boxes/EditorBox";
import { PointAnnotation } from "./PointAnnotation";

import * as template from "./PointAnnotationEditorBox.html";
import "./PointAnnotationEditorBox.css";
import { Application } from "../Application";
import { CoordinateSystemConversion } from "../CoordinateSystemConversion";
import { Vector3My } from "../Classes/Vectors/Vector3My";
import { Category } from "./Category";


export class PointAnnotationEditorBox extends EditorBox<PointAnnotation> {
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
    private EditorVisualsDatGUI: wDatGui.GUI;


    public constructor(instance: PointAnnotation, caption: string = 'Edit Point Annotation') {
        super(instance, caption);

        // Add templated HTML.
        let body = document.createElement('div');
        this.BodyHtmlElement.appendChild(body);
        body.id = PointAnnotationEditorBox.EditorBodyHtmlElementID;

        body.innerHTML += template;

        // Bind to the HTML objects added in the template.
        this.EditorNameHtmlElement = <HTMLInputElement>document.getElementById(PointAnnotationEditorBox.EditorNameHtmlElementID);
        this.EditorDescriptionHtmlElement = <HTMLInputElement>document.getElementById(PointAnnotationEditorBox.EditorDescriptionHtmlElementID);
        this.EditorUseCategoryHtmlElement = <HTMLInputElement>document.getElementById(PointAnnotationEditorBox.EditorUseCategoryHtmlElementID);
        this.EditorCategoryHtmlElement = <HTMLSelectElement>document.getElementById(PointAnnotationEditorBox.EditorCategoryHtmlElementID);
        this.EditorColorHtmlElement = <HTMLDivElement>document.getElementById(PointAnnotationEditorBox.EditorColorHtmlElementID);
        this.EditorSizeHtmlElement = <HTMLInputElement>document.getElementById(PointAnnotationEditorBox.EditorSizeHtmlElementID);
        this.EditorTransparencyHtmlElement = <HTMLInputElement>document.getElementById(PointAnnotationEditorBox.EditorTransparencyHtmlElementID);
        this.EditorModelLocationHtmlElement = <HTMLLabelElement>document.getElementById(PointAnnotationEditorBox.EditorModelLocationHtmlElementID);
        this.EditorStandardLocationHtmlElement = <HTMLLabelElement>document.getElementById(PointAnnotationEditorBox.EditorStandardLocationHtmlElementID);
        this.EditorPointIDHtmlElement = <HTMLLabelElement>document.getElementById(PointAnnotationEditorBox.EditorPointIDHtmlElementID);

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

        let instanceForEdit = this.Instance;

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

        let r = instanceForEdit.Visuals.Color.R * 255;
        let g = instanceForEdit.Visuals.Color.G * 255;
        let b = instanceForEdit.Visuals.Color.B * 255;

        let tempObj = { ColorValue: [r, g, b], };
        let color = this.EditorVisualsDatGUI.addColor(tempObj, 'ColorValue');
        color.onChange(() => {
            instanceForEdit.Visuals.Color.Set(tempObj.ColorValue[0] / 255, tempObj.ColorValue[1] / 255, tempObj.ColorValue[2] / 255);
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
            instanceForEdit.Name = this.EditorNameHtmlElement.value;
        }
        this.EditorDescriptionHtmlElement.onchange = () => {
            instanceForEdit.Description = this.EditorDescriptionHtmlElement.value;
        }
        this.EditorUseCategoryHtmlElement.onchange = () => {
            if (this.EditorUseCategoryHtmlElement.checked) {
                this.SetUseCategoryVisuals();
                instanceForEdit.Category = this.GetCategory(); // Set the category initially.
            } else {
                this.SetUseAnnotationVisuals();
                instanceForEdit.Category = null;
            }
        }
        this.EditorCategoryHtmlElement.onchange = () => {
            instanceForEdit.Category = this.GetCategory();
        }
        this.EditorSizeHtmlElement.onchange = () => {
            instanceForEdit.Visuals.Size = parseFloat(this.EditorSizeHtmlElement.value);
        }
        this.EditorTransparencyHtmlElement.onchange = () => {
            instanceForEdit.Visuals.Transparency = parseFloat(this.EditorTransparencyHtmlElement.value);
        }
    }

    private IsDisposedPointAnnotationEditorBox: boolean = false;
    public Dispose(action: EditorBoxResultAction): void {
        if(this.IsDisposedPointAnnotationEditorBox) {
            return;
        }

        this.EditorVisualsDatGUI.destroy();

        super.Dispose(action);
        
        this.IsDisposedPointAnnotationEditorBox = true;
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
}