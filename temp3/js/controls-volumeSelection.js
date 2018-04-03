var volumeSelectionOnOff = document.getElementById('VolumeSelectionOnOff');
var selector1OnOff = document.getElementById('Selector1OnOff');
var selector2OnOff = document.getElementById('Selector2OnOff');
var selectorColor = new THREE.Color('plum');
var selectorInitialPosition = new THREE.Vector3(0, 0, 0);
var enabledOpacityLevel = 1;
var disabledOpacityLevel = 0.2;


function initializeVolumeSelection() {
    // Create meshes.
    siteData.volumeSelection = new Object();

    var selector1Geometry = new THREE.SphereGeometry(0.3);
    var selector1Material = new THREE.MeshBasicMaterial({ color: selectorColor })
    var selector1Mesh = new THREE.Mesh(selector1Geometry, selector1Material);
    selector1Mesh.position = selectorInitialPosition;
    siteData.volumeSelection.selector1 = selector1Mesh;
    siteData.scene.add(selector1Mesh);

    var selector2Geometry = new THREE.SphereGeometry(0.3);
    var selector2Material = new THREE.MeshBasicMaterial({ color: selectorColor })
    var selector2Mesh = new THREE.Mesh(selector2Geometry, selector2Material);
    selector2Mesh.position = selectorInitialPosition;
    siteData.volumeSelection.selector2 = selector2Mesh;
    siteData.scene.add(selector2Mesh);

    var selectorBoxGeometry = new THREE.BoxGeometry(1, 1, 1);
    var selectorBoxMaterial = new THREE.MeshBasicMaterial({ color: selectorColor, wireframe: true });
    var selectorBoxMesh = new THREE.Mesh(selectorBoxGeometry, selectorBoxMaterial);
    selectorBoxMesh.position = selectorInitialPosition;
    siteData.volumeSelection.selectorBox = selectorBoxMesh;
    siteData.scene.add(selectorBoxMesh);

    // Set controls.
    setVolumeSelection(volumeSelectionEnable);
    setSelector1(selector1Enable);
    setSelector2(selector2Enable);
}

var volumeSelectionEnable = false;
function toggleVolumeSelection() {
    volumeSelectionEnable = !volumeSelectionEnable;
    setVolumeSelection(volumeSelectionEnable);
}
function setVolumeSelection(onOrOff) {
    toggleSwitchSetOnOff(volumeSelectionOnOff, onOrOff);

    if (onOrOff) {
        setVolumeSelectionGraphicsOn();
    } else {
        setVolumeSelectionGraphicsOff();
    }

    if (onOrOff) {
        selector1Enable = true;
        setSelector1(selector1Enable);
    } else {
        selector1Enable = false;
        setSelector1(selector1Enable);
        selector1Enable = false;
        setSelector1(selector1Enable);
    }
}

function setVolumeSelectionGraphicsOn() {
    selector1OnOff.style.opacity = enabledOpacityLevel;
    selector2OnOff.style.opacity = enabledOpacityLevel;

    siteData.volumeSelection.selector1.material.visible = true;
    siteData.volumeSelection.selector2.material.visible = true;
    siteData.volumeSelection.selectorBox.material.visible = true;
    if(siteData.selectedGeometryMesh !== undefined) {
        siteData.selectedGeometryMesh.visible = true;
    }

    makeMainObjectTransparent();
}

function setVolumeSelectionGraphicsOff() {
    selector1OnOff.style.opacity = disabledOpacityLevel;
    selector2OnOff.style.opacity = disabledOpacityLevel;

    siteData.volumeSelection.selector1.material.visible = false;
    siteData.volumeSelection.selector2.material.visible = false;
    siteData.volumeSelection.selectorBox.material.visible = false;
    if(siteData.selectedGeometryMesh !== undefined) {
        siteData.selectedGeometryMesh.visible = false;
    }

    makeMainObjectOpaque();
}

function makeMainObjectTransparent() {
    if (siteData.object !== undefined) {
        var materialsArray = siteData.object.children[0].material;
        for (var i = 0; i < materialsArray.length; i++) {
            var material = materialsArray[i];
            material.transparent = true;
            material.opacity = 0.3;
        }
    }
}

function makeMainObjectOpaque() {
    if (siteData.object !== undefined) {
        var materialsArray = siteData.object.children[0].material;
        for (var i = 0; i < materialsArray.length; i++) {
            var material = materialsArray[i];
            material.opacity = 1;
            material.transparent = false;
        }
    }
}

var selector1Enable = false;
function toggleSelector1() {
    if (volumeSelectionEnable) {
        selector1Enable = !selector1Enable;
        setSelector1(selector1Enable);
    }
}
function setSelector1(onOrOff) {
    toggleSwitchSetOnOff(selector1OnOff, onOrOff);

    if (onOrOff) {
        selector2Enable = false;
        setSelector2(selector2Enable); // Either/or.
        siteData.currentObjectMoveFunction = moveSelector1;
    } else {
        setDefaultMovementMode();
    }
}

