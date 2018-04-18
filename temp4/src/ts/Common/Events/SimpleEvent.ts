import { ISubscribable, DispatcherBase } from "./Events";


export interface ISimpleEventHandler<TArgument> {
    (argument: TArgument): void
}

export interface ISimpleEvent<TArgument> extends ISubscribable<ISimpleEventHandler<TArgument>> { }


export class SimpleEvent<TArgument> extends DispatcherBase<ISimpleEventHandler<TArgument>> implements ISimpleEvent<TArgument> {
    public constructor() {
        super();
    }

    public Dispatch(argument: TArgument): void {
        this.zDispatch(false, this, arguments);
    }

    public DispatchAsynchronously(argument: TArgument): void {
        this.zDispatch(true, this, arguments);
    }

    public AsEvent(): ISimpleEvent<TArgument> {
        return super.AsEvent();
    }
}