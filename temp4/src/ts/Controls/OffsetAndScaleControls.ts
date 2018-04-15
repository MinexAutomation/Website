import * as wDatGui from "dat.gui";
const dat = (<any>wDatGui).default; // Workaround.
import * as THREE from "three";

import { Miniature } from '../Miniature';


export class OffsetAndScaleControls {
    private BoundingBox: THREE.Box3;
    private GeomXPos: number; // The current x-position of the geometry.
    private GeomYPos: number; // The current y-position of the geometry.
    private GeomZPos: number; // The current z-position of the geometry.
    private GeomScale: number;


    public constructor(miniature: Miniature) {
        this.BoundingBox = miniature.Geometry.boundingBox.clone();

        this.GeomXPos = this.BoundingBox.min.x;
        this.GeomYPos = this.BoundingBox.min.y;
        this.GeomZPos = this.BoundingBox.min.z;
        this.GeomScale = 1;

        // For the geometry, there is no single position value to latch onto. Use a second object to hold the single position value, and adjust the geometry in an onChange function.
        let ghostObject = {
            xPosition: this.GeomXPos,
            yPosition: this.GeomYPos,
            zPosition: this.GeomZPos,
            scale: this.GeomScale,
        };

        let datGui: wDatGui.GUI = new dat.GUI();

        let geometryFolder = datGui.addFolder('Geometry');
        geometryFolder.open();

        let geometryPositionX = geometryFolder.add(ghostObject, 'xPosition', this.BoundingBox.min.x, this.BoundingBox.max.x);
        geometryPositionX.listen();
        geometryPositionX.onChange(() => {
            let translation = ghostObject.xPosition - this.GeomXPos;
            miniature.Geometry.translate(translation, 0, 0);
            this.GeomXPos = ghostObject.xPosition;
        });

        let geometryPositionY = geometryFolder.add(ghostObject, 'yPosition', this.BoundingBox.min.y, this.BoundingBox.max.y);
        geometryPositionY.listen();
        geometryPositionY.onChange(() => {
            let translation = ghostObject.yPosition - this.GeomYPos;
            miniature.Geometry.translate(0, translation, 0);
            this.GeomYPos = ghostObject.yPosition;
        });

        let geometryPositionZ = geometryFolder.add(ghostObject, 'zPosition', this.BoundingBox.min.z, this.BoundingBox.max.z);
        geometryPositionZ.listen();
        geometryPositionZ.onChange(() => {
            let translation = ghostObject.zPosition - this.GeomZPos;
            miniature.Geometry.translate(0, 0, translation);
            this.GeomZPos = ghostObject.zPosition;
        });

        let geometryScale = geometryFolder.add(ghostObject, 'scale', 0.25, 4);
        geometryScale.onChange(() => {
            let scaleDiff = ghostObject.scale/this.GeomScale;
            miniature.Geometry.scale(scaleDiff, scaleDiff, scaleDiff);
            this.GeomScale = ghostObject.scale;

            let dbg = miniature;

            console.log((<any>miniature.Geometry.attributes).position.array[0] + ' ' + (<any>miniature.Geometry.attributes).position.array[1] + ' ' + (<any>miniature.Geometry.attributes).position.array[2]);
        })

        let objectFolder = datGui.addFolder('Object');
        objectFolder.open();
    }

    private GeometryPositionXOnChange = () => {
        this.GeomXPos
    }
}