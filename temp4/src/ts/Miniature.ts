import * as THREE from 'three';
import 'three/MTLLoader';
import 'three/OBJLoader';

import { Constants } from './Constants';
import { Theater } from "./Theater";


export class Miniature {
    public static DefaultLoadingProgressHandler(xhr: ProgressEvent) {
        var message = (xhr.loaded / xhr.total * 100) + '% loaded';
        console.log(message);
    }

    public static DefaultLoadingErrorHandler(err: ErrorEvent) {
        console.log('An error occurred.');
        console.log(err);
    }


    public Theater: Theater;
    public Object: THREE.Group;
    public Mesh: THREE.Mesh;
    public Geometry: THREE.BufferGeometry;
    public Radius: number;
    public Center: THREE.Vector3 = new THREE.Vector3(0, 0, 0);
    public Scale: THREE.Vector3 = new THREE.Vector3(0, 0, 0);
    public Offset: THREE.Vector3 = new THREE.Vector3(0, 0, 0);


    public constructor(theater: Theater, path: string, objFileName: string, mtlFileName: string,
        loadingProgressHandler: (xhr: ProgressEvent) => void = Miniature.DefaultLoadingProgressHandler,
        loadingErrorHandler: (err: ErrorEvent) => void = Miniature.DefaultLoadingErrorHandler
    ) {
        this.Theater = theater;

        let materialLoader = new THREE.MTLLoader();
        materialLoader.setPath(path);
        materialLoader.load(mtlFileName,
            (materials) => { this.MaterialOnLoad(materials, theater, path, objFileName, loadingProgressHandler, loadingErrorHandler); },
            loadingProgressHandler,
            loadingErrorHandler
        );
    }

    private MaterialOnLoad(materials: THREE.MaterialCreator, theater: Theater, path: string, objFileName: string,
        loadingProgressHandler: (xhr: ProgressEvent) => void = Miniature.DefaultLoadingProgressHandler,
        loadingErrorHandler: (err: ErrorEvent) => void = Miniature.DefaultLoadingErrorHandler
    ) {
        materials.preload();

        // Make all materials double-sided so they may be seen from any direction.
        Object.keys(materials.materials).forEach(function (key) {
            var material = materials.materials[key];
            material.side = THREE.DoubleSide;
        });

        var objLoader = new THREE.OBJLoader();
        objLoader.setMaterials(materials);
        objLoader.setPath(path);
        objLoader.load(objFileName,
            (object) => { this.ObjectOnLoad(object, theater); },
            // Called when loading is in progress.
            loadingProgressHandler,
            // Called when an error occurs during loading.
            loadingErrorHandler
        );
    }

    private ObjectOnLoad(object: THREE.Group, theater: Theater) {
        this.Object = object;
        theater.Scene.add(object);

        this.Mesh = <THREE.Mesh>object.children[0];
        this.Geometry = <THREE.BufferGeometry>this.Mesh.geometry;

        this.Geometry.computeBoundingSphere();
        this.Radius = this.Geometry.boundingSphere.radius;
        this.Center.copy(this.Geometry.boundingSphere.center);

        this.Geometry.computeBoundingBox();

        this.ComputeScaleAndOffset();

        this.PositionObject();
    }

    // Position the loaded object in the center of the screen.
    private PositionObject() {
        this.Object.scale.copy(this.Scale);
        this.Object.position.copy(this.Offset);
    }

    // The miniature needs to be scaled to be visible and positioned such that it's center is at the origin. Compute these values.
    private ComputeScaleAndOffset() {
        let scaleValue = Constants.ModestDistance / this.Radius;
        this.Scale.set(scaleValue, scaleValue, scaleValue);

        let scaledCenter = this.Center.clone().multiplyScalar(scaleValue);
        let positionForCenterAtOrigin = scaledCenter.clone().negate();
        this.Offset.copy(positionForCenterAtOrigin);
    }
}