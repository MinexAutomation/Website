import { ISubscribable, DispatcherBase } from "./Events";


export interface IEventHandler<TSender, TArgument> {
    (sender: TSender, argument: TArgument): void
}

export interface IEvent<TSender, TArgument> extends ISubscribable<IEventHandler<TSender, TArgument>> { }


export class Event<TSender, TArgument> extends DispatcherBase<IEventHandler<TSender, TArgument>> implements IEvent<TSender, TArgument> {
    public constructor() {
        super();
    }

    public Dispatch(sender: TSender, argument: TArgument): void {
        this.zDispatch(false, this, arguments);
    }

    public DispatchAsynchronously(sender: TSender, argument: TArgument): void {
        this.zDispatch(true, this, arguments);
    }

    public AsEvent(): IEvent<TSender, TArgument> {
        return super.AsEvent();
    }
}