function moveSelector1(xIncrement, yIncrement, zIncrement) {
    var currentPosition = siteData.volumeSelection.selector1.position;
    currentPosition.x = currentPosition.x + xIncrement;
    currentPosition.y = currentPosition.y + yIncrement;
    currentPosition.z = currentPosition.z + zIncrement;

    updateSelectorBoxGeometry();
}

var selector2Enable = false;
function toggleSelector2() {
    if (volumeSelectionEnable) {
        selector2Enable = !selector2Enable;
        setSelector2(selector2Enable);
    }
}
function setSelector2(onOrOff) {
    toggleSwitchSetOnOff(selector2OnOff, onOrOff);

    if (onOrOff) {
        selector1Enable = false;
        setSelector1(selector1Enable); // Either/or.
        siteData.currentObjectMoveFunction = moveSelector2;
    } else {
        setDefaultMovementMode();
    }
}

function moveSelector2(xIncrement, yIncrement, zIncrement) {
    var currentPosition = siteData.volumeSelection.selector2.position;
    currentPosition.x = currentPosition.x + xIncrement;
    currentPosition.y = currentPosition.y + yIncrement;
    currentPosition.z = currentPosition.z + zIncrement;

    updateSelectorBoxGeometry();
}

function updateSelectorBoxGeometry() {
    var selectorCurrentPositions = getSelectorCurrentPositions();

    var boundingBox = getBoundingBox(selectorCurrentPositions);

    var xSize = boundingBox.xMax - boundingBox.xMin;
    var ySize = boundingBox.yMax - boundingBox.yMin;
    var zSize = boundingBox.zMax - boundingBox.zMin;

    var selectorBox = siteData.volumeSelection.selectorBox;
    selectorBox.geometry = new THREE.BoxGeometry(xSize, ySize, zSize);

    var newPosition = new THREE.Vector3(boundingBox.xMin + xSize / 2, boundingBox.yMin + ySize / 2, boundingBox.zMin + zSize / 2);
    selectorBox.position.copy(newPosition);

    updateSelectedGeometry();
}

function getSelectorCurrentPositions() {
    var output = new Object();
    output.selector1 = siteData.volumeSelection.selector1.position;
    output.selector2 = siteData.volumeSelection.selector2.position;
    return output;
}

function getBoundingBox(selectorCurrentPositions) {
    var selector1CurrentPosition = selectorCurrentPositions.selector1;
    var selector2CurrentPosition = selectorCurrentPositions.selector2;

    var output = getBoundingBox2(selector1CurrentPosition, selector2CurrentPosition);
    return output;
}

function getBoundingBox2(selector1CurrentPosition, selector2CurrentPosition) {
    var output = new Object();
    output.xMin = Math.min(selector1CurrentPosition.x, selector2CurrentPosition.x);
    output.xMax = Math.max(selector1CurrentPosition.x, selector2CurrentPosition.x);
    output.yMin = Math.min(selector1CurrentPosition.y, selector2CurrentPosition.y);
    output.yMax = Math.max(selector1CurrentPosition.y, selector2CurrentPosition.y);
    output.zMin = Math.min(selector1CurrentPosition.z, selector2CurrentPosition.z);
    output.zMax = Math.max(selector1CurrentPosition.z, selector2CurrentPosition.z);
    return output;
}

function updateSelectedGeometry() {
    // Remove the old geometry, if present.
    if(siteData.selectedGeometryMesh !== undefined) {
        siteData.scene.remove(siteData.selectedGeometryMesh);
    }

    var object = siteData.object; // A Group.
    var mesh = object.children[0]; // Only one child in the group.
    var geometry = mesh.geometry; // BufferGeometry.

    // Translate selectors to the intial object coordinate system.
    var selector1 = siteData.volumeSelection.selector1.position;
    var selector2 = siteData.volumeSelection.selector2.position;
    var selector1Translated = selector1.clone().sub(siteData.offset).sub(siteData.position).multiplyScalar(1 / siteData.scale);
    var selector2Translated = selector2.clone().sub(siteData.offset).sub(siteData.position).multiplyScalar(1 / siteData.scale);

    // We are using a box selector here.
    var boundingBox = getBoundingBox2(selector1Translated, selector2Translated);

    // Determine all faces that have at least one vertex inside the box.
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
    
    // Build the geometry.
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

    // Create the material.
    var selectedGeometryMaterial = new THREE.MeshBasicMaterial({ color: new THREE.Color('cornflowerblue') });
    selectedGeometryMaterial.side = THREE.DoubleSide;

    // Create the mesh.
    var selectedGeometryMesh = new THREE.Mesh(selectedGeometry, selectedGeometryMaterial);
    selectedGeometryMesh.position.copy(object.position);
    selectedGeometryMesh.scale.copy(object.scale);

    siteData.selectedGeometryMesh = selectedGeometryMesh;

    siteData.scene.add(selectedGeometryMesh);
}