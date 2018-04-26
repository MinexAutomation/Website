import { VisualSpecification, IVisualSpecification } from "./VisualSpecification";
import { IIdentified } from "../Common/Interfaces/IIdentified";


export interface ICategory extends IIdentified {
    Description: string;
    Visuals: IVisualSpecification;
}


export class Category {
    /**
     * An integer ID.
     */
    public ID: number;
    public Name: string;
    public Description: string;
    public readonly Visuals: VisualSpecification;


    public constructor(id?: number, name?: string, description: string = "", visuals: VisualSpecification = new VisualSpecification()) {
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