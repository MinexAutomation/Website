import * as THREE from "three";

import { Constants } from "./Constants";


export class Theater {
    public static readonly OutputHtmlElementId = 'WebGL-Output';


    public Scene: THREE.Scene;
    public Camera: THREE.PerspectiveCamera;
    public Renderer: THREE.WebGLRenderer;
    public OutputHtmlElement: HTMLDivElement;
    public Axes: THREE.AxesHelper;
    public RenderActions: Array<() => void> = [];


    public constructor() {
        this.Scene = new THREE.Scene();

        this.Camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.Camera.position.set(Constants.ModestDistance, Constants.ModestDistance, Constants.ModestDistance);
        this.Camera.lookAt(0, 0, 0);
        this.Scene.add(this.Camera);

        this.Renderer = new THREE.WebGLRenderer();
        this.Renderer.setClearColor(0xffffff);
        this.Renderer.setSize(window.innerWidth, window.innerHeight);

        // Create an HTML element to parent the renderer output.
        this.OutputHtmlElement = document.createElement('div');
        this.OutputHtmlElement.id = Theater.OutputHtmlElementId;
        document.body.appendChild(this.OutputHtmlElement);
        // Append the renderer output to its parent.
        this.OutputHtmlElement.appendChild(this.Renderer.domElement);

        this.Render();
    }

    private Render() {
        // Perform all actions required for rendering.
        this.RenderActions.forEach(action => {
            action();
        });

        requestAnimationFrame(() => { this.Render(); });
        this.Renderer.render(this.Scene, this.Camera);
    }

    public AddAxes() {
        this.Axes = new THREE.AxesHelper(Constants.ModestDistance);
        this.Scene.add(this.Axes);
    }
}