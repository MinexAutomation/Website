import { ControlPanel } from "./ControlPanel";
import { ButtonControl } from "./ButtonControl";


export class ScratchControl {
    public static readonly HtmlElementID = 'ScratchControl'
    public static readonly ButtonHtmlElementID = 'ScratchControl-Button'


    private readonly HtmlElement: HTMLDivElement;
    public get message(): string {
        let output = this.HtmlElement.innerHTML;
        return output;
    }
    public set message(value: string) {
        this.HtmlElement.innerHTML = value;
    }
    private readonly zButton: ButtonControl;
    public get Button() : ButtonControl {
        return this.zButton;
    }


    public constructor(controlPanel: ControlPanel) {
        this.HtmlElement = document.createElement('div');
        controlPanel.HtmlElement.appendChild(this.HtmlElement);
        this.HtmlElement.id = ScratchControl.HtmlElementID;
        this.HtmlElement.className = ControlPanel.ControlClassName;

        let title = document.createElement('p');
        this.HtmlElement.appendChild(title);
        title.className = ControlPanel.ControlTitleClassName;
        title.innerHTML = 'Scratch';

        this.zButton = new ButtonControl(this.HtmlElement, 'Button', ScratchControl.ButtonHtmlElementID);
    }
}