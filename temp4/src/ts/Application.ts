import * as THREE from "three";

import { AxesTransformControl } from "./Controls/AxesTransformControl";
import { Constants } from "./Constants";
import { ControlPanel } from "./Controls/ControlPanel";
import { OffsetAndScaleControls } from "./Controls/OffsetAndScaleControls";
import { LocalStorageManager } from "./LocalStorageManager";
import { Miniature } from "./Miniature";
import { Theater } from "./Theater";
import { ScratchControl } from "./Controls/ScratchControl";
import { TrackballController } from "./Controllers/TrackballController";
import "three/TransformControls";
import { WebGLDetectorControl } from "./Controls/WebGLDetectorControl";
import { ModesControl } from "./Controls/ModesControl";
import { CoordinateSystemConversion } from "./CoordinateSystemConversion";
import { LoadingBlocker } from "./LoadingBlocker";
import { ModeFactory } from "./Modes/ModeFactory";
import { SetPreferredCoordinateSystemMode } from "./Modes/SetPreferredCoordinateSystemMode";
import { Vector3 } from "three";
import { SetPreferredCameraPositionMode } from "./Modes/SetPreferredCameraPositionMode";


export class Application {
    public static Theater: Theater;
    public static TrackballController: TrackballController;
    public static Miniature: Miniature;
    public static ControlPanel: ControlPanel
    public static ModesControl: ModesControl;
    /**
     * This is the conversion from the standard coordinate system to the preferred coordinate system.
     * 
     * The reference is constant, change by modifying the referenced object.
     */
    public static readonly PreferredCoordinateSystem = new CoordinateSystemConversion();
    public static readonly PreferredCameraPosition = new CoordinateSystemConversion();


    public static Main(): void {
        // Application.SubMain();

        LoadingBlocker.Show();

        Application.Theater = new Theater();
        Application.Theater.AddAxes(); // Add these for now.
        Application.TrackballController = new TrackballController(Application.Theater);
        Application.Miniature = new Miniature(Application.Theater, Constants.ModelsPath, Constants.ObjFileName, Constants.MtlFileName,
            Application.MiniatureLoadingProgressHandler, Application.MiniatureLoadingErrorHandler, Application.MiniatureLoadingFinishedHandler);

        Application.ControlPanel = new ControlPanel();
        Application.ModesControl = new ModesControl(Application.ControlPanel);

        let scratchControl = new ScratchControl(Application.ControlPanel);
        scratchControl.Button.AddOnClickListener(Application.Scratch);

        Application.SetWindowEventHandlers();
    }

    public static ApplyPreferredCameraPosition() {
        Application.Theater.Camera.position.copy(Application.PreferredCameraPosition.Translation);
        Application.Theater.Camera.rotation.setFromVector3(Application.PreferredCameraPosition.Rotation);
    }

    public static ApplyPreferredCoordinateSystem() {
        Application.Theater.Axes.position.set(0, 0, 0);
        Application.Theater.Axes.rotation.set(0, 0, 0);

        Application.Miniature.Mesh.position.copy(Application.PreferredCoordinateSystem.Translation);
        Application.Miniature.Object.rotation.setFromVector3(Application.PreferredCoordinateSystem.Rotation);
    }

    private static MiniatureLoadingProgressHandler = (ev: ProgressEvent) => {
        LoadingBlocker.Message = 'Loading... ' + ((ev.loaded / ev.total) * 100).toFixed(0) + '%';
    }

    private static MiniatureLoadingErrorHandler = (ev: ErrorEvent) => {
        LoadingBlocker.Message = 'Error: ' + ev.message;
    }

    private static MiniatureLoadingFinishedHandler() {
        LoadingBlocker.Hide();

        let preferredCoordinateSystemPreviouslyDefined = LocalStorageManager.PreferredCoordinateSystemExists();
        if (preferredCoordinateSystemPreviouslyDefined) {
            let loaded = LocalStorageManager.LoadPreferredCoordinateSystem();
            Application.PreferredCoordinateSystem.Copy(loaded);

            // Apply the preferred coordinate system.
            Application.ApplyPreferredCoordinateSystem();
        } else {
            // Start in the set preferred coordinate system mode.
            let index = ModeFactory.GetIndexOfModeByModeInfo(SetPreferredCoordinateSystemMode.Info);
            Application.ModesControl.SetSelectedIndex(index);
        }

        let preferredCameraPositionPreviouslyDefined = LocalStorageManager.PreferredCameraPositionExists();
        if(preferredCameraPositionPreviouslyDefined) {
            let loaded = LocalStorageManager.LoadPreferredCameraPosition();
            Application.PreferredCameraPosition.Copy(loaded);

            Application.ApplyPreferredCameraPosition();
        } else {
            // Start in the set preferred camera position mode.
            let index = ModeFactory.GetIndexOfModeByModeInfo(SetPreferredCameraPositionMode.Info);
            Application.ModesControl.SetSelectedIndex(index);
        }
    }

    private static Scratch(ev) {
        // let dbg = Application.Miniature.Geometry;
        // Application.Miniature.Geometry.translate(5, 0, 0);

        // Application.Miniature.Object.position.add(new THREE.Vector3(5, 0, 0));
        // Application.TrackballController.Controls.enabled = !Application.TrackballController.Controls.enabled;

        // let m: THREE.Matrix4 = new THREE.Matrix4();
        // m.set(
        //     1, 0, 0, 5,
        //     0, 1, 0, 0,
        //     0, 0, 1, 0,
        //     0, 0, 0, 1
        // );
        // Application.Miniature.Geometry.applyMatrix(m);

        // console.log('h1');
        // Application.Miniature.Mesh.rotation.setFromVector3(new Vector3(0, 0, 0));
        // Application.Miniature.Object.rotation.setFromVector3(Application.PreferredCoordinateSystem.Rotation);

        // Application.Miniature.Mesh.position.set(3.6, -1, -6);

        // Application.Theater.RenderActions.push(() => {
        //     let r = Application.Miniature.Object.rotation.toVector3();
        //     r.x += 0.05;
        //     // r.y += 0.05;
        //     // r.z += 0.05;
        //     Application.Miniature.Object.rotation.setFromVector3(r);
        // })

        console.log(Application.Theater.Camera.position);
    }

    private static SubMain() {
        Application.Theater = new Theater();
        Application.Theater.AddAxes(); // Add these for now.
        Application.TrackballController = new TrackballController(Application.Theater);
        Application.Miniature = new Miniature(Application.Theater, Constants.ModelsPath, Constants.ObjFileName, Constants.MtlFileName);

        Application.ControlPanel = new ControlPanel();
        let scratchControl = new ScratchControl(Application.ControlPanel);
        scratchControl.Button.AddOnClickListener(Application.Scratch);

        Application.SetWindowEventHandlers();
    }

    private static SetWindowEventHandlers() {
        window.addEventListener('resize', Application.OnWindowResize);
    }

    private static OnWindowResize() {
        Application.Theater.Renderer.setSize(window.innerWidth, window.innerHeight);
        Application.Theater.Camera.aspect = window.innerWidth / window.innerHeight;
        Application.Theater.Camera.updateProjectionMatrix();
    }
}