// Constants.
var desiredInitialRadius = 20;
var lightPosition = new THREE.Vector3(10, 0, 0);
var payloadName = 'payload';
var pointOfInterestColor = new THREE.Color('greenyellow');
var selectedPointOfInterestColor = new THREE.Color('red');

var path = 'models/00/models/';
var mtlFileName = 'output.mtl';
var objFileName = 'output.obj';

// Initialize the website.
function initializeSite() {
    initializeSiteData();

    initializeScene();
    initializeModel();

    initializeStats(); // Optional.
    initializeClock();

    initializeDatGuiControls(); // Required since the controls data structure is referenced in the main render loop.
    addDatGui(); // Optional.

    initializeSelection();

    initializeVolumeSelection();
}

var siteData = new Object();
function initializeSiteData() {
    siteData.pointOfInterestMeshes = [];
}

function initializeSelection() {
    addStoredSelectedPoints();

    siteData.renderer.domElement.addEventListener("mousedown", onWebGLOutputMouseDown);
}

function onWebGLOutputMouseDown(event) {
    if (selectionOn) {
        if (testSelectionOfSelectedPoint()) {

        } else {
            testSelectionOfModelPoint();
        }
    }
}

function testSelectionOfSelectedPoint() {
    var camera = siteData.camera;
    var scene = siteData.scene;

    var vector = new THREE.Vector3((event.clientX / window.innerWidth) * 2 - 1, -(event.clientY / window.innerHeight) * 2 + 1, 0.5);
    vector = vector.unproject(camera);

    var raycaster = new THREE.Raycaster(camera.position, vector.sub(camera.position).normalize());

    var intersects = raycaster.intersectObjects(siteData.pointOfInterestMeshes);
    if (intersects.length > 0) {
        handleSelectedPointIntersect(intersects[0]);

        visualizeSelectedPointIntersect();

        return true;
    }

    return false;
}

function handleSelectedPointIntersect(intersect) {
    if (siteData.selectedPointofInterestIntersect !== undefined) {
        devisualizeSelectedPointIntersect();
    }
    siteData.selectedPointofInterestIntersect = intersect;
    siteData.selectedSimplePointOfInterest = findSimplePointOfInterest(intersect.object.position);
}

// Find the point of interest with the same location as the input parameter.
function findSimplePointOfInterest(location) {
    for (var i = 0; i < siteData.selectedPoints.length; i++) {
        var selectedPointLocation = siteData.selectedPoints[i].location;
        if (selectedPointLocation.x == location.x && selectedPointLocation.y == location.y && selectedPointLocation.z == location.z) {
            return siteData.selectedPoints[i];
        }
    }

    return undefined;
}

function devisualizeSelectedPointIntersect() {
    siteData.selectedPointofInterestIntersect.object.material.color = pointOfInterestColor;
}

function visualizeSelectedPointIntersect() {
    siteData.selectedPointofInterestIntersect.object.material.color = selectedPointOfInterestColor;

    var name = siteData.selectedSimplePointOfInterest.name;
    var description = siteData.selectedSimplePointOfInterest.description;

    showModal(name, description);
}

function testSelectionOfModelPoint() {
    var camera = siteData.camera;
    var scene = siteData.scene;

    var vector = new THREE.Vector3((event.clientX / window.innerWidth) * 2 - 1, -(event.clientY / window.innerHeight) * 2 + 1, 0.5);
    vector = vector.unproject(camera);

    var raycaster = new THREE.Raycaster(camera.position, vector.sub(camera.position).normalize());

    var payload = scene.getObjectByName(payloadName);
    var intersects = raycaster.intersectObjects(payload.children);
    if (intersects.length > 0) {
        var firstIntersection = intersects[0];
        console.log(firstIntersection);

        // Visualize first.
        addSelectedPointVisual(firstIntersection.point);

        // Create the simple point of interest.
        var simplePointOfInterest = {
            name: "",
            description: "",
            location: firstIntersection.point,
        };

        // Then spend the time to save to the local file system.
        addSelectedPoint(simplePointOfInterest);
    }
}

function addSelectedPoint(simplePointOfInterest) {
    siteData.selectedPoints.push(simplePointOfInterest);

    saveStoredSelectedPoints();
}

