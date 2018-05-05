import { IIdentified } from "../Common/Interfaces/IIdentified";
import { VisualSpecification, IVisualSpecification } from "../Classes/VisualSpecification";
import { SimpleEvent, ISimpleEvent } from "../Common/Events/SimpleEvent";


export interface ICategory extends IIdentified {
    Description: string;
    Visuals: IVisualSpecification;
}


export class Category {
    public static readonly DummyCategoryID = -1;


    /**
     * An integer ID.
     */
    public ID: number;
    public Name: string;
    public Description: string;
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
    }
    private VisualsChangedHandler = () => {
        this.OnChanged();
    }
    private zChanged = new SimpleEvent<Category>();
    public get Changed(): ISimpleEvent<Category> {
        return this.zChanged.AsEvent();
    }
    private OnChanged(): void {
        this.zChanged.Dispatch(this);
    }
    private zDisposed = new SimpleEvent<Category>();
    public get Disposed(): ISimpleEvent<Category> {
        return this.zDisposed.AsEvent();
    }
    public Dispose(): void {
        this.Visuals.Changed.Unsubscribe(this.VisualsChangedHandler);
        
        this.zDisposed.Dispatch(this);
    }
    

    public constructor(id: number = Category.DummyCategoryID, name: string = "", description: string = "", visuals: VisualSpecification = new VisualSpecification()) {
        this.ID = id;
        this.Name = name;
        this.Description = description;
        this.Visuals = visuals;
    }

    public ToObject(): ICategory {
        let output: ICategory = {
            ID: this.ID,
            Name: this.Name,
            Description: this.Description,
            Visuals: this.Visuals.ToObject(),
        };
        return output;
    }

    public FromObject(obj: ICategory) {
        this.ID = obj.ID;
        this.Name = obj.Name;
        this.Description = obj.Description;
        this.Visuals.FromObject(obj.Visuals);
    }

    public Clone(): Category {
        let output = new Category(this.ID, this.Name, this.Description, this.Visuals.Clone());
        return output;
    }

    public Copy(other: Category): void {
        this.ID = other.ID;
        this.Name = other.Name;
        this.Description = other.Description;
        this.Visuals.Copy(other.Visuals);
    }
}