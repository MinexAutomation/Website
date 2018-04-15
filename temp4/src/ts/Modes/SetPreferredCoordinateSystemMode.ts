import * as THREE from "three";
import * as wDatGui from "dat.gui";
const dat = (<any>wDatGui).default; // Workaround.

import { Application } from "../Application";
import { AxesTransformControl } from "../Controls/AxesTransformControl";
import { ControlPanel } from "../Controls/ControlPanel";
import { ModeInfo, IMode } from "./Mode";
import { LocalStorageManager } from "../LocalStorageManager";
import { ModeFactory } from "./ModeFactory";
import { SetPreferredCameraPositionMode } from "./SetPreferredCameraPositionMode";


export class SetPreferredCoordinateSystemMode implements IMode {
    public static readonly ID: string = 'setPreferredCoordinateSystem';
    public static readonly Description: string = 'Set Preferred Coordinate System';
    public static readonly Info: ModeInfo = new ModeInfo(SetPreferredCoordinateSystemMode.ID, SetPreferredCoordinateSystemMode.Description);


    public get ModeInfo(): ModeInfo {
        return SetPreferredCoordinateSystemMode.Info;
    }
    private readonly AxesTransformControl: AxesTransformControl;
    private readonly DatGUI: dat.GUI;
    private readonly AxesHelper: THREE.AxesHelper;
    private AxesMovementBoundingBox: THREE.Box3;


    public constructor(controlPanel: ControlPanel) {
        this.AxesHelper = Application.Theater.Axes;

        this.Startup();

        this.AxesTransformControl = new AxesTransformControl(controlPanel);
        this.AxesTransformControl.ApplyButton.AddOnClickListener(this.OnApply)

        this.DatGUI = new dat.GUI();
        this.ConfigureDatGui();
    }

    private ConfigureDatGui(): void {
        let translationFolder = this.DatGUI.addFolder('Translation');
        translationFolder.open();

        let translateX = translationFolder.add(this.AxesHelper.position, 'x', this.AxesMovementBoundingBox.min.x, this.AxesMovementBoundingBox.max.x);
        translateX.listen();

        let translateY = translationFolder.add(this.AxesHelper.position, 'y', this.AxesMovementBoundingBox.min.y, this.AxesMovementBoundingBox.max.y);
        translateY.listen();

        let translateZ = translationFolder.add(this.AxesHelper.position, 'z', this.AxesMovementBoundingBox.min.z, this.AxesMovementBoundingBox.max.z);
        translateZ.listen();

        let rotationFolder = this.DatGUI.addFolder('Rotation');
        rotationFolder.open();

        let rotateX = rotationFolder.add(this.AxesHelper.rotation, 'x', -2 * Math.PI, 2 * Math.PI);
        rotateX.listen();

        let rotateY = rotationFolder.add(this.AxesHelper.rotation, 'y', -2 * Math.PI, 2 * Math.PI);
        rotateY.listen();

        let rotateZ = rotationFolder.add(this.AxesHelper.rotation, 'z', -2 * Math.PI, 2 * Math.PI);
        rotateZ.listen();
    }

    public Dispose(): void {
        this.AxesTransformControl.HtmlElement.remove();
        this.DatGUI.destroy();
    }

    private Startup(): void {
        // Determine a range for the dat.GUI controls that is helpful (a box centered on the miniature's bounding box's center, sized at twice the with in each dimension.      
        let boundingBox = Application.Miniature.Geometry.boundingBox;

        let xWidth = boundingBox.max.x - boundingBox.min.x;
        let yWidth = boundingBox.max.y - boundingBox.min.y;
        let zWidth = boundingBox.max.z - boundingBox.min.z;

        let center = new THREE.Vector3(boundingBox.min.x + xWidth / 2, boundingBox.min.y + yWidth / 2, boundingBox.min.z + zWidth / 2);

        let min = new THREE.Vector3(center.x - xWidth, center.y - yWidth, center.z - zWidth);
        let max = new THREE.Vector3(center.x + xWidth, center.y + yWidth, center.z + zWidth);
        this.AxesMovementBoundingBox = new THREE.Box3(min, max);

        // Set the initial position of the axes to something reasonable if there is no saved axes position.
        let present = LocalStorageManager.PreferredCoordinateSystemExists();
        if (!present) {
            // Set the position to be at the center of the bounding box.
            this.AxesHelper.position.copy(center);
            // Make the camera look at the center of the bounding box so we can see our model!
            // Note: cannot use camera.lookAt() when a TrackballControl is engaged. Need to use the controls directly.
            Application.TrackballController.Controls.target.copy(center);
        }
    }

    private OnApply = () => {
        // Tear down the axes transform control and move to the next mode, if the next mode has not been setup.
        this.Dispose();

        let preferredCameraPositionPreviouslyDefined = LocalStorageManager.PreferredCoordinateSystemExists();
        if (preferredCameraPositionPreviouslyDefined) {
            let loaded = LocalStorageManager.LoadPreferredCameraPosition();
            Application.PreferredCameraPosition.copy(loaded);

            // Apply the preferred coordinate system.
            Application.ApplyPreferredCoordinateSystem();
        } else {
            // Start in the set preferred coordinate system mode.
            let index = ModeFactory.GetIndexOfModeByModeInfo(SetPreferredCameraPositionMode.Info);
            Application.ModesControl.SetSelectedIndex(index);
        }
    }
}