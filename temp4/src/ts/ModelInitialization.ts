import * as THREE from 'three';
import 'three/MTLLoader';
import 'three/OBJLoader';
import 'three/TrackballControls';


export class ModelInitialization {
    public static main() {
        var desiredInitialRadius = 20;
        var lightPosition = new THREE.Vector3(10, 0, 0);
        var payloadName = 'payload';
        var pointOfInterestColor = new THREE.Color('greenyellow');
        var selectedPointOfInterestColor = new THREE.Color('red');
        var lightSphereColor = new THREE.Color(0xffec9a);

        var path = 'models/00/models/';
        var mtlFileName = 'output.mtl';
        var objFileName = 'output.obj';
        var siteData: any = new Object();
        function initializeSiteData() {
            siteData.pointOfInterestMeshes = [];

            siteData.scale = 0;
            siteData.position = new THREE.Vector3(0, 0, 0);
            setInitialOffset();
        }

        function setInitialOffset() {
            siteData.offset = new THREE.Vector3(0, 0, 0);
        }

        // Sets up the scene.
        function init() {
            initializeSite();

            var step = 0;
            var increment = 0.05;
            var offset = getOffset(step);
            render();

            // Renders the scene and updates the render as needed.
            function render() {
                siteData.cameraControls.update();

                step += increment;
                var newOffset = getOffset(step);
                var xIncrement = newOffset - offset;
                offset = newOffset;
                moveLight(xIncrement, 0, 0);

                // Read more about requestAnimationFrame at http://www.paulirish.com/2011/requestanimationframe-for-smart-animating/
                requestAnimationFrame(render);

                // Render the scene.
                siteData.renderer.render(siteData.scene, siteData.camera);
            }

            function getOffset(step) {
                var offset = 10 * Math.sin(step);
                return offset;
            }
        }
        window.onload = init;

        var defaultIncrement = 1;
        function moveLight(xIncrement, yIncrement, zIncrement) {
            siteData.pointLight.position.x = siteData.pointLight.position.x + xIncrement;
            siteData.pointLight.position.y = siteData.pointLight.position.y + yIncrement;
            siteData.pointLight.position.z = siteData.pointLight.position.z + zIncrement;

            siteData.sphereLightMesh.position.x = siteData.sphereLightMesh.position.x + xIncrement;
            siteData.sphereLightMesh.position.y = siteData.sphereLightMesh.position.y + yIncrement;
            siteData.sphereLightMesh.position.z = siteData.sphereLightMesh.position.z + zIncrement;
        }

        // Initialize the website.
        function initializeSite() {
            initializeSiteData();

            initializeScene();
            initializeModel();
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

            let webGLOutputElement = document.createElement('div');
            webGLOutputElement.id = 'WebGL-Output';
            document.body.appendChild(webGLOutputElement);
            document.getElementById("WebGL-Output").appendChild(renderer.domElement);

            // Create an event listener that resizes the renderer with the browser window.
            window.addEventListener('resize', function () {
                renderer.setSize(window.innerWidth, window.innerHeight);
                camera.aspect = window.innerWidth / window.innerHeight;
                camera.updateProjectionMatrix();
            });

            var cameraControls = new THREE.TrackballControls(camera, renderer.domElement);
            siteData.cameraControls = cameraControls;

            // Create a light, set its position, and add it to the scene.
            var pointLight = new THREE.PointLight(0xffffff);
            pointLight.position.copy(lightPosition);
            scene.add(pointLight);
            siteData.pointLight = pointLight;

            var sphereLight = new THREE.SphereGeometry(0.5);
            var sphereLightMaterial = new THREE.MeshBasicMaterial({ color: lightSphereColor });
            var sphereLightMesh = new THREE.Mesh(sphereLight, sphereLightMaterial);
            sphereLightMesh.position.copy(pointLight.position);
            siteData.sphereLightMesh = sphereLightMesh;
            scene.add(sphereLightMesh);

            var ambientLight = new THREE.AmbientLight(0x404040);
            scene.add(ambientLight);

            var axes = new THREE.AxesHelper(50);
            scene.add(axes);
        }

        function initializeModel() {
            var materialLoader = new THREE.MTLLoader();
            materialLoader.setPath(path);
            materialLoader.load(mtlFileName, function (materials) {
                materials.preload();

                // Make all materials double-sided so they may be seen.
                Object.keys(materials.materials).forEach(function (key) {
                    var material = materials.materials[key];
                    material.side = THREE.DoubleSide;
                });

                var objLoader = new THREE.OBJLoader();
                objLoader.setMaterials(materials);
                objLoader.setPath(path);
                objLoader.load(objFileName,
                    function (object) {
                        object.name = payloadName;
                        siteData.object = object;

                        // Position the loaded object in the center of the screen.
                        var mesh = <THREE.Mesh>object.children[0];
                        var geometry = mesh.geometry; // Will be a buffer geometry.
                        geometry.computeBoundingSphere();
                        var boundingSphere = geometry.boundingSphere;

                        var radius = boundingSphere.radius;
                        siteData.radius = radius;
                        // siteData.radius = desiredInitialRadius;
                        setInitialScale();

                        var center = boundingSphere.center;
                        siteData.center = center.clone();
                        // siteData.center = new THREE.Vector3(0, 0, 0);

                        computeObjectPosition();
                        positionObject();

                        siteData.scene.add(object);

                        // Remove the initially blocking modal now that the object is ready!
                        // document.getElementById('BlockUntilLoaded').style.display = 'none';
                    },
                    // called when loading is in progresses
                    function (xhr) {
                        var message = (xhr.loaded / xhr.total * 100) + '% loaded';
                        // document.getElementById('BlockUntilLoaded').innerHTML = message;
                        console.log(message);
                    },
                    // called when loading has errors
                    function (error) {
                        console.log('An error happened.');
                        console.log(error);
                    });
            });
        }

        function setInitialScale() {
            var newScaleValue = desiredInitialRadius / siteData.radius;
            siteData.scale = newScaleValue;
        }

        function computeObjectPosition() {
            var scaledCenter = siteData.center.clone().multiplyScalar(siteData.scale);
            var positionForCenterAtOrigin = scaledCenter.clone().negate();
            siteData.position.copy(positionForCenterAtOrigin);
        }

        function positionObject() {
            siteData.object.scale.set(siteData.scale, siteData.scale, siteData.scale);
            siteData.object.position.copy(siteData.position);
            siteData.object.position.add(siteData.offset);
        }
    }
}