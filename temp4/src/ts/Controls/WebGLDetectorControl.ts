import { ControlPanel } from "./ControlPanel";



export class WebGLDetectorControl {
    public static readonly HtmlElementId = 'WebGLDetectorControl'
    public static readonly OutputParagraphHtmlElementId = 'WebGLDetectorControl-OutputParagraph'


    private readonly zHtmlElement: HTMLDivElement;
    public get HtmlElement() : HTMLDivElement {
        return this.zHtmlElement;
    }
    private readonly zOutputParagraphHtmlElement: HTMLDivElement;
    public get OutputParagraphHtmlElement() {
        return this.zOutputParagraphHtmlElement;
    }
    public get message(): string {
        let output = this.zHtmlElement.innerHTML;
        return output;
    }
    public set message(value: string) {
        this.zHtmlElement.innerHTML = value;
    }


    public constructor(parentHtmlElement: HTMLElement) {
        this.zHtmlElement = document.createElement('div');
        this.zHtmlElement.id = WebGLDetectorControl.HtmlElementId;
        this.zHtmlElement.className = ControlPanel.ControlClassName;
        parentHtmlElement.appendChild(this.zHtmlElement);

        this.zOutputParagraphHtmlElement = document.createElement('div');
        this.zOutputParagraphHtmlElement.id = WebGLDetectorControl.OutputParagraphHtmlElementId;
        this.zHtmlElement.appendChild(this.zOutputParagraphHtmlElement);        

        // Test for the presence of WebGL.
        let canvas = document.createElement('canvas');
        let gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');

        let webGLTestResult: string;
        if (gl && gl instanceof WebGLRenderingContext) {
            webGLTestResult = 'Supported';
        } else {
            webGLTestResult = '!!! Not Supported !!!';
        }
        this.zOutputParagraphHtmlElement.innerHTML = 'WebGL: ' + webGLTestResult;
    }
}