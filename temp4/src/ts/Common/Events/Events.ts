

export interface UnsubscribeAction {
    (): void
}

export interface ISubscribable<THandlerTyper> {
    Subscribe(handler: THandlerTyper): UnsubscribeAction;
    SubscribeOnce(handler: THandlerTyper): UnsubscribeAction;
    IsSubscribed(handler: THandlerTyper): boolean;
    Unsubscribe(handler: THandlerTyper): void;
    /**
     * Unsubscribe all subscribers.
     */
    Clear(): void;
}

export class Subscription<TEventHandler extends Function> {
    public IsExecuted: boolean = false;


    public constructor(public handler: TEventHandler, public IsOnce: boolean) { }

    public Execute(executeAsynchronously: boolean, scope: any, args: IArguments) {
        if (!this.IsOnce || !this.IsExecuted) {
            this.IsExecuted = true;

            if (executeAsynchronously) {
                setTimeout(() => {
                    this.handler.apply(scope, args);
                }, 0);
            } else {
                this.handler.apply(scope, args);
            }
        }
    }
}

export abstract class DispatcherBase<TEventHandler extends Function> implements ISubscribable<TEventHandler> {
    private Subscriptions = new Array<Subscription<TEventHandler>>();
    private Wrapper = new DispatcherWrapper(this);


    public Subscribe(handler: TEventHandler): UnsubscribeAction {
        if (handler) {
            this.Subscriptions.push(new Subscription(handler, false));
        }

        return () => {
            this.Unsubscribe(handler);
        };
    }

    public SubscribeOnce(handler: TEventHandler): UnsubscribeAction {
        if (handler) {
            this.Subscriptions.push(new Subscription(handler, true));
        }

        return () => {
            this.Unsubscribe(handler);
        };
    }

    public IsSubscribed(handler: TEventHandler): boolean {
        if (!handler) {
            return false;
        }

        let output = this.Subscriptions.some(subscription => subscription.handler === handler);
        return output;
    }

    public Unsubscribe(handler: TEventHandler): void {
        if (!handler) {
            return;
        }

        for (let iSubscription = 0; iSubscription < this.Subscriptions.length; iSubscription++) {
            const element = this.Subscriptions[iSubscription];
            if (element.handler === handler) {
                this.Subscriptions.splice(iSubscription, 1);
                break;
            }
        }
    }

    public Clear(): void {
        this.Subscriptions.splice(0);
    }

    protected zDispatch(executeAsynchronously: boolean, scope: any, args: IArguments): void {
        let copy = this.Subscriptions.slice(0);
        copy.forEach(subscription => {
            subscription.Execute(executeAsynchronously, scope, args);

            this.Cleanup(subscription);
        });
    }

    private Cleanup(subscription: Subscription<TEventHandler>) {
        if (subscription.IsOnce && subscription.IsExecuted) {
            let index = this.Subscriptions.indexOf(subscription);
            if (-1 < index) {
                this.Subscriptions.splice(index, 1);
            }
        }
    }

    public AsEvent(): ISubscribable<TEventHandler> {
        return this.Wrapper;
    }
}

export class DispatcherWrapper<TEventHandler> implements ISubscribable<TEventHandler> {
    private zSubscribe: (handler: TEventHandler) => UnsubscribeAction;
    private zSubscribeOnce: (handler: TEventHandler) => UnsubscribeAction;
    private zIsSubscribed: (handler: TEventHandler) => boolean;
    private zUnsubscribe: (handler: TEventHandler) => void;
    private zClear: () => void;


    public constructor(dispatcher: ISubscribable<TEventHandler>) {
        this.zSubscribe = (handler: TEventHandler) => dispatcher.Subscribe(handler);
        this.zSubscribeOnce = (handler: TEventHandler) => dispatcher.SubscribeOnce(handler);
        this.zIsSubscribed = (handler: TEventHandler) => dispatcher.IsSubscribed(handler);
        this.zUnsubscribe = (handler: TEventHandler) => dispatcher.Unsubscribe(handler);
        this.zClear = () => dispatcher.Clear();
    }

    public Subscribe(handler: TEventHandler): UnsubscribeAction {
        let output = this.zSubscribe(handler);
        return output;
    }

    public SubscribeOnce(handler: TEventHandler): UnsubscribeAction {
        let output = this.zSubscribeOnce(handler);
        return output;
    }

    public IsSubscribed(handler: TEventHandler): boolean {
        let output = this.zIsSubscribed(handler);
        return output;
    }

    public Unsubscribe(handler: TEventHandler): void {
        this.zUnsubscribe(handler);
    }

    public Clear(): void {
        this.zClear();
    }
}