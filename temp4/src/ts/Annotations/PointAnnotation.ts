import { IVisualSpecification, VisualSpecification } from "./VisualSpecification";
import { IIdentified } from "../Common/Interfaces/IIdentified";
import { IVector3 } from "../Common";
import { Vector3 } from "three";
import { StorageVector3 } from "../Classes/StorageVector3";


export interface IPointAnnotation extends IIdentified {
    Description: string;
    UseCategory: boolean;
    CategoryID: number,
    Visuals: IVisualSpecification;
    StandardLocation: IVector3;
}


export class PointAnnotation implements IPointAnnotation {
    /**
     * An integer ID.
     */
    public ID: number;
    public Name: string;
    public Description: string;
    public UseCategory: boolean;
    public CategoryID: number; // Will be an integer.
    public readonly Visuals: VisualSpecification;
    public readonly StandardLocation: StorageVector3;


    public constructor(id?: number, name?: string, description: string = "", useCategory: boolean = false, categoryID: number = -1, visuals: VisualSpecification = new VisualSpecification(), standardLocation: StorageVector3 = new StorageVector3()) {
        this.ID = id;
        this.Name = name;
        this.Description = description;
        this.UseCategory = useCategory;
        this.CategoryID = categoryID;
        this.Visuals = visuals;
        this.StandardLocation = standardLocation;
    }

    public ToObject(): IPointAnnotation {
        let output: IPointAnnotation = {
            ID: this.ID,
            Name: this.Name,
            Description: this.Description,
            UseCategory: this.UseCategory,
            CategoryID: this.CategoryID,
            Visuals: this.Visuals.ToObject(),
            StandardLocation: this.StandardLocation.ToObject(),
        };
        return output;
    }

    public FromObject(obj: IPointAnnotation) {
        this.ID = obj.ID;
        this.Name = obj.Name;
        this.Description = obj.Description;
        this.UseCategory = obj.UseCategory;
        this.CategoryID = obj.CategoryID;
        this.Visuals.FromObject(obj.Visuals);
        this.StandardLocation.FromObject(obj.StandardLocation);
    }

    public Clone(): PointAnnotation {
        let output = new PointAnnotation(this.ID, this.Name, this.Description, this.UseCategory, this.CategoryID, this.Visuals.Clone(), this.StandardLocation.Clone());
        return output;
    }

    public Copy(other: PointAnnotation): void {
        this.ID = other.ID;
        this.Name = other.Name;
        this.Description = other.Description;
        this.UseCategory = other.UseCategory;
        this.CategoryID = other.CategoryID;
        this.Visuals.Copy(other.Visuals);
        this.StandardLocation.Copy(other.StandardLocation);
    }
}