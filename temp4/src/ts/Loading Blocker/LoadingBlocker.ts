import { Utilities } from "../ts/Utilities";


export class LoadingBlocker {
    public static readonly htmlElementId = 'LoadingBlocker';


    private readonly htmlElement: HTMLDivElement;
    public get message(): string {
        let output = this.htmlElement.innerHTML;
        return output;
    }
    public set message(value: string) {
        this.htmlElement.innerHTML = value;
    }
    private readonly style: HTMLStyleElement;
    private readonly styleSheet: CSSStyleSheet;


    public constructor() {
        this.htmlElement = document.createElement('div');
        this.htmlElement.id = LoadingBlocker.htmlElementId;
        document.body.appendChild(this.htmlElement);

        this.style = document.createElement('style');
        document.head.appendChild(this.style);
        this.styleSheet = <CSSStyleSheet>this.style.sheet;

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
        this.styleSheet.addRule('#' + LoadingBlocker.htmlElementId, rule);
    }

    public remove(): void {
        document.head.removeChild(this.style);
        document.body.removeChild(this.htmlElement);
    }
}