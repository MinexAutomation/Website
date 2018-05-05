import { ISimpleEvent, SimpleEvent } from "./Events/SimpleEvent";

/**
 * Added: An element was added to the end.
 * Inserted: An element was inserted at a given index.
 * Removed: An element was removed at a given index.
 * Reset: Indicates the array has changed so drastically that clients should assume the array is now totally different.
 */
type EventedArrayChangeType = 'Added' | 'Inserted' | 'Removed' | 'Reset';

export class EventedArrayChanged<T> {
    public constructor(
        public readonly Type: EventedArrayChangeType,
        public readonly Value: T = null,
        public readonly Index: number = -1,
        ) {}
}

export class EventedArray<T> {
    protected zValues: T[] = [];
    public get Values(): T[] {
        return this.zValues.slice();
    }
    public get Length(): number {
        return this.zValues.length;
    }


    protected zChanged = new SimpleEvent<EventedArrayChanged<T>>();
    public get Changed(): ISimpleEvent<EventedArrayChanged<T>> {
        return this.zChanged.AsEvent();
    }

    public Add(value: T): void {
        this.zValues.push(value);
        
        let changed = new EventedArrayChanged<T>('Added', value);
        this.zChanged.Dispatch(changed);
    }

    public AddRange(values: T[]): void {
        values.forEach(element => {
            this.zValues.push(element);
        });

        let changed = new EventedArrayChanged<T>('Reset');
        this.zChanged.Dispatch(changed);
    }

    public Insert(value: T, index: number): void {
        this.zValues.splice(index, 0, value);

        let changed = new EventedArrayChanged<T>('Inserted', value, index);
        this.zChanged.Dispatch(changed);
    }

    public Remove(value: T): void {
        let index = this.zValues.indexOf(value);
        if(-1 < index) {
            this.RemoveAt(index);
        }
    }

    public RemoveAt(index: number): void {
        let value = this.zValues[index];

        this.zValues.splice(index, 1);

        let changed = new EventedArrayChanged<T>('Removed', value, index);
        this.zChanged.Dispatch(changed);
    }

    public Clear(): void {
        this.zValues.splice(0);

        let changed = new EventedArrayChanged<T>('Reset');
        this.zChanged.Dispatch(changed);
    }

    public At(index: number): T {
        return this.zValues[index];
    }

    public IndexOf(value: T): number {
        for (let iValue = 0; iValue < this.zValues.length; iValue++) {
            const arrayValue = this.zValues[iValue];
            if(arrayValue === value) {
                return iValue;
            }
        }

        return -1;
    }
}