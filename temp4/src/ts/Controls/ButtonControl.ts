import { IEvent, Event } from "../Common/Events/Event";


export class ButtonControl {
    public static readonly ButtonCssClassName = 'ButtonControl';


    public static StaticConstructor() {
        ButtonControl.AddCssRules();
    }

    private static AddCssRules() {
        let style = document.createElement('style');
        document.head.appendChild(style);
        let styleSheet = <CSSStyleSheet>style.sheet;

        let rule: string;

        rule = `
        height: 25px;
        line-height: 25px;

        display: table;
        margin: 0 auto;

        border: 1px solid black;
        border-radius: 11px;
        margin-bottom: 2px;

        text-align: center;
    
        padding-left: 10px;
        padding-right: 10px;

        user-select: none;
        `;
        styleSheet.addRule('.' + ButtonControl.ButtonCssClassName, rule);
    }


    private readonly zHtmlElement: HTMLDivElement;
    public get HtmlElement(): HTMLDivElement {
        return this.zHtmlElement;
    }
    public get Text(): string {
        return this.zHtmlElement.innerHTML;
    }
    public set Text(value: string) {
        this.zHtmlElement.innerHTML = value;
    }
    private zEnabled: boolean;
    public get Enabled(): boolean {
        return this.zEnabled;
    }
    public set Enabled(value: boolean) {
        this.zEnabled = value;

        if (this.zEnabled) {
            this.AddListeners();

            this.zHtmlElement.style.opacity = '1';
        } else {
            this.RemoveListeners();

            this.zHtmlElement.style.opacity = '0.3';
        }
    }
    public Enable(): void {
        this.Enabled = true;
    }
    public Disable(): void {
        this.Enabled = false;
    }
    private zClick = new Event<ButtonControl, MouseEvent>();
    public get Click(): IEvent<ButtonControl, MouseEvent> {
        return this.zClick.AsEvent();
    }


    public constructor(parent?: HTMLElement, text?: string, id?: string) {
        this.zHtmlElement = document.createElement('div');
        this.zHtmlElement.className = ButtonControl.ButtonCssClassName;
        if (text !== undefined) {
            this.zHtmlElement.innerHTML = text;
        }
        if (id !== undefined) {
            this.zHtmlElement.id = id;
        }

        if (parent) {
            parent.appendChild(this.HtmlElement);
        }

        this.Enable();
    }

    private AddListeners(): void {
        this.zHtmlElement.addEventListener('mouseover', this.OnMouseOver);
        this.zHtmlElement.addEventListener('mouseleave', this.OnMouseLeave)
        this.zHtmlElement.addEventListener('click', this.OnClick);
    }

    private RemoveListeners(): void {
        this.zHtmlElement.removeEventListener('mouseover', this.OnMouseOver);
        this.zHtmlElement.removeEventListener('mouseleave', this.OnMouseLeave)
        this.zHtmlElement.removeEventListener('click', this.OnClick);
    }

    private OnMouseOver = () => {
        this.zHtmlElement.style.backgroundColor = 'LightGray';
    }

    private OnMouseLeave = () => {
        this.zHtmlElement.style.backgroundColor = 'inherit';
    }

    private OnClick = (ev: MouseEvent) => {
        this.zHtmlElement.style.backgroundColor = 'DarkGray';
        setTimeout(() => {
            this.zHtmlElement.style.backgroundColor = 'inherit';
        }, 1000);

        this.zClick.Dispatch(this, ev);
    }
}
ButtonControl.StaticConstructor();