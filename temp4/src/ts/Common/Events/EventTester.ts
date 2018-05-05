import { SignalEvent, ISignalEvent } from "./SignalEvent";
import { SimpleEvent, ISimpleEvent } from "./SimpleEvent";
import { Event, IEvent } from "./Event";

export class EventTester {
    private zSignal = new SignalEvent();
    public get Signal(): ISignalEvent {
        return this.zSignal.AsEvent();
    }
    public OnSignal(): void {
        this.zSignal.Dispatch();
    }

    private zSimple = new SimpleEvent<string>();
    public get Simple(): ISimpleEvent<string> {
        return this.zSimple.AsEvent();
    }
    public OnSimple(): void {
        this.zSimple.Dispatch('Hello world!');
    }

    private zEvent = new Event<EventTester, string>();
    public get Event(): IEvent<EventTester, string> {
        return this.zEvent.AsEvent();
    }
    public OnEvent(): void {
        this.zEvent.Dispatch(this, 'Hello again world!');
    }

    private Value: string;


    public constructor() {
        this.Value = 'The Value';

        this.Signal.Subscribe(this.SignalHandler);
        this.Simple.Subscribe(this.SimpleHandler);
        this.Simple.SubscribeOnce(this.SimpleHandler2);
        this.Event.Subscribe(this.EventHandler);
    }

    private SignalHandler = () => {
        console.log('Signal + ' + this.Value);
    }

    private SimpleHandler = () => {
        console.log('Simple + ' + this.Value);
    }

    private SimpleHandler2 = (result: string) => {
        console.log('Simple2 + ' + result + ' + ' + this.Value);
    }

    private EventHandler = () => {
        console.log('Event + ' + this.Value);
    }

}