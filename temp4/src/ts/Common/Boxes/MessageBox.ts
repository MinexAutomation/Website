import { SimpleEvent, ISimpleEvent } from "../Events/SimpleEvent";
import { ButtonControl } from "../../Controls/ButtonControl";

export type DialogResult = 'Abort' | 'Cancel' | 'Ignore' | 'No' | 'None' | 'Ok' | 'Retry' | 'Yes';
export type MessageBoxButtons = 'AbortRetryIgnore' | 'Ok' | 'OkCancel' | 'RetryCancel' | 'YesNo' | 'YesNoCancel';


/**
 * Shows messages and allows a user to choose from amoung several options based on the message using static functionality. Subscribe to the Closed() event before calling Show() to handle the result of the message box.
 * 
 * The result of the message box is returned as an argument to the Closed() event.
 * 
 * There is no way to close the message box other than clicking one of the message box buttons specified as an argument to Show() (well, outside code could call the public Hide() function with a specified result.).
 */
export class MessageBox {
    public static readonly RootHtmlElementID = 'MessageBox-Root';
    public static readonly ContentHtmlElementID = 'MessageBox-Content';
    public static readonly HeaderHtmlElementID = 'MessageBox-Header';
    public static readonly BodyHtmlElementID = 'MessageBox-Body';
    public static readonly FooterHtmlElementID = 'MessageBox-Footer';


    private static zClosed: SimpleEvent<DialogResult> = new SimpleEvent<DialogResult>();
    public static get Closed(): ISimpleEvent<DialogResult> {
        return MessageBox.zClosed.AsEvent();
    }
    private static RootHtmlElement: HTMLElement;
    private static HeaderMessageHtmlElement: HTMLElement;
    private static BodyHtmlElement: HTMLElement;
    private static BodyMessageHtmlElement: HTMLElement;
    private static Style: HTMLStyleElement;
    private static StyleSheet: CSSStyleSheet;


    public static Show(message: string, caption?: string, buttons: MessageBoxButtons = 'Ok'): void {
        MessageBox.Intialize(buttons);

        MessageBox.BodyMessageHtmlElement.innerHTML = message;

        MessageBox.Caption(caption);
    }

    public static ShowHtml(body: HTMLElement, caption?: string, buttons: MessageBoxButtons = 'Ok'): void {
        MessageBox.Intialize(buttons);

        // Remove the the default child.
        MessageBox.BodyHtmlElement.removeChild(MessageBox.BodyHtmlElement.firstChild);

        // Add the new body.
        MessageBox.BodyHtmlElement.appendChild(body);

        MessageBox.Caption(caption);
    }

    private static Intialize(buttons: MessageBoxButtons): void {
        MessageBox.BuildHtml(buttons);
        MessageBox.BuildCss();
    }

    private static Caption(caption?: string): void {
        if (caption) {
            MessageBox.HeaderMessageHtmlElement.innerHTML = caption;
        }
    }

    public static Hide(result: DialogResult): void {
        MessageBox.RootHtmlElement.remove();
        MessageBox.Style.remove();

        this.zClosed.Dispatch(result);
    }

    private static BuildCss(): void {
        MessageBox.Style = document.createElement('style');
        document.head.appendChild(MessageBox.Style);

        MessageBox.StyleSheet = <CSSStyleSheet>MessageBox.Style.sheet;

        let rule: string;

        rule = `
        display: block;
        position: fixed;
        z-index: 1;
        left: 0;
        top: 0;
        height: 100%;
        width: 100%;
        overflow: auto;
        background-color: rgba(0, 0, 0, 0.5);
        `;
        MessageBox.StyleSheet.addRule('#' + MessageBox.RootHtmlElementID, rule);

        rule = `
        background-color: #f4f4f4;
        margin: 20% auto;
        width: 70%;
        box-shadow: 0 5px 8px 0 rgba(0, 0, 0, 0.2), 0 7px 20px 0 rgba(0, 0, 0, 0.17);

        animation-name: modalOpen;
        animation-duration: 1s;
        `;
        MessageBox.StyleSheet.addRule('#' + MessageBox.ContentHtmlElementID, rule);

        rule = `
        background: coral;
        padding: 15px;
        color: white;
        `;
        MessageBox.StyleSheet.addRule('#' + MessageBox.HeaderHtmlElementID, rule);

        rule = `
        margin: 0;
        `;
        MessageBox.StyleSheet.addRule('#' + MessageBox.HeaderHtmlElementID + ' h2', rule);

        rule = `
        padding: 10px 20px;
        `;
        MessageBox.StyleSheet.addRule('#' + MessageBox.BodyHtmlElementID, rule);

        rule = `
        background: coral;
        padding: 10px;
        color: white;
        text-align: center;
        overflow: auto;
        `;
        MessageBox.StyleSheet.addRule('#' + MessageBox.FooterHtmlElementID, rule);
    }

