import * as THREE from "three";
import { Theater } from "./Theater";
import { TrackballController } from "./Controllers/TrackballController";
import { Miniature } from "./Miniature";
import { ControlPanel } from "./Controls/ControlPanel";
import { ModesControl } from "./Controls/ModesControl";
import { CoordinateSystemConversion } from "./CoordinateSystemConversion";
import { NotifyingValueProperty } from "./Common/NotifyingValueProperty";
import { CameraSpecification } from "./CameraSpecification";
import { Constants } from "./Constants";
import { ScratchControl } from "./Controls/ScratchControl";
import { LoadingBlocker } from "./LoadingBlocker";
import { Tour } from "./Tour/Tour";
import { LocalStorageManager } from "./LocalStorageManager";
import { SetPreferredCoordinateSystemMode } from "./Modes/SetPreferredCoordinateSystemMode";
import { SetPreferredCameraSpecificationMode } from "./Modes/SetPreferredCameraSpecificationMode";
import { SetLightsMode } from "./Modes/SetLightsMode";
import { Modal } from "./Modal";
import { PointMode } from "./Modes/PointMode";
import { LightingSpecification } from "./LightingSpecification";
import { PointAnnotationMode } from "./Modes/PointAnnotationMode";
import { Color } from "three";
import { CategoriesManager } from "./Annotations/CategoriesManager";
import { CategoryManagementMode } from "./Modes/CategoryManagementMode";
import { InformationBox } from "./Common/Boxes/InformationBox";
import { MessageBox } from "./Common/Boxes/MessageBox";
import { EditorBox, EditorBoxResult } from "./Common/Boxes/EditorBox";
import { IdentifiedManager } from "./Common/IdentifiedManager";
import { PointAnnotation } from "./Annotations/PointAnnotation";


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
    public static readonly PreferredCoordinateSystem = new NotifyingValueProperty<CoordinateSystemConversion>(new CoordinateSystemConversion());
    public static readonly PreferredCameraSpecification = new NotifyingValueProperty<CameraSpecification>(new CameraSpecification());
    public static readonly CategoryManager = new CategoriesManager();
    public static readonly PointAnnotationsManager = new IdentifiedManager<PointAnnotation>();


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
        scratchControl.Button.Click.Subscribe(Application.Scratch);

        Application.SetWindowEventHandlers();
    }

    public static ApplyPreferredCameraSpecification() {
        Application.Theater.Camera.position.copy(Application.PreferredCameraSpecification.Value.Position);
        Application.Theater.Camera.rotation.setFromVector3(Application.PreferredCameraSpecification.Value.Rotation);
        // Application.TrackballController.Controls.target.copy(Application.PreferredCameraSpecification.Value.Target);
        Application.Theater.Camera.up.copy(Application.PreferredCameraSpecification.Value.Up);
    }

    public static ApplyPreferredCoordinateSystem() {
        Application.Theater.Axes.position.set(0, 0, 0);
        Application.Theater.Axes.rotation.set(0, 0, 0);

        Application.Miniature.Mesh.position.copy(Application.PreferredCoordinateSystem.Value.Translation);
        Application.Miniature.Object.rotation.setFromVector3(Application.PreferredCoordinateSystem.Value.Rotation);
    }

    private static MiniatureLoadingProgressHandler = (ev: ProgressEvent) => {
        LoadingBlocker.Message = 'Loading... ' + ((ev.loaded / ev.total) * 100).toFixed(0) + '%';
    }

    private static MiniatureLoadingErrorHandler = (ev: ErrorEvent) => {
        LoadingBlocker.Message = 'Error: ' + ev.message;
    }

    private static MiniatureLoadingFinishedHandler() {
        LoadingBlocker.Hide();

        Application.SetupTour();
    }

    private static SetupTour() {
        let tour = new Tour();
        
        let coordinateSystemPreviouslySet = LocalStorageManager.PreferredCoordinateSystemExists();
        if (coordinateSystemPreviouslySet) {
            let coordinateSystem = LocalStorageManager.LoadPreferredCoordinateSystem();
            Application.PreferredCoordinateSystem.Value = coordinateSystem;
            Application.ApplyPreferredCoordinateSystem();
        } else {
            tour.AddStep(() => {
                Application.ModesControl.SetCurrentModeByID(SetPreferredCoordinateSystemMode.ID);
                
                Application.PreferredCoordinateSystem.ValueChanged.SubscribeOnce(() => {
                    tour.NextStep();
                });
            });
        }
        
        let cameraSpecificationPreviouslySet = LocalStorageManager.PreferredCameraSpecificationExists();
        if (cameraSpecificationPreviouslySet) {
            let cameraSpecification = LocalStorageManager.LoadPreferredCameraSpecification();
            Application.PreferredCameraSpecification.Value = cameraSpecification;
            Application.ApplyPreferredCameraSpecification();
        } else {
            tour.AddStep(() => {
                Application.ModesControl.SetCurrentModeByID(SetPreferredCameraSpecificationMode.ID);
                
                Application.PreferredCameraSpecification.ValueChanged.SubscribeOnce(() => {
                    tour.NextStep();
                });
            });
        }
        
        let lightingSpecificationPreviouslySet = LocalStorageManager.LightingSpecificationExists();
        if (lightingSpecificationPreviouslySet) {
            let lightingSpecification = LocalStorageManager.LoadLightingSpecification();
            lightingSpecification.AdjustToPreferredCoordinateSystem(Application.PreferredCoordinateSystem.Value);

            Application.Theater.Lighting.Specification.Copy(lightingSpecification);
            Application.Theater.Lighting.Specification.OnChange();
        } else {
            tour.AddStep(() => {
                Application.ModesControl.SetCurrentModeByID(SetLightsMode.ID);

                Application.Theater.Lighting.Specification.Changed.SubscribeOnce(() => {
                    tour.NextStep();
                });
            });
        }

        let categoriesPreviouslySet = LocalStorageManager.CategoriesExist();
        if (categoriesPreviouslySet) {
            let categories = LocalStorageManager.LoadCategories();
            Application.CategoryManager.Copy(categories);
        } else {
            tour.AddStep(() => {
                Application.ModesControl.SetCurrentModeByID(CategoryManagementMode.ID);

                Application.CategoryManager.Changed.SubscribeOnce(() => {
                    tour.NextStep();
                });
            });
        }

        let needsTour = !coordinateSystemPreviouslySet || !cameraSpecificationPreviouslySet || !lightingSpecificationPreviouslySet;
        if(needsTour) {
            let instructions = Application.GetTourInstructions(tour);
            tour.InsertStep(instructions, 0);

            let finished = Application.GetTourFinished(tour);
            tour.AddStep(finished);
        }

        // TEMP: Start in a specific mode.
        tour.AddStep(() => {
            Application.ModesControl.SetCurrentModeByID(PointAnnotationMode.ID);

            // No next step.
        });

        // Start the tour!
        tour.NextStep();
    }

    private static GetTourInstructions(tour: Tour): () => void {
        // Show the tour instructions.
        let output = () => {
            // Move on in the tour when closed.
            InformationBox.Closed.SubscribeOnce(() => {
                tour.NextStep();
            })

            // Use a structured custom body.
            let body = document.createElement('div');

            let bodyIntroduction = document.createElement('p');
            body.appendChild(bodyIntroduction);
            bodyIntroduction.innerHTML = 'We will walkthrough setting up these settings:';

            let ul = document.createElement('ul');
            body.appendChild(ul);

            let coordinates = document.createElement('li');
            ul.appendChild(coordinates);
            coordinates.innerHTML = 'Coordinate System';

            let camera = document.createElement('li');
            ul.appendChild(camera);
            camera.innerHTML = 'Camera View';

            let lighting = document.createElement('li');
            ul.appendChild(lighting);
            lighting.innerHTML = 'Lights';

            // Show.
            InformationBox.ShowHtml(body, 'Welcome! Let\'s have a tour.');
        };

        return output;
    }

    private static GetTourFinished(tour: Tour): () => void {
        let output = () => {
            // Move on in the tour when closed.
            InformationBox.Closed.SubscribeOnce(() => {
                tour.NextStep();
            })

            InformationBox.Show('Tour finished.', 'Done!');
        };

        return output;
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

        // console.log(Application.Theater.Camera.position);

        // let dbg = Application.Theater.Camera;

        // let nullValue: number = null;
        // if(nullValue) {
        //     console.log('nullValue true');
        // } else {
        //     console.log('nullValue false');
        // }
        // let undefValue: number = undefined;
        // if(undefValue) {
        //     console.log('undefValue true');
        // } else {
        //     console.log('undefValue false');
        // }

        // let dbg = Application.Theater.Lighting.DirectionalLight;

        // let a: number[] = [];
        // a.push(1);
        // a.push(1);
        // a.push(1);

        // let json = JSON.stringify(a);

        InformationBox.Show('Hello!', 'A Hello');

        // MessageBox.Show('Hello!', 'A Hello.', 'AbortRetryIgnore');

        // let editor = new EditorBox<string>('', 'A String');
        // editor.Closed.Subscribe((result: EditorBoxResult<string>) => {
        //     console.log(`${result.Action}: ${result.Instance}`);
        // });
        // let body = editor.BodyHtmlElement;
        // let valueLabel = document.createElement('label');
        // body.appendChild(valueLabel);
        // valueLabel.innerHTML = 'Value:';
        // let valueText = document.createElement('input');
        // valueText.type = 'text';
        // body.appendChild(valueText);
        // valueText.placeholder = 'value...';
        // valueText.onchange = () => {
        //     editor.Instance = valueText.value;
        // };
        // editor.Show();
    }

    private static SubMain() {
        Application.Theater = new Theater();
        Application.Theater.AddAxes(); // Add these for now.
        Application.TrackballController = new TrackballController(Application.Theater);
        Application.Miniature = new Miniature(Application.Theater, Constants.ModelsPath, Constants.ObjFileName, Constants.MtlFileName);

        Application.ControlPanel = new ControlPanel();
        let scratchControl = new ScratchControl(Application.ControlPanel);
        scratchControl.Button.Click.Subscribe(Application.Scratch);

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
window.onload = Application.Main;