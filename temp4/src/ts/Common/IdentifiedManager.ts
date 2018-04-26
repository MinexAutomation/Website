import { EventedArray, EventedArrayChanged } from "./EventedArray";
import { IIdentified } from "./Interfaces/IIdentified";


export class IdentifiedManager<T extends IIdentified> extends EventedArray<T> {
    /**
     * Gets a category by ID. If the ID is not found, returns null.
     */
    public GetByID(id: number) : T {
        let output = this.Get((c) => {
            return id === c.ID;
        },
        `Category ID ${id} not found.`);

        return output;
    }

    public GetByIDString(idString: string) : T {
        let id = parseInt(idString);

        let output = this.GetByID(id);
        return output;
    }

    public GetByName(name: string): T {
        let output = this.Get((c) => {
            return name === c.Name;
        },
        `Category Name ${name} not found.`);
        
        return output;
    }

    public Get(predicate: (value: T) => boolean, errorMessage: string = 'Value not found.') {
        for (let iValue = 0; iValue < this.zValues.length; iValue++) {
            const value = this.zValues[iValue];
            if(predicate(value)) {
                return value;
            }
        }

        console.error(errorMessage);
        return null;
    }

    /**
     * Returns the maximum ID among all category values. If the categories array is empty, returns -1.
     */
    public GetMaxID(): number {
        if(1 > this.zValues.length) {
            return -1;
        }

        let maxValue = Number.MIN_VALUE;
        this.zValues.forEach(category => {
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

    public ToObject(valueToObject: (value: T) => any) {
        let output = [];
        for (let iValue = 0; iValue < this.zValues.length; iValue++) {
            const value = this.zValues[iValue];
            let obj = valueToObject(value);
            output.push(obj);
        }
        return output;
    }

    public FromObject(objs, objToValue: (obj: any) => T): void {
        // Clear current values, if present.
        this.Clear();

        for (let iObj = 0; iObj < objs.length; iObj++) {
            const obj = objs[iObj];
            let value = objToValue(obj);
            this.zValues.push(value);
        }

        let changed = new EventedArrayChanged<T>('Reset');
        this.zChanged.Dispatch(changed);
    }

    public Copy(other: IdentifiedManager<T>): void {
        this.Clear();

        this.AddRange(other.zValues);
    }
}