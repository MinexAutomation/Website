import { SimpleEvent, ISimpleEvent } from "../Events/SimpleEvent";
import { ButtonControl } from "../../Controls/ButtonControl";


type EditorBoxResultAction = 'Accept' | 'Cancel';

export class EditorBoxResult<T> {
    public constructor(public readonly Action: EditorBoxResultAction, public readonly Instance: T) {}
}

/**
 * A user interface that allows editing instances of a generic type. To use: construct a new instance, providing a clone instance of an object instance of interest, subscribe to the Closed() event, then build out the body HTML element, and finally call Show(). Be sure to subscribe to the Closed() event before calling Show() to handle the result of the message box.
 * 
 * The UI elements for editing the specific properties of the generic type can be added either by building on the publically exposed body HTML element in the client, or by sub-classing the editor and specifying the generic type.
 * 
 * Instead of using static functionality, instance functionality is used for the editor. This allows an editor of an object to create a separate editor for a property of its object, even if the property is of the same type as the object. This editor-within-an-editor capability could have been provided using static functionality, but at much higher complexity to the client.
 * 
 * In the constructor, provide an instance of the generic type for the editor to act upon.
 * Generally, this is a clone of the instanceof interest that, after editing, will be copied back into the original instance of interest. This allows easy handling of the cancel result. An alternative would be to create a clone of the instance of interest before providing it to the editor. In the case of cancellation, the clone of the initial state is copied back into the instance of interest. This alternative is not recommended since the instance of interest might have listeners attached to property changes. If changes are made, then reverted back, that is twice the effort. Also, invalid changes might be made that cause program errors. Better to only alert listerns in the event the changes made in the editor are accepted.
 * 
 * After constructing, build out the body HTML element, providing elements to alter the properties of the instance being edited. The instance is itself publically accessible so HTML elements created in the client can access it.
 * 
 * The editor must have Show() called to be visually shown to the user. The Hide() function can be called to visually hide the editor from the user without closing it. This is useful in allowing editors to be hidden without having to dispose and then re-construct the editor.
 * 
 * The editor can only be closed by selecting between the options 'Accept' or 'Cancel'. This closing disposes of the editor. After being closed, the editor cannot be reshown.
 */
export class EditorBox<T> {
    // The payload instance.
    protected zInstance: T;
    public get Instance(): T {
        return this.zInstance;
    }
    public set Instance(value: T) {
        this.zInstance = value;
    }

    // Closed event.
    protected zClosed = new SimpleEvent<EditorBoxResult<T>>();
    public get Closed(): ISimpleEvent<EditorBoxResult<T>> {
        return this.zClosed.AsEvent();
    }

    // Disposing.
    private IsDisposed: boolean = false;
    public Dispose(action: EditorBoxResultAction): void {
        if(this.IsDisposed) {
            return;
        }

        this.RootHtmlElement.remove();
        this.Style.remove();

        let result = new EditorBoxResult<T>(action, this.zInstance);
        this.zClosed.Dispatch(result);
    }

    /**
     * Allow clients to programmatically close the editor specifying whether to accept or cancel changes.
     * 
     * Has the same effect as calling Dispose().
     */
    public Close(action: EditorBoxResultAction): void {
        this.Dispose(action);
    }

    // Visual presentation.
    public Show(): void {
        this.RootHtmlElement.style.display = 'block';
    }

    public Hide(): void {
        this.RootHtmlElement.style.display = 'none';
    }

    // HTML, CSS, and events.
    public static readonly RootHtmlClassName = 'EditorBox-Root';
    public static readonly ContentHtmlClassName = 'EditorBox-Content';
    public static readonly HeaderHtmlClassName = 'EditorBox-Header';
    public static readonly BodyHtmlClassName = 'EditorBox-Body';
    public static readonly FooterHtmlClassName = 'EditorBox-Footer';


    // Style information for the CSS classes is setup statically by the editor box common style helper class. Use these instance-level fields for custom styles related to the specific type for the editor.
    protected Style: HTMLStyleElement;
    protected StyleSheet: CSSStyleSheet;


    protected RootHtmlElement: HTMLElement;
    protected HeaderMessageHtmlElement: HTMLElement;
    protected zBodyHtmlElement: HTMLElement;    
    public get BodyHtmlElement(): HTMLElement {
        return this.zBodyHtmlElement;
    }
    protected AcceptButton: ButtonControl;
    protected CancelButton: ButtonControl;


    public constructor(instance: T, caption?: string) {
        this.zInstance = instance;

        this.Initialize();

        this.Caption(caption);
    }

    protected Initialize(): void {
        this.BuildHtml();
        this.BuildCss();
    }

