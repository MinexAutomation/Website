import { Category, ICategory } from "./Category";
import { SignalEvent, ISignalEvent } from "../Common/Events/SignalEvent";

export class CategoriesManager {
    public readonly Categories: Array<Category> = new Array<Category>();
    private zChanged: SignalEvent = new SignalEvent();
    public get Changed(): ISignalEvent {
        return this.zChanged.AsEvent();
    }


    public OnChange(): void {
        this.zChanged.Dispatch();
    }

    /**
     * Gets a category by ID. If the ID is not found, returns null.
     */
    public GetCategoryByID(id: number) : Category {
        let output = this.GetCategory((c) => {
            return id === c.ID;
        },
        `Category ID ${id} not found.`);

        return output;
    }

    public GetCategoryByIDString(idString: string) : Category {
        let id = parseInt(idString);

        let output = this.GetCategoryByID(id);
        return output;
    }

    public GetCategoryByName(name: string): Category {
        let output = this.GetCategory((c) => {
            return name === c.Name;
        },
        `Category Name ${name} not found.`);
        
        return output;
    }

    public GetCategory(predicate: (category: Category) => boolean, errorMessage: string = 'Category not found.') {
        for (let iCategory = 0; iCategory < this.Categories.length; iCategory++) {
            const category = this.Categories[iCategory];
            if(predicate(category)) {
                return category;
            }
        }

        console.error(errorMessage);
        return null;
    }

    /**
     * Returns the maximum ID among all category values. If the categories array is empty, returns -1.
     */
    public GetMaxID(): number {
        if(1 > this.Categories.length) {
            return -1;
        }

        let maxValue = Number.MIN_VALUE;
        this.Categories.forEach(category => {
            if(maxValue < category.ID) {
                maxValue = category.ID;
            }
        });
        return maxValue;
    }

    public GetNextID(): number {
        let maxID = this.GetMaxID();
        
        let output = maxID + 1;
        return output;
    }

    public ToObject(): Array<ICategory> {
        let output: Array<ICategory> = [];
        this.Categories.forEach(category => {
            let obj = category.ToObject();
            output.push(obj);
        });
        return output;
    }

    public FromObject(obj: Array<ICategory>): void {
        // Clear current categories if present.
        if(0 < this.Categories.length) {
            this.Categories.splice(0);
        }

        obj.forEach(categoryObj => {
            let category = new Category();
            category.FromObject(categoryObj);
            
            this.Categories.push(category);
        });
    }

    public Copy(other: CategoriesManager): void {
        this.Clear();

        other.Categories.forEach(category => {
            this.Categories.push(category);
        });
    }

    public Clear(): void {
        this.Categories.splice(0);
    }
}