export class ControlPanel {
    public static readonly HtmlElementId = 'ControlPanel';
    public static readonly ControlClassName = 'Control';
    public static readonly ControlTitleClassName = 'ControlTitle';
    public static readonly ControlButtonClassName = 'ControlButton';


    private readonly zHtmlElement: HTMLDivElement;
    public get HtmlElement() {
        return this.zHtmlElement;
    }
    public get message(): string {
        let output = this.zHtmlElement.innerHTML;
        return output;
    }
    public set message(value: string) {
        this.zHtmlElement.innerHTML = value;
    }
    private readonly Style: HTMLStyleElement;
    private readonly StyleSheet: CSSStyleSheet;


    public constructor() {
        this.zHtmlElement = document.createElement('div');
        this.zHtmlElement.id = ControlPanel.HtmlElementId;
        document.body.appendChild(this.zHtmlElement);

        this.Style = document.createElement('style');
        document.head.appendChild(this.Style);
        this.StyleSheet = <CSSStyleSheet>this.Style.sheet;

        this.AddCssRules();
    }

    private AddCssRules(): void {
        let rule: string;

        rule = `
        float: left;

        position: absolute;
        top: 50px;`;
        this.StyleSheet.addRule('#' + ControlPanel.HtmlElementId, rule);

        rule = `
        margin: 0;

        border: 1px solid #ccc;

        padding-top: 5px;
        padding-bottom: 5px;
    
        text-align: center;

        color: black;
        `;
        this.StyleSheet.addRule('.' + ControlPanel.ControlClassName, rule);

        rule = `
        margin: 0;

        margin-bottom: 5px;
    
        user-select: none;
        `;
        this.StyleSheet.addRule('.' + ControlPanel.ControlTitleClassName, rule);

        // rule = `
        // height: 25px;
        // line-height: 25px;

        // display: table;
        // margin: 0 auto;

        // border: 1px solid black;
        // border-radius: 11px;
        // margin-bottom: 2px;

        // text-align: center;
    
        // padding-left: 10px;
        // padding-right: 10px;

        // user-select: none;
        // `;
        // this.StyleSheet.addRule('.' + ControlPanel.ControlButtonClassName, rule);
    }

    public CreateChildControlElement(htmlElementID: string): HTMLElement {
        let output = document.createElement('div');
        this.HtmlElement.appendChild(output);
        output.id = htmlElementID;
        output.className = ControlPanel.ControlClassName;

        return output;
    }

    public CreateChildControlTitle(childControlHtmlElement: HTMLElement, value: string): HTMLElement {
        let output = document.createElement('p');
        childControlHtmlElement.appendChild(output);
        output.className = ControlPanel.ControlTitleClassName;
        output.innerHTML = value;

        return output;
    }
}