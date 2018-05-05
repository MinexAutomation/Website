import * as wDatGui from "dat.gui";
const dat = (<any>wDatGui).default; // Workaround.

import { IMode } from "./Mode";
import { SignalEvent, ISignalEvent } from "../Common/Events/SignalEvent";
import { ControlPanel } from "../Controls/ControlPanel";
import { CategoriesManager } from "../Annotations/CategoriesManager";
import { Application } from "../Application";
import { ButtonControl } from "../Controls/ButtonControl";
import { Category } from "../Annotations/Category";
import { LocalStorageManager } from "../LocalStorageManager";
import { EditorBox, EditorBoxResult } from "../Common/Boxes/EditorBox";


export class CategoryManagementMode implements IMode {
    public static readonly ID: string = 'categoryManagement';
    public static readonly CategoriesControlHtmlElementID = 'CategoryManagementControl-Categories';
    public static readonly CategoryControlHtmlElementID = 'CategoryManagementControl-Category';

    private static Editor: EditorBox<Category>;

    public get ID(): string {
        return CategoryManagementMode.ID;
    }
    private zDisposed: SignalEvent = new SignalEvent();
    public get Disposed(): ISignalEvent {
        return this.zDisposed.AsEvent();
    }
    private readonly CategoriesManager: CategoriesManager = Application.CategoryManager;
    private readonly CategoriesControlHtmlElement: HTMLElement;
    private readonly LoadButton: ButtonControl;
    private readonly SaveButton: ButtonControl;
    private readonly FinishedButton: ButtonControl;
    private readonly CategoryHtmlElement: HTMLElement;
    private readonly Select: HTMLSelectElement;
    private readonly AddCategoryButton: ButtonControl;
    private readonly RemoveCategoryButton: ButtonControl;
    private readonly EditCategoryButton: ButtonControl;
    private CategoryVisualsGUI: wDatGui.GUI;


    public constructor(controlPanel: ControlPanel) {
        // Categories.
        this.CategoriesControlHtmlElement = controlPanel.CreateChildControlElement(CategoryManagementMode.CategoriesControlHtmlElementID);

        controlPanel.CreateChildControlTitle(this.CategoriesControlHtmlElement, 'Categories');

        this.LoadButton = new ButtonControl(this.CategoriesControlHtmlElement, 'Load');
        this.LoadButton.Click.Subscribe(this.LoadClick);

        this.SaveButton = new ButtonControl(this.CategoriesControlHtmlElement, 'Save');
        this.SaveButton.Click.Subscribe(this.SaveClick);

        this.FinishedButton = new ButtonControl(this.CategoriesControlHtmlElement, 'Finished');
        this.FinishedButton.Click.Subscribe(this.FinishedClick);

        // Category.
        this.CategoryHtmlElement = controlPanel.CreateChildControlElement(CategoryManagementMode.CategoryControlHtmlElementID);

        controlPanel.CreateChildControlTitle(this.CategoryHtmlElement, 'Category');

        this.Select = document.createElement('select');
        this.CategoryHtmlElement.appendChild(this.Select);

        this.AddCategoryButton = new ButtonControl(this.CategoryHtmlElement, 'Add');
        this.AddCategoryButton.Click.Subscribe(this.AddClick);

        this.RemoveCategoryButton = new ButtonControl(this.CategoryHtmlElement, 'Remove');
        this.RemoveCategoryButton.Click.Subscribe(this.RemoveClick);

        this.EditCategoryButton = new ButtonControl(this.CategoryHtmlElement, 'Edit');
        this.EditCategoryButton.Click.Subscribe(this.EditClick);

        this.FillSelectCategories();
    }

    private FinishedClick = () => {
        this.SaveClick();

        this.Dispose();

        Application.CategoryManager.OnChange();
    }

    private LoadClick = () => {
        let categories = LocalStorageManager.LoadCategories();
        if (categories) {
            this.CategoriesManager.Copy(categories);
        }

        this.FillSelectCategories();
    }

    private SaveClick = () => {
        LocalStorageManager.SaveCategories(this.CategoriesManager);
    }

    private AddClick = () => {
        let ID = this.CategoriesManager.GetNextID();
        let category = new Category(ID, 'Category ' + ID);
        this.CategoriesManager.Categories.push(category);
        this.FillSelectCategories();
    }

