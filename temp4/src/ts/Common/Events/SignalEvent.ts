import { ISubscribable, DispatcherBase } from "./Events";


export interface ISignalEventHandler {
    (): void
}

export interface ISignalEvent extends ISubscribable<ISignalEventHandler> { }


export class SignalEvent extends DispatcherBase<ISignalEventHandler> implements ISignalEvent {
    public constructor() {
        super();
    }

    public Dispatch(): void {
        this.zDispatch(false, this, arguments);
    }

    public DispatchAsynchronously(): void {
        this.zDispatch(true, this, arguments);
    }

    public AsEvent(): ISignalEvent {
        return super.AsEvent();
    }
}