import { ControlPanel } from "./ControlPanel";
import { ButtonControl } from "./ButtonControl";


export class ScratchControl {
    public static readonly HtmlElementId = 'ScratchControl'
    public static readonly ButtonHtmlElementId = 'ScratchControl-Button'


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
        this.HtmlElement.id = ScratchControl.HtmlElementId;
        this.HtmlElement.className = ControlPanel.ControlClassName;
        controlPanel.HtmlElement.appendChild(this.HtmlElement);

        let title = document.createElement('p');
        title.className = ControlPanel.ControlTitleClassName;
        title.innerHTML = 'Scratch';
        this.HtmlElement.appendChild(title);

        this.zButton = new ButtonControl(this.HtmlElement, 'Button', ScratchControl.ButtonHtmlElementId);
    }
}