var storedSelectedPointsItemName = 'selectedPoints';
function loadStoredSelectedPoints() {
    var selectedPointsStr = localStorage.getItem(storedSelectedPointsItemName);
    var selectedPoints;
    if (selectedPointsStr === null) {
        selectedPoints = []; // First time.
    } else {
        selectedPoints = JSON.parse(selectedPointsStr);
    }
    siteData.selectedPoints = selectedPoints;
}

function saveStoredSelectedPoints() {
    localStorage.setItem(storedSelectedPointsItemName, JSON.stringify(siteData.selectedPoints));
}

function addStoredSelectedPoints() {
    loadStoredSelectedPoints();

    for (var i = 0; i < siteData.selectedPoints.length; i++) {
        addSelectedPointVisual(siteData.selectedPoints[i].location);
    }
}

function addSelectedPointVisual(vector3) {
    var selectedPointGeometry = new THREE.SphereGeometry(0.2);
    var selectedPointMaterial = new THREE.MeshBasicMaterial({ color: pointOfInterestColor });
    var selectedPointMesh = new THREE.Mesh(selectedPointGeometry, selectedPointMaterial);
    selectedPointMesh.position.copy(vector3);
    siteData.pointOfInterestMeshes.push(selectedPointMesh);
    siteData.scene.add(selectedPointMesh);
}

function initializeModel() {
    var materialLoader = new THREE.MTLLoader();
    materialLoader.setPath(path);
    materialLoader.load(mtlFileName, function (materials) {
        materials.preload();

        // console.log(materials);

        // Make all materials double-sided so they may be seen.
        Object.keys(materials.materials).forEach(function (key) {
            var material = materials.materials[key];
            material.side = THREE.DoubleSide;
        });

        var objLoader = new THREE.OBJLoader();
        objLoader.setMaterials(materials);
        objLoader.setPath(path);
        objLoader.load(objFileName, function (object) {
            object.name = payloadName;
            // console.log(object);

            var mesh = object.children[0];
            var geometry = mesh.geometry; // Will be a buffer geometry.
            geometry.computeBoundingSphere();
            var boundingSphere = geometry.boundingSphere;

            var radius = boundingSphere.radius;
            var newScaleValue = desiredInitialRadius / radius;
            object.scale.set(newScaleValue, newScaleValue, newScaleValue);
            var controls = siteData.controls;
            controls.scale = newScaleValue;

            var center = boundingSphere.center;
            var scaledCenter = center.clone().multiplyScalar(newScaleValue);
            object.position.sub(scaledCenter); // The initial position is zero.

            controls.positionX = object.position.x;
            controls.positionY = object.position.y;
            controls.positionZ = object.position.z;

            // var position = object.position;
            // object.position.set(-position);
            siteData.scene.add(object);

            document.getElementById('BlockUntilLoaded').style.display = 'none';
        },
            // called when loading is in progresses
            function (xhr) {
                var message = (xhr.loaded / xhr.total * 100) + '% loaded';
                document.getElementById('BlockUntilLoaded').innerHTML = message;
                console.log(message);
            },
            // called when loading has errors
            function (error) {

                console.log('An error happened');

            });
    });
}

