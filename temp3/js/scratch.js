function scratch() {
    var object = siteData.object; // A Group.
    var mesh = object.children[0]; // Only one child in the group.
    var geometry = mesh.geometry; // BufferGeometry.
    var materials = mesh.material; // A materials array.
    var firstMaterial = materials[0]; // MeshPhongMaterial.

    // var newGeometry = geometry.clone();

    // var newMaterials = [];
    // materials.forEach(material => {
    //     var newMaterial = material.clone();
    //     newMaterials.push(newMaterial);
    // });

    // Create the bounding box.
    var selector1 = new THREE.Vector3(0, 0, 0);
    var selector2 = new THREE.Vector3(7, -2, 18);
    siteData.volumeSelection.selector1.position.copy(selector1);
    siteData.volumeSelection.selector2.position.copy(selector2);
    updateSelectorBoxGeometry();

    // Translate selectors to the intial object coordinate system.
    var selector1Translated = selector1.clone().sub(siteData.offset).sub(siteData.position).multiplyScalar(1 / siteData.scale);
    var selector2Translated = selector2.clone().sub(siteData.offset).sub(siteData.position).multiplyScalar(1 / siteData.scale);

    var boundingBox = getBoundingBox2(selector1Translated, selector2Translated);

    var nValuesPerVertex = 3;
    var nVerticesPerFace = 3;
    var position = geometry.getAttribute('position');
    var values = position.array;
    var nVertices = values.length / nValuesPerVertex;
    var nFaces = nVertices / nVerticesPerFace;

    var facesInBoundingBox = [];
    for(var iFace = 0; iFace < nFaces; iFace++) {
        var faceStartIndex = iFace * nValuesPerVertex * nVerticesPerFace;

        var faceInBoundingBox = false;
        for(var iVertex = 0; iVertex < nVerticesPerFace; iVertex++) {
            var vertexStartIndex = faceStartIndex + iVertex * nVerticesPerFace;

            var valueX = values[vertexStartIndex + 0];
            var valueY = values[vertexStartIndex + 1];
            var valueZ = values[vertexStartIndex + 2];

            var withinX = valueX < boundingBox.xMax && valueX > boundingBox.xMin;
            var withinY = valueY < boundingBox.yMax && valueY > boundingBox.yMin;
            var withinZ = valueZ < boundingBox.zMax && valueZ > boundingBox.zMin;

            var vertexInBoundingBox = withinX && withinY && withinZ;
            if(vertexInBoundingBox) {
                faceInBoundingBox = true;
                break;
            }
        }

        if(faceInBoundingBox) {
            facesInBoundingBox.push(iFace);
        }
    }
    
    var selectedGeometry = new THREE.Geometry();
    var iVertexIndex = 0;
    facesInBoundingBox.forEach(faceIndex => {
        var faceStartIndex = faceIndex * nValuesPerVertex * nVerticesPerFace;
        for(var iVertex = 0; iVertex < nVerticesPerFace; iVertex++) {
            var vertexStartIndex = faceStartIndex + iVertex * nVerticesPerFace;
            var vertex = new THREE.Vector3(values[vertexStartIndex + 0], values[vertexStartIndex + 1], values[vertexStartIndex + 2]);
            selectedGeometry.vertices.push(vertex);
        }

        var face = new THREE.Face3(iVertexIndex + 0, iVertexIndex + 1, iVertexIndex + 2);
        iVertexIndex += nVerticesPerFace;
        selectedGeometry.faces.push(face);
    });

    selectedGeometry.computeBoundingSphere();

    var selectedGeometryMaterial = new THREE.MeshBasicMaterial({ color: new THREE.Color('cornflowerblue') });
    selectedGeometryMaterial.side = THREE.DoubleSide;
    var selectedGeometryMesh = new THREE.Mesh(selectedGeometry, selectedGeometryMaterial);
    selectedGeometryMesh.position.copy(object.position);
    selectedGeometryMesh.scale.copy(object.scale);
    if(siteData.selectedGeometry !== undefined) {
        siteData.scene.remove(siteData.selectedGeometry);
    }
    siteData.selectedGeometry = selectedGeometry;
    siteData.scene.add(selectedGeometryMesh);
}