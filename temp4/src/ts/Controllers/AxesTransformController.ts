import * as THREE from 'three';
import 'three/TransformControls';

import { Theater } from "../Theater";


export class AxesTransformController {
    public static readonly InstructionsHtmlElementId = 'AxesTransformControl-Instructions';


    public Controls: THREE.TransformControls;
    private Style: HTMLStyleElement;
    private StyleSheet: CSSStyleSheet;


    public constructor(theater: Theater) {
        this.Controls = new THREE.TransformControls(theater.Camera, theater.OutputHtmlElement);

        theater.Scene.add(this.Controls);

        theater.RenderActions.push(this.Update);
    }

    private AddInstructions() {
        let instructions = document.createElement('div');
        instructions.id = AxesTransformController.InstructionsHtmlElementId;
        instructions.innerHTML = `
        "T" translate | "R" rotate<br />
        Press "Q" to toggle world/local space, keep "Ctrl" down to snap to grid
        `;
        document.body.appendChild(instructions);

        this.Style = document.createElement('style');
        document.head.appendChild(this.Style);

        this.StyleSheet = <CSSStyleSheet>this.Style.sheet;

        let rule: string;
        rule = `
        position: absolute;
        bottom: 5%;
        width: 100%;
        text-align: center;
        padding: 15px;
        z-index:100;
        `;
        this.StyleSheet.addRule('#' + AxesTransformController.InstructionsHtmlElementId, rule);
    }

    private RemoveInstructions() {
        let instructions = document.getElementById(AxesTransformController.InstructionsHtmlElementId);
        if (null !== instructions) {
            instructions.remove();
        }
    }

    public Attach(object: THREE.Object3D) {
        this.Controls.attach(object);

        window.addEventListener('keydown', this.OnKeyDown);
        window.addEventListener('keyup', this.OnKeyUp);

        this.AddInstructions();
    }

    public Detach() {
        this.Controls.detach();

        window.removeEventListener('keydown', this.OnKeyDown);
        window.removeEventListener('keyup', this.OnKeyUp);

        this.RemoveInstructions();
    }

    private Update = () => {
        this.Controls.update();
    }

    private OnKeyDown = (event: KeyboardEvent) => {
        switch (event.keyCode) {
            case 81: // Q
                this.Controls.setSpace((<any>this.Controls).space === "local" ? "world" : "local");
                break;

            case 17: // Ctrl
                (<any>this.Controls).setTranslationSnap(100);
                (<any>this.Controls).setRotationSnap(THREE.Math.degToRad(15));
                break;

            case 84: // T
                this.Controls.setMode("translate");
                break;

            case 82: // R
                this.Controls.setMode("rotate");
                break;
        }
    }

    private OnKeyUp = (event: KeyboardEvent) => {
        switch (event.keyCode) {
            case 17: // Ctrl
                (<any>this.Controls).setTranslationSnap(null);
                (<any>this.Controls).setRotationSnap(null);
                break;
        }
    }
}