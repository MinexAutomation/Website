import { IIdentified } from "../Common/Interfaces/IIdentified";
import { Vector3 } from "three";
import { SignalEvent, ISignalEvent } from "../Common/Events/SignalEvent";
import { IVector3 } from "../Classes/Vectors/IVector3";
import { SimpleEvent, ISimpleEvent } from "../Common/Events/SimpleEvent";
import { Category } from "./Category";
import { Application } from "../Application";
import { Vector3My } from "../Classes/Vectors/Vector3My";
import { IPointAnnotationStorage } from "./IPointAnnotationStorage";
import { VisualSpecification } from "../Classes/VisualSpecification";


export class PointAnnotation implements IIdentified {
    /**
     * An integer ID.
     */
    public ID: number;
    public Name: string;
    public Description: string;

    private zCategory: Category = null;
    public get Category(): Category {
        return this.zCategory;
    }
    public set Category(value: Category) {
        if (null !== this.zCategory) {
            this.zCategory.Changed.Unsubscribe(this.CategoryChangedHandler);
            this.zCategory.Disposed.Unsubscribe(this.CategoryDisposedHandler);
        }

        this.zCategory = value;

        if (null !== this.zCategory) {
            this.zCategory.Changed.Subscribe(this.CategoryChangedHandler);
            this.zCategory.Disposed.Subscribe(() => this.CategoryDisposedHandler());
        }

        this.OnCategoryChanged();
    }
    private CategoryChangedHandler = () => {
        this.OnCategoryChanged();
    }
    private CategoryDisposedHandler() {
        this.Category = null;
    }
    private zCategoryChanged = new SimpleEvent<Category>();
    public get CategoryChanged(): ISimpleEvent<Category> {
        return this.zCategoryChanged.AsEvent();
    }
    private OnCategoryChanged(): void {
        this.zCategoryChanged.Dispatch(this.Category);
    }

    private zVisuals: VisualSpecification = null;
    public get Visuals(): VisualSpecification {
        return this.zVisuals;
    }
    public set Visuals(value: VisualSpecification) {
        if (null !== this.zVisuals) {
            this.zVisuals.Changed.Unsubscribe(this.VisualsChangedHandler);
        }

        this.zVisuals = value;

        this.zVisuals.Changed.Subscribe(this.VisualsChangedHandler);

        this.OnVisualsChanged();
    }
    private VisualsChangedHandler = () => {
        this.OnVisualsChanged();
    }
    private zVisualsChanged = new SimpleEvent<VisualSpecification>();
    public get VisualsChanged(): ISimpleEvent<VisualSpecification> {
        return this.zVisualsChanged.AsEvent();
    }
    private OnVisualsChanged(): void {
        this.zVisualsChanged.Dispatch(this.Visuals);
    }

    private zStandardLocation: Vector3My = null;
    public get StandardLocation(): Vector3My {
        return this.zStandardLocation;
    }
    public set StandardLocation(value: Vector3My) {
        if (null !== this.StandardLocation) {
            this.zStandardLocation.Changed.Unsubscribe(this.StandardLocationChangedHandler);
        }

        this.zStandardLocation = value;

        this.zStandardLocation.Changed.Subscribe(this.StandardLocationChangedHandler);

        this.OnStandardLocationChanged();
    }
    private StandardLocationChangedHandler = () => {
        this.OnStandardLocationChanged();
    }
    private zStandardLocationChanged = new SimpleEvent<Vector3My>();
    public get StandardLocationChanged(): ISimpleEvent<Vector3My> {
        return this.zStandardLocationChanged.AsEvent();
    }
    private OnStandardLocationChanged(): void {
        this.zStandardLocationChanged.Dispatch(this.StandardLocation);
    }


    public constructor(id?: number, name?: string, description: string = "", category: Category = null, visuals: VisualSpecification = new VisualSpecification(), standardLocation: Vector3My = new Vector3My()) {
        this.ID = id;
        this.Name = name;
        this.Description = description;
        this.Category = category;
        this.Visuals = visuals;
        this.StandardLocation = standardLocation;
    }

    public Dispose(): void {
        if (null !== this.Category) {
            this.Category.Changed.Unsubscribe(this.CategoryChangedHandler);
        }
        this.Visuals.Changed.Unsubscribe(this.VisualsChangedHandler);
        this.StandardLocation.Changed.Unsubscribe(this.StandardLocationChangedHandler);
    }

    public ToObject(): IPointAnnotationStorage {
        let categoryID = null !== this.Category ? this.Category.ID : Category.DummyCategoryID;

        let output = {
            ID: this.ID,
            Name: this.Name,
            Description: this.Description,
            CategoryID: categoryID,
            Visuals: this.Visuals.ToObject(),
            StandardLocation: this.StandardLocation.ToObject(),
        };
        return output;
    }

    public FromObject(obj: IPointAnnotationStorage) {
        this.ID = obj.ID;
        this.Name = obj.Name;
        this.Description = obj.Description;
        if (Category.DummyCategoryID !== obj.CategoryID) {
            this.Category = Application.CategoryManager.GetCategoryByID(obj.CategoryID);
        }
        this.Visuals.FromObject(obj.Visuals);
        this.StandardLocation.FromObject(obj.StandardLocation);
    }

    public Clone(): PointAnnotation {
        let output = new PointAnnotation(this.ID, this.Name, this.Description, this.Category, this.Visuals.Clone(), this.StandardLocation.Clone());
        return output;
    }

    public Copy(other: PointAnnotation): void {
        this.ID = other.ID;
        this.Name = other.Name;
        this.Description = other.Description;
        this.Category = other.Category;
        this.Visuals.Copy(other.Visuals);
        this.StandardLocation.Copy(other.StandardLocation);
    }
}