    private static BuildHtml(buttons: MessageBoxButtons): void {
        MessageBox.RootHtmlElement = document.createElement('div');
        document.body.appendChild(MessageBox.RootHtmlElement);
        MessageBox.RootHtmlElement.id = MessageBox.RootHtmlElementID;

        let content = document.createElement('div');
        MessageBox.RootHtmlElement.appendChild(content);
        content.id = MessageBox.ContentHtmlElementID;

        let header = document.createElement('div');
        content.appendChild(header);
        header.id = MessageBox.HeaderHtmlElementID;

        MessageBox.HeaderMessageHtmlElement = document.createElement('h2');
        header.appendChild(MessageBox.HeaderMessageHtmlElement);

        MessageBox.BodyHtmlElement = document.createElement('div');
        content.appendChild(MessageBox.BodyHtmlElement);
        MessageBox.BodyHtmlElement.id = MessageBox.BodyHtmlElementID;

        MessageBox.BodyMessageHtmlElement = document.createElement('p');
        MessageBox.BodyHtmlElement.appendChild(MessageBox.BodyMessageHtmlElement);

        let footer = document.createElement('div');
        content.appendChild(footer);
        footer.id = MessageBox.FooterHtmlElementID;

        // Buttons.
        let ul = document.createElement('ul');
        footer.appendChild(ul);
        ul.style.listStyleType = 'none';
        ul.style.margin = '0';
        ul.style.padding = '0';
        ul.style.overflow = 'hidden';
        // ul.style.backgroundColor = '#333';

        let buttonControls = MessageBox.GetButtons(buttons);
        buttonControls.forEach(buttonControl => {
            let li = document.createElement('li');
            ul.appendChild(li);
            li.style.cssFloat = 'right';
            li.style.padding = '0px 2px'

            li.appendChild(buttonControl.HtmlElement);
        });
    }

    private static GetButtons(buttons: MessageBoxButtons): ButtonControl[] {
        let output: ButtonControl[] = [];

        let abortButton = new ButtonControl(undefined, 'Abort');
        abortButton.Click.Subscribe(MessageBox.AbortClick);

        let cancelButton = new ButtonControl(undefined, 'Cancel');
        cancelButton.Click.Subscribe(MessageBox.CancelClick);

        let ignoreButton: ButtonControl = new ButtonControl(undefined, 'Ignore');
        ignoreButton.Click.Subscribe(MessageBox.IgnoreClick);

        let noButton = new ButtonControl(undefined, 'No');
        noButton.Click.Subscribe(MessageBox.NoClick);

        let okButton = new ButtonControl(undefined, 'Ok');
        okButton.Click.Subscribe(MessageBox.OkClick);

        let retryButton = new ButtonControl(undefined, 'Retry');
        retryButton.Click.Subscribe(MessageBox.RetryClick);

        let yesButton = new ButtonControl(undefined, 'Yes');
        yesButton.Click.Subscribe(MessageBox.YesClick);

        switch (buttons) {
            case 'AbortRetryIgnore':
                output.push(abortButton);
                output.push(retryButton);
                output.push(ignoreButton);
                break;

            case 'OkCancel':
                output.push(okButton);
                output.push(cancelButton);
                break;

            case 'RetryCancel':
                output.push(retryButton);
                output.push(cancelButton);
                break;

            case 'YesNo':
                output.push(yesButton);
                output.push(noButton);
                break;

            case 'YesNoCancel':
                output.push(yesButton);
                output.push(noButton);
                output.push(cancelButton);
                break;

            case 'Ok':
            default:
                output.push(okButton);
                break;
        }

        return output;
    }

    private static AbortClick = () => {
        MessageBox.Hide('Abort');
    }

    private static CancelClick = () => {
        MessageBox.Hide('Cancel');
    }

    private static IgnoreClick = () => {
        MessageBox.Hide('Ignore');
    }

    private static NoClick = () => {
        MessageBox.Hide('No');
    }

    private static OkClick = () => {
        MessageBox.Hide('Ok');
    }

    private static RetryClick = () => {
        MessageBox.Hide('Retry');
    }

    private static YesClick = () => {
        MessageBox.Hide('Yes');
    }
}