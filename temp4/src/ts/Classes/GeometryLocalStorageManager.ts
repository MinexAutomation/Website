import { Geometry, Vector3, Face3 } from "three";


export interface IGeometryStorage {
    NVertices: number,
    NFaces: number,
    VertexElements: number[],
    FaceElements: number[],
}


/**
 * Handles conversion to/from JSON format objects.
 */
export class GeometryLocalStorageManager {
    public static ToObject(geometry: Geometry): any {
        let nVertices = geometry.vertices.length;
        let nFaces = geometry.faces.length;

        let vertexElements: number[] = [];
        for (let iVertex = 0; iVertex < nVertices; iVertex++) {
            const vertex = geometry.vertices[iVertex];
            vertexElements.push(vertex.x);
            vertexElements.push(vertex.y);
            vertexElements.push(vertex.z);
        }

        let faceElements: number[] = [];
        for (let iFace = 0; iFace < nFaces; iFace++) {
            const face = geometry.faces[iFace];
            faceElements.push(face.a);
            faceElements.push(face.b);
            faceElements.push(face.c);
        }

        let output: IGeometryStorage = {
            NVertices: nVertices,
            NFaces: nFaces,
            VertexElements: vertexElements,
            FaceElements: faceElements,
        };
        return output;
    }

    public static ToGeometry(obj: IGeometryStorage): Geometry {
        let geometry = new Geometry();

        let nVertices = obj.NVertices;
        let vertexElementIndex = 0;
        for (let iVertex = 0; iVertex < nVertices; iVertex++) {
            let x = obj.VertexElements[vertexElementIndex++];
            let y = obj.VertexElements[vertexElementIndex++];
            let z = obj.VertexElements[vertexElementIndex++];

            let vertex = new Vector3(x, y, z);
            geometry.vertices.push(vertex);
        }

        let nFaces = obj.NFaces;
        let faceElementIndex = 0;
        for (let iFace = 0; iFace < nFaces; iFace++) {
            let a = obj.FaceElements[faceElementIndex++];
            let b = obj.FaceElements[faceElementIndex++];
            let c = obj.FaceElements[faceElementIndex++];

            let face = new Face3(a, b, c);
            geometry.faces.push(face);
        }

        geometry.computeBoundingBox();
        geometry.computeBoundingSphere();

        return geometry;
    }
}