import { ControlPanel } from "./ControlPanel";



export class WebGLDetectorControl {
    public static readonly HtmlElementId = 'WebGLDetectorControl'


    private readonly HtmlElement: HTMLDivElement;
    public get message(): string {
        let output = this.HtmlElement.innerHTML;
        return output;
    }
    public set message(value: string) {
        this.HtmlElement.innerHTML = value;
    }


    public constructor(controlPanel: ControlPanel) {
        this.HtmlElement = document.createElement('div');
        this.HtmlElement.id = WebGLDetectorControl.HtmlElementId;
        this.HtmlElement.className = ControlPanel.ControlClassName;
        controlPanel.HtmlElement.appendChild(this.HtmlElement);

        // Test for the presence of WebGL.
        let canvas = document.createElement('canvas');
        let gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');

        if (gl && gl instanceof WebGLRenderingContext) {
            this.HtmlElement.innerHTML = 'WebGL Supported';
        } else {
            this.HtmlElement.innerHTML = '!!! No WebGL !!!';
        }
    }
}