    private RemoveClick = () => {
        let option = <HTMLOptionElement>this.Select.children[this.Select.selectedIndex];
        let category = this.CategoriesManager.GetCategoryByIDString(option.value);
        let index = this.CategoriesManager.Categories.indexOf(category);
        this.CategoriesManager.Categories.splice(index, 1);
        
        category.Dispose();

        this.FillSelectCategories();
    }

    private EditClick = () => {
        let option = <HTMLOptionElement>this.Select.children[this.Select.selectedIndex];
        let category = this.CategoriesManager.GetCategoryByIDString(option.value);

        let instanceForEdit = category.Clone();

        let editor = new EditorBox<Category>(instanceForEdit, 'Edit Category');
        CategoryManagementMode.Editor = editor;
        editor.Closed.SubscribeOnce(this.EditorClosed);

        let body = editor.BodyHtmlElement;

        let nameLabel = document.createElement('label');
        body.appendChild(nameLabel);
        nameLabel.innerHTML = 'Name:';

        let br = document.createElement('br');
        body.appendChild(br);

        let name = document.createElement('input');
        body.appendChild(name);
        name.type = 'text';
        name.name = 'name';
        name.placeholder = 'Category Name';
        name.value = editor.Instance.Name;
        name.onchange = this.OnNameChanged;
        name.style.width = '100%';

        br = document.createElement('br');
        body.appendChild(br);

        let descriptionLabel = document.createElement('label');
        body.appendChild(descriptionLabel);
        descriptionLabel.innerHTML = 'Description:'

        br = document.createElement('br');
        body.appendChild(br);

        let description = document.createElement('textarea');
        body.appendChild(description);
        description.name = 'description';
        description.placeholder = 'Category Description';
        description.value = editor.Instance.Description;
        description.onchange = this.OnDescriptionChanged;
        description.style.width = '100%'

        br = document.createElement('br');
        body.appendChild(br);

        let visualPropertiesLabel = document.createElement('label');
        body.appendChild(visualPropertiesLabel);
        visualPropertiesLabel.innerHTML = 'Visual Properties:'

        let guiPositioner = document.createElement('div');
        body.appendChild(guiPositioner);
        guiPositioner.style.paddingBottom = '25px';
        guiPositioner.style.left = '0px';

        this.CategoryVisualsGUI = new dat.GUI({ autoPlace: false });
        guiPositioner.appendChild(this.CategoryVisualsGUI.domElement);

        let r = editor.Instance.Visuals.Color.R * 255;
        let g = editor.Instance.Visuals.Color.G * 255;
        let b = editor.Instance.Visuals.Color.B * 255;

        let tempObj = { ColorValue: [r, g, b], };
        let color = this.CategoryVisualsGUI.addColor(tempObj, 'ColorValue');
        color.onChange(() => {
            editor.Instance.Visuals.Color.Set(tempObj.ColorValue[0] / 255, tempObj.ColorValue[1] / 255, tempObj.ColorValue[2] / 255);
        });
        let size = this.CategoryVisualsGUI.add(editor.Instance.Visuals, 'Size');
        let transparency = this.CategoryVisualsGUI.add(editor.Instance.Visuals, 'Transparency', 0, 1);

        editor.Show();
    }

    private OnNameChanged(this: HTMLElement, ev: Event): any {
        CategoryManagementMode.Editor.Instance.Name = (this as HTMLInputElement).value;
    }

    private OnDescriptionChanged(this: HTMLElement, ev: Event): any {
        CategoryManagementMode.Editor.Instance.Description = (this as HTMLTextAreaElement).value;
    }

    private EditorClosed = (result: EditorBoxResult<Category>) => {
        if (result.Action === 'Accept') {
            let category = this.CategoriesManager.GetCategoryByID(result.Instance.ID);
            category.Copy(result.Instance);
        }

        this.CategoryVisualsGUI.destroy();

        this.FillSelectCategories();
    }

    private FillSelectCategories() {
        // Remove all children.
        while (this.Select.firstChild) {
            this.Select.removeChild(this.Select.firstChild);
        }

        // Add children.
        this.CategoriesManager.Categories.forEach(category => {
            let option = document.createElement('option');
            this.Select.appendChild(option);
            option.value = category.ID.toString();
            option.innerHTML = category.Name;
        });
    }

    public Dispose(): void {
        this.CategoriesControlHtmlElement.remove();
        this.CategoryHtmlElement.remove();

        this.zDisposed.Dispatch();
    }
}