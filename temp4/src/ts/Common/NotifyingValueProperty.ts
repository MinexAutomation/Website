import { SignalEvent, ISignalEvent } from "./Events/SignalEvent";


/**
 * Represents a property that notifies listeners when the value it contains changes.
 * 
 * Note: The contained value should use value semantics. If the value uses reference semantics and is changed via its reference, this class will have no way of knowing about that change.
 */
export class NotifyingValueProperty<TValue> {
    private zValue: TValue;
    public get Value(): TValue {
        return this.zValue;
    }
    public set Value(value: TValue) {
        this.zValue = value;
        this.zValueChanged.Dispatch();
    }
    private zValueChanged: SignalEvent = new SignalEvent();
    public get ValueChanged(): ISignalEvent {
        return this.zValueChanged.AsEvent();
    }


    constructor(value: TValue = null) {
        this.zValue = value;
    }
}