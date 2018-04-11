export class ControlPanel {
    public static readonly HtmlElementId = 'ControlPanel';
    public static readonly ControlClassName = 'Control';


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
        // rule = `
        // display: inline-block;
        // float: left;
        // clear: left;

        // position: relative;
        // top: 50px; /* Clear the FPS counter. */

        // font-size: 12px;
        // `;
        // this.StyleSheet.addRule('#' + ControlPanel.HtmlElementId, rule);

        // rule = `
        // margin: 0;

        // padding-top: 5px;
        // padding-bottom: 5px;

        // text-align: center;
        // `;
        // this.StyleSheet.addRule('.' + ControlPanel.ControlClassName + ' p', rule);

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
    }
}