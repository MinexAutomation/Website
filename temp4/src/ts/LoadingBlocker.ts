

export class LoadingBlocker {
    public static readonly HtmlElementId = 'LoadingBlocker';


    private static HtmlElement: HTMLDivElement;
    public static get Message(): string {
        let output = LoadingBlocker.HtmlElement.innerHTML;
        return output;
    }
    public static set Message(value: string) {
        LoadingBlocker.HtmlElement.innerHTML = value;
    }
    private static Style: HTMLStyleElement;
    private static StyleSheet: CSSStyleSheet;


    public static Show() {
        LoadingBlocker.HtmlElement = document.createElement('div');
        LoadingBlocker.HtmlElement.id = LoadingBlocker.HtmlElementId;
        document.body.appendChild(LoadingBlocker.HtmlElement);

        LoadingBlocker.Style = document.createElement('style');
        document.head.appendChild(LoadingBlocker.Style);
        LoadingBlocker.StyleSheet = <CSSStyleSheet>LoadingBlocker.Style.sheet;

        let rule = `
        display: block;
        position: fixed;
        left: 0;
        top: 0;
        width: 100%;
        height: 100%;
        overflow: auto;
        z-index: 1;

        font-family: Arial, Helvetica, sans-serif;
        font-size: 40px;
        line-height: 1.6;

        color: black;
        background-color: rgba(0, 0, 0, 0.5);

        text-align: center;

        user-select: none;
        `;
        LoadingBlocker.StyleSheet.addRule('#' + LoadingBlocker.HtmlElementId, rule);
    }

    public static Hide(): void {
        document.head.removeChild(LoadingBlocker.Style);
        document.body.removeChild(LoadingBlocker.HtmlElement);
    }
}