    protected BuildHtml(): void {
        this.RootHtmlElement = document.createElement('div');
        document.body.appendChild(this.RootHtmlElement);
        this.RootHtmlElement.className = EditorBox.RootHtmlClassName;

        let content = document.createElement('div');
        this.RootHtmlElement.appendChild(content);
        content.className = EditorBox.ContentHtmlClassName;

        let header = document.createElement('div');
        content.appendChild(header);
        header.className = EditorBox.HeaderHtmlClassName;

        this.HeaderMessageHtmlElement = document.createElement('h2');
        header.appendChild(this.HeaderMessageHtmlElement);

        this.zBodyHtmlElement = document.createElement('div');
        content.appendChild(this.zBodyHtmlElement);
        this.zBodyHtmlElement.className = EditorBox.BodyHtmlClassName;

        let footer = document.createElement('div');
        content.appendChild(footer);
        footer.className = EditorBox.FooterHtmlClassName;

        // Buttons.
        let ul = document.createElement('ul');
        footer.appendChild(ul);
        ul.style.listStyleType = 'none';
        ul.style.margin = '0';
        ul.style.padding = '0';
        ul.style.overflow = 'hidden';

        let liAccept = document.createElement('li');
        ul.appendChild(liAccept);
        liAccept.style.cssFloat = 'right';
        liAccept.style.padding = '0px 2px'

        this.AcceptButton = new ButtonControl(liAccept, 'Accept');
        this.AcceptButton.Click.Subscribe(this.AcceptClick);

        let liCancel = document.createElement('li');
        ul.appendChild(liCancel);
        liCancel.style.cssFloat = 'right';
        liCancel.style.padding = '0px 2px'

        this.CancelButton = new ButtonControl(liCancel, 'Cancel');
        this.CancelButton.Click.Subscribe(this.CancelClick);
    }

    protected BuildCss(): void {
        this.Style = document.createElement('style');
        document.head.appendChild(this.Style);

        this.StyleSheet = <CSSStyleSheet>this.Style.sheet;
    }

    private Caption(caption?: string): void {
        if (caption) {
            this.HeaderMessageHtmlElement.innerHTML = caption;
        }
    }

    protected AcceptClick = () => {
        this.Dispose('Accept');
    }

    protected CancelClick = () => {
        this.Dispose('Cancel');
    }
}

/**
 * A non-generic class that setups up the CSS rules for the classes in the editor box.
 */
class EditorBoxCommonStyle {
    private static Style: HTMLStyleElement;
    private static StyleSheet: CSSStyleSheet;


    public static StaticConstructor():void {
        EditorBoxCommonStyle.BuildCss();
    }

    private static BuildCss(): void {
        EditorBoxCommonStyle.Style = document.createElement('style');
        document.head.appendChild(EditorBoxCommonStyle.Style);

        EditorBoxCommonStyle.StyleSheet = <CSSStyleSheet>EditorBoxCommonStyle.Style.sheet;

        let rule: string;

        rule = `
        display: none;
        position: fixed;
        z-index: 1;
        left: 0;
        top: 0;
        height: 100%;
        width: 100%;
        overflow: auto;
        background-color: rgba(0, 0, 0, 0.5);
        `;
        EditorBoxCommonStyle.StyleSheet.addRule('.' + EditorBox.RootHtmlClassName, rule);

        rule = `
        background-color: #f4f4f4;
        margin: 20% auto;
        width: 70%;
        box-shadow: 0 5px 8px 0 rgba(0, 0, 0, 0.2), 0 7px 20px 0 rgba(0, 0, 0, 0.17);

        animation-name: modalOpen;
        animation-duration: 1s;
        `;
        EditorBoxCommonStyle.StyleSheet.addRule('.' + EditorBox.ContentHtmlClassName, rule);

        rule = `
        background: coral;
        padding: 15px;
        color: white;
        `;
        EditorBoxCommonStyle.StyleSheet.addRule('.' + EditorBox.HeaderHtmlClassName, rule);

        rule = `
        margin: 0;
        `;
        EditorBoxCommonStyle.StyleSheet.addRule('.' + EditorBox.HeaderHtmlClassName + ' h2', rule);

        rule = `
        padding: 10px 20px;
        `;
        EditorBoxCommonStyle.StyleSheet.addRule('.' + EditorBox.BodyHtmlClassName, rule);

        rule = `
        background: coral;
        padding: 10px;
        color: white;
        text-align: center;
        overflow: auto;
        `;
        EditorBoxCommonStyle.StyleSheet.addRule('.' + EditorBox.FooterHtmlClassName, rule);
    }
}
EditorBoxCommonStyle.StaticConstructor();