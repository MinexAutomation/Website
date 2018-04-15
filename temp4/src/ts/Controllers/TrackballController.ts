import * as THREE from 'three';
import 'three/TrackballControls';

import { Theater } from "../Theater";


export class TrackballController {
    public Controls: THREE.TrackballControls;


    public constructor(theater: Theater) {
        this.Controls = new THREE.TrackballControls(theater.Camera, theater.Renderer.domElement);

        theater.RenderActions.push(() => { this.Controls.update() });
    }
}