function initializeScene() {
    // Create the scene and set the scene size.
    var scene = new THREE.Scene();
    siteData.scene = scene;

    // Create a camera, zoom it out from the model a bit, and add it to the scene.
    var camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 10000);
    camera.position.set(-50, -50, -50);
    // // camera.lookAt(new THREE.Vector3(7, , 0));
    // camera.rotation.x = 2.5;
    // camera.rotation.y = -0.5;
    // camera.rotation.z = 2.78;
    camera.lookAt(0, 0, 0);
    siteData.camera = camera;
    scene.add(camera);

    // Create a renderer and add it to the DOM.
    var renderer = new THREE.WebGLRenderer();
    renderer.setClearColor(0xffffff, 1.0); // Set the background color of the scene.
    renderer.setSize(window.innerWidth, window.innerHeight);
    siteData.renderer = renderer;
    document.getElementById("WebGL-Output").appendChild(renderer.domElement);

    // Create an event listener that resizes the renderer with the browser window.
    window.addEventListener('resize', function () {
        renderer.setSize(window.innerWidth, window.innerHeight);
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
    });

    var cameraControls = new THREE.TrackballControls(camera, renderer.domElement);
    siteData.cameraControls = cameraControls;

    // var sphereSelection = new THREE.SphereGeometry(0.2);
    // var sphereSelectionMaterial = new THREE.MeshBasicMaterial({ color: 0x0000ff });
    // var sphereSelectionMesh = new THREE.Mesh(sphereLight, sphereLightMaterial);
    // sphereSelectionMesh.position = pointLight.position;
    // scene.add(sphereLightMesh);
    setSelection(selectionOn);

    // Create a light, set its position, and add it to the scene.
    var pointLight = new THREE.PointLight(0xffffff);
    pointLight.position.copy(lightPosition);
    scene.add(pointLight);
    siteData.pointLight = pointLight;
    setLight(lightOn);
    setLightOscillation(lightOscillation);

    var sphereLight = new THREE.SphereGeometry(0.5);
    var sphereLightMaterial = new THREE.MeshBasicMaterial({ color: 0xffec9a });
    var sphereLightMesh = new THREE.Mesh(sphereLight, sphereLightMaterial);
    sphereLightMesh.position = pointLight.position;
    siteData.sphereLightMesh = sphereLightMesh;
    scene.add(sphereLightMesh);

    var ambientLight = new THREE.AmbientLight(0x404040);
    scene.add(ambientLight);

    var axes = new THREE.AxesHelper(50);
    scene.add(axes);
}

function addDatGui() {
    var controls = siteData.controls;
    var scene = siteData.scene;

    var datGui = new dat.GUI();
    var modelFolder = datGui.addFolder("Model");
    modelFolder.open();
    var maxRange = 100;
    var positionXControl = modelFolder.add(controls, "positionX", -maxRange, maxRange);
    var positionYControl = modelFolder.add(controls, "positionY", -maxRange, maxRange);
    var positionZControl = modelFolder.add(controls, "positionZ", -maxRange, maxRange);
    var scaleControl = modelFolder.add(controls, "scale", 0.1, 50);

    positionXControl.listen();
    positionXControl.onChange(function (value) {
        var payload = scene.getObjectByName(payloadName);
        if (payload !== undefined) {
            payload.position.x = controls.positionX;
        };
    });
    positionYControl.listen();
    positionYControl.onChange(function (value) {
        var payload = scene.getObjectByName(payloadName);
        if (payload !== undefined) {
            payload.position.y = controls.positionY;
        };
    });
    positionZControl.listen();
    positionZControl.onChange(function (value) {
        var payload = scene.getObjectByName(payloadName);
        if (payload !== undefined) {
            payload.position.z = controls.positionZ;
        };
    });
    scaleControl.listen();
    scaleControl.onChange(function (value) {
        var payload = scene.getObjectByName(payloadName);
        if (payload !== undefined) {
            var mesh = payload.children[0];
            var geometry = mesh.geometry; // Will be a buffer geometry.
            var boundingSphere = geometry.boundingSphere;
            var center = boundingSphere.center;

            var oldScaleVector = payload.scale; // Vector.
            var oldScaledCenter = center.clone().multiply(oldScaleVector);

            var delta = payload.position.add(oldScaledCenter);

            var newScaleValue = value;
            var newScaledCenter = center.clone().multiplyScalar(newScaleValue);

            var newPosition = newScaledCenter.clone().negate().add(delta);
            payload.position.copy(newPosition);

            payload.scale.set(controls.scale, controls.scale, controls.scale);

            controls.positionX = payload.position.x;
            controls.positionY = payload.position.y;
            controls.positionZ = payload.position.z;
        }
    });
}

function initializeDatGuiControls() {
    var controls = new function () {
        this.positionX = 0;
        this.positionY = 0;
        this.positionZ = 0;
        this.scale = 1;
    };
    siteData.controls = controls;
}

function initializeClock() {
    siteData.clock = new THREE.Clock();
}

function initializeStats() {
    var stats = new Stats();
    siteData.stats = stats;

    stats.setMode(0); // 0: fps, 1: ms per frame.

    // Align top-left.
    stats.domElement.style.position = "absolute";
    stats.domElement.style.left = "0px";
    stats.domElement.style.top = "0px";

    document.getElementById("Stats-Output").appendChild(stats.domElement);

    return stats;
}

// Load/Save selected points from local storage.


function processForm() {

}