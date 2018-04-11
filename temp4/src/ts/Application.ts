import * as THREE from "three";

import { Constants } from "./Constants";
import { ControlPanel } from "./Controls/ControlPanel";
import { Miniature } from "./Miniature";
import { Theater } from "./Theater";
import { TrackballController } from "./TrackballController";
import { WebGLDetectorControl } from "./Controls/WebGLDetectorControl";


export class Application {
    public static Theater: Theater;
    public static TrackballController: TrackballController;
    public static Miniatures: Array<Miniature> = [];
    public static ControlPanel: ControlPanel


    public static Main() : void {
        Application.SubMain();

        // Application.Theater = new Theater();
        // Application.Theater.AddAxes(); // Add these for now.
        // Application.TrackballController = new TrackballController(Application.Theater);
        // Application.ControlPanel = new ControlPanel();
        // let webGLDetectorControl = new WebGLDetectorControl(Application.ControlPanel);
        // console.log('here!');
        // // Application.Theater.Axes.position.add(new THREE.Vector3(1, 0, 0));
    }

    private static SubMain() {
        Application.Theater = new Theater();
        Application.Theater.AddAxes(); // Add these for now.
        Application.TrackballController = new TrackballController(Application.Theater);
        Application.Miniatures.push(
            new Miniature(Application.Theater, Constants.ModelsPath, Constants.ObjFileName, Constants.MtlFileName)
        );

        Application.SetWindowEventHandlers();
    }

    private static SetWindowEventHandlers() {
        window.addEventListener('resize', Application.OnWindowResize);
    }

    private static OnWindowResize() {
        this.Theater.Renderer.setSize(window.innerWidth, window.innerHeight);
        this.Theater.Camera.aspect = window.innerWidth / window.innerHeight;
        this.Theater.Camera.updateProjectionMatrix();
    }
}