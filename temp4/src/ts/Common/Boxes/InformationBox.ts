import { SignalEvent, ISignalEvent } from "../Events/SignalEvent";
import { ButtonControl } from "../../Controls/ButtonControl";

import * as template from "./InformationBox.html";
import "./InformationBox.css";

/**
 * Shows information messages using static functionality. Subscribe to the Closed() event before calling Show() if you want callback behavior when closed.
 * 
 * The information box can be closed via an upper-right 'X' button, an explicit 'OK' button, and clicking outside the infobox. All three methods of closing have the same effect.
 */
export class InformationBox {
    public static readonly RootHtmlElementID = 'InfoBox-Root';
    public static readonly ContentHtmlElementID = 'InfoBox-Content';
    public static readonly HeaderHtmlElementID = 'InfoBox-Header';
    public static readonly HeaderMessageHtmlElementID = 'InfoBox-HeaderMessage';
    public static readonly BodyHtmlElementID = 'InfoBox-Body';
    public static readonly BodyMessageHtmlElementID = 'InfoBox-BodyMessage';
    public static readonly FooterHtmlElementID = 'InfoBox-Footer';
     
    public static readonly CloseButtonHtmlElementID = 'InfoBox-CloseButton';
    public static readonly OkButtonHtmlElementID = 'InfoBox-OkButton';


    private static zClosed: SignalEvent = new SignalEvent();
    public static get Closed(): ISignalEvent {
        return InformationBox.zClosed.AsEvent();
    }
    private static RootHtmlElement: HTMLElement;
    private static HeaderMessageHtmlElement: HTMLElement;
    private static BodyHtmlElement: HTMLElement;
    private static BodyMessageHtmlElement: HTMLElement;
    private static CloseButtonHtmlElement: HTMLElement;
    private static OkButton: ButtonControl;


    public static Show(message: string, caption?: string): void {
        InformationBox.Intialize();

        InformationBox.BodyMessageHtmlElement.innerHTML = message;

        InformationBox.Caption(caption);
    }

    public static ShowHtml(body: HTMLElement, caption?: string): void {
        InformationBox.Intialize();

        // Remove the the default child.
        InformationBox.BodyHtmlElement.removeChild(InformationBox.BodyHtmlElement.firstChild);

        // Add the new body.
        InformationBox.BodyHtmlElement.appendChild(body);

        InformationBox.Caption(caption);
    }

    private static Intialize(): void {
        InformationBox.BuildHtml();
        InformationBox.WireEvents();
    }

    private static Caption(caption?: string): void {
        if(caption) {
            InformationBox.HeaderMessageHtmlElement.innerHTML = caption;
        }
    }

    public static Hide(): void {
        window.removeEventListener('click', InformationBox.OutsideClick);
        InformationBox.CloseButtonHtmlElement.removeEventListener('click', InformationBox.CloseClick);

        InformationBox.RootHtmlElement.remove();

        this.zClosed.Dispatch();
    }

    private static WireEvents(): void {
        // Listen for the inside close button click.
        InformationBox.CloseButtonHtmlElement.addEventListener('click', InformationBox.CloseClick);

        // Listen for the OK button click.
        InformationBox.OkButton.Click.Subscribe(InformationBox.OkClick);

        // Listen for the outside close click.
        window.addEventListener('click', InformationBox.OutsideClick);
    }

    private static OkClick = () => {
        InformationBox.Hide();
    }

    private static CloseClick = () => {
        InformationBox.Hide();
    }

    private static OutsideClick = (ev: MouseEvent) => {
        if(ev.target === InformationBox.RootHtmlElement) {
            InformationBox.Hide();
        }
    }

    private static BuildHtml(): void {
        // Add the html.
        InformationBox.RootHtmlElement = document.createElement('div');
        document.body.appendChild(InformationBox.RootHtmlElement);
        InformationBox.RootHtmlElement.id = InformationBox.RootHtmlElementID;
        InformationBox.RootHtmlElement.innerHTML += template;

        InformationBox.RootHtmlElement = document.getElementById(InformationBox.RootHtmlElementID);
        InformationBox.HeaderMessageHtmlElement = document.getElementById(InformationBox.HeaderMessageHtmlElementID);
        InformationBox.BodyHtmlElement = document.getElementById(InformationBox.BodyHtmlElementID);
        InformationBox.BodyMessageHtmlElement = document.getElementById(InformationBox.BodyMessageHtmlElementID);
        InformationBox.CloseButtonHtmlElement = document.getElementById(InformationBox.CloseButtonHtmlElementID);
        
        let footer = document.getElementById(InformationBox.FooterHtmlElementID);
        InformationBox.OkButton = new ButtonControl(footer, 'OK', InformationBox.OkButtonHtmlElementID);
    }
}