import { Application } from "../Application";
import { ButtonControl } from "../Controls/ButtonControl";
import { ControlPanel } from "../Controls/ControlPanel";
import { IMode } from "./Mode";
import { SignalEvent, ISignalEvent } from "../Common/Events/SignalEvent";
import { EventedArrayChanged } from "../Common/EventedArray";
import { PointAnnotation } from "../Annotations/PointAnnotation";
import { LocalStorageManager } from "../LocalStorageManager";

import { CoordinateSystemConversion } from "../CoordinateSystemConversion";
import { Vector3, InstancedBufferAttribute, Raycaster, error, EditorControls } from "three";
import { Vector3My } from "../Classes/Vectors/Vector3My";
import { PointVisualsManager } from "../Classes/PointVisualsManager";
import { Category } from "../Annotations/Category";
import { VisualSpecification } from "../Classes/VisualSpecification";
import { PointAnnotationEditorBox } from "../Annotations/PointAnnotationEditorBox";
import { EditorBoxResult } from "../Common/Boxes/EditorBox";
import { SimpleEvent } from "../Common/Events/SimpleEvent";


export class PointAnnotationMode implements IMode {
    public static readonly ID: string = 'pointAnnotation';
    public static readonly PluralHtmlElementID: string = 'PointAnnotations-Plural';
    public static readonly SingularHtmlElementID: string = 'PointAnnotations-Singular';
    public static readonly DummyAnnotationID: number = -1;
    public static readonly DummyAnnotationName: string = '- None -';


    public get ID(): string {
        return PointAnnotationMode.ID;
    }
    private zDisposed: SignalEvent = new SignalEvent();
    public get Disposed(): ISignalEvent {
        return this.zDisposed.AsEvent();
    }
    private Annotations = Application.PointAnnotationsManager;
    private AnnotationVisuals = new Array<PointVisualsManager>();
    private zSelectedAnnotation: PointAnnotation = null;
    public get SelectedAnnotation(): PointAnnotation {
        return this.zSelectedAnnotation;
    }
    public set SelectedAnnotation(value: PointAnnotation) {
        this.zSelectedAnnotation = value;

        this.SetSelectSelectedIndex();
        this.SetSelectedControls();
    }
    private readonly PluralHtmlElement: HTMLElement
    private readonly LoadButton: ButtonControl;
    private readonly SaveButton: ButtonControl;
    private readonly FinishedButton: ButtonControl;
    private readonly SingularHtmlElement: HTMLElement;
    private readonly AddButton: ButtonControl;
    private readonly Select: HTMLSelectElement;
    private readonly SelectButton: ButtonControl;
    private readonly MoveButton: ButtonControl;
    private readonly EditButton: ButtonControl;
    private readonly RemoveButton: ButtonControl;


    public constructor(controlPanel: ControlPanel) {
        // Setup controls.
        this.PluralHtmlElement = controlPanel.CreateChildControlElement(PointAnnotationMode.PluralHtmlElementID);

        controlPanel.CreateChildControlTitle(this.PluralHtmlElement, 'Point Annotations');

        this.LoadButton = new ButtonControl(this.PluralHtmlElement, 'Load');
        this.LoadButton.Click.Subscribe(this.LoadClick);

        this.SaveButton = new ButtonControl(this.PluralHtmlElement, 'Save');
        this.SaveButton.Click.Subscribe(this.SaveClick);

        this.FinishedButton = new ButtonControl(this.PluralHtmlElement, 'Finished');
        this.FinishedButton.Click.Subscribe(this.FinishedClick);

        this.SingularHtmlElement = controlPanel.CreateChildControlElement(PointAnnotationMode.SingularHtmlElementID);

        controlPanel.CreateChildControlTitle(this.SingularHtmlElement, 'Point Annotation');

        this.AddButton = new ButtonControl(this.SingularHtmlElement, 'Add');
        this.AddButton.Click.Subscribe(this.AddClick);

        let hr = document.createElement('hr');
        this.SingularHtmlElement.appendChild(hr);

        this.Select = document.createElement('select');
        this.SingularHtmlElement.appendChild(this.Select);
        this.FillSelect();
        this.Select.onchange = this.OnSelectChanged;

        let hr2 = document.createElement('hr');
        this.SingularHtmlElement.appendChild(hr2);

        this.SelectButton = new ButtonControl(this.SingularHtmlElement, 'Select');
        this.SelectButton.Click.Subscribe(this.SelectClick);

        let hr3 = document.createElement('hr');
        this.SingularHtmlElement.appendChild(hr3);

        this.MoveButton = new ButtonControl(this.SingularHtmlElement, 'Move');
        this.MoveButton.Click.Subscribe(this.MoveClick);

        this.EditButton = new ButtonControl(this.SingularHtmlElement, 'Edit');
        this.EditButton.Click.Subscribe(this.EditClick);

        this.RemoveButton = new ButtonControl(this.SingularHtmlElement, 'Remove');
        this.RemoveButton.Click.Subscribe(this.RemoveClick);

        // Connect to events of the annotation array.
        this.Annotations.Changed.Subscribe((changed: EventedArrayChanged<PointAnnotation>) => this.AnnotationsChanged(changed));

        // Place the initial annotations.
        this.ResetAnnotations();

        this.SetSelectedControls();
    }

    public Dispose(): void {
        this.DisconnectEvents();

        this.SingularHtmlElement.remove();
        this.PluralHtmlElement.remove();

        this.AnnotationVisuals.forEach(visual => {
            visual.Dispose();
        });
        this.AnnotationVisuals.splice(0);

        this.zDisposed.Dispatch();
    }

    /**
     * Set the index of the select dropdown based on what annotation has been selected via mouse.
     */
    private SetSelectSelectedIndex(): void {
        if (null === this.SelectedAnnotation) {
            this.Select.selectedIndex = 0;
            return;
        }

        for (let iOption = 0; iOption < this.Select.childNodes.length; iOption++) {
            const option = <HTMLOptionElement>this.Select.childNodes[iOption];
            if (this.SelectedAnnotation.ID.toString() === option.value) {
                this.Select.selectedIndex = iOption;
                break;
            }
        }
    }

    private OnSelectChanged = () => {
        // Get the selected option.
        let option = <HTMLOptionElement>this.Select.childNodes[this.Select.selectedIndex];

        // If we have selected the none option, set the selected annotation to null.
        if (PointAnnotationMode.DummyAnnotationID.toString() === option.value) {
            this.SelectedAnnotation = null;
            return;
        }

        // Determine the point annotation from the ID.
        let annotations = this.Annotations.Values;
        for (let iAnnotation = 0; iAnnotation < annotations.length; iAnnotation++) {
            const annotation = annotations[iAnnotation];
            if (annotation.ID.toString() === option.value) {
                this.SelectedAnnotation = annotation;
                return;
            }
        }

        console.error(`Annotation ${option.value}-${option.innerHTML} not found, but was selected via select dropdown.`);
    }

    private SetSelectedControls(): void {
        if (null === this.zSelectedAnnotation) {
            this.DisableSelectedControls();
        } else {
            this.EnableSelectedControls();
        }
    }

    private EnableSelectedControls(): void {
        this.MoveButton.Enable();
        this.EditButton.Enable();
        this.RemoveButton.Enable();
    }

    private DisableSelectedControls(): void {
        this.MoveButton.Disable();
        this.EditButton.Disable();
        this.RemoveButton.Disable();
    }

    private FillSelect() {
        // Remove all children, if present.
        while (this.Select.firstChild) {
            this.Select.removeChild(this.Select.firstChild);
        }

        // Add a first, default, none child.
        let option = document.createElement('option');
        this.Select.appendChild(option);
        option.value = PointAnnotationMode.DummyAnnotationID.toString();
        option.innerHTML = PointAnnotationMode.DummyAnnotationName;

        // Add children.
        this.Annotations.Values.forEach(value => {
            let option = document.createElement('option');
            this.Select.appendChild(option);
            option.value = value.ID.toString();
            option.innerHTML = value.Name;
        });

        // Set the selected index to match the selected annotation.
        if (null === this.SelectedAnnotation) {
            this.Select.selectedIndex = 0;
        } else {
            for (let iIndex = 0; iIndex < this.Select.childNodes.length; iIndex++) {
                const option = <HTMLOptionElement>this.Select.childNodes[iIndex];
                if (this.SelectedAnnotation.ID.toString() === option.value) {
                    this.Select.selectedIndex = iIndex;
                    break;
                }
            }
        }
    }

    private DisconnectEvents(): void {
        this.Annotations.Changed.Unsubscribe(this.AnnotationsChanged);
    }

    private AnnotationsChanged(changed: EventedArrayChanged<PointAnnotation>) {
        switch (changed.Type) {
            case 'Added':
                this.AddAnnotationVisual(changed.Value);
                break;

            case 'Inserted':
                this.AddAnnotationVisual(changed.Value);
                break;

            case 'Removed':
                this.RemoveAnnotation(changed.Value);
                break;

            case 'Reset':
                this.ResetAnnotations();
                break;

            default:
                // Do nothing.
                break;
        }

        // Update the select.
        this.FillSelect();
    }

    private AddAnnotationVisual(annotation: PointAnnotation): void {
        let annotationVisual = new PointVisualsManager(annotation);
        this.AnnotationVisuals.push(annotationVisual);
    }

    private RemoveAnnotation(annotation: PointAnnotation): void {
        for (let iIndex = 0; iIndex < this.AnnotationVisuals.length; iIndex++) {
            const visual = this.AnnotationVisuals[iIndex];
            if (visual.PointAnnotation === annotation) {
                this.AnnotationVisuals.splice(iIndex, 1);
                visual.Dispose();
            }
        }
    }

    private ResetAnnotations(): void {
        // Remove all.
        for (let iIndex = 0; iIndex < this.AnnotationVisuals.length; iIndex++) {
            const visual = this.AnnotationVisuals[iIndex];
            visual.Dispose();
        }
        this.AnnotationVisuals.splice(0);

        // Add for each annotation.
        let values = this.Annotations.Values;
        for (let iAnnotation = 0; iAnnotation < values.length; iAnnotation++) {
            const annotation = values[iAnnotation];
            this.AddAnnotationVisual(annotation);
        }
    }

    private LoadClick = () => {
        let loaded = LocalStorageManager.LoadPointAnnotations();
        this.Annotations.Copy(loaded);

        this.FillSelect();
    }

    private SaveClick = () => {
        LocalStorageManager.SavePointAnnotations(this.Annotations);
    }

    private FinishedClick = () => {
        this.SaveClick(); // Save.
        this.Dispose(); // Dispose.
    }

    private AddClick = () => {
        this.SetupAddPointAnnotationMode();
    }

    private SetupAddPointAnnotationMode(): void {
        this.SelectButton.Disable();

        Application.TrackballController.Controls.enabled = false;
        Application.Theater.Renderer.domElement.addEventListener("mousedown", this.AddPointWebGLOutputMouseDown);

        window.addEventListener('keydown', this.AddPointAnnotationModeKeyDown);
    }

    private TeardownAddPointAnnotationMode(): void {
        this.SelectButton.Enable();

        Application.TrackballController.Controls.enabled = true;
        Application.Theater.Renderer.domElement.removeEventListener("mousedown", this.AddPointWebGLOutputMouseDown);

        window.removeEventListener('keydown', this.AddPointAnnotationModeKeyDown);
    }

    private AddPointAnnotationModeKeyDown = (event: KeyboardEvent) => {
        switch (event.keyCode) {
            case 27: // Escape
                this.TeardownAddPointAnnotationMode();
                break;
        }
    }

    private AddPointWebGLOutputMouseDown = (event: MouseEvent) => {
        let camera = Application.Theater.Camera;
        let scene = Application.Theater.Scene;

        let vector = new Vector3((event.clientX / window.innerWidth) * 2 - 1, -(event.clientY / window.innerHeight) * 2 + 1, 0.5);
        vector = vector.unproject(camera);

        let raycaster = new Raycaster(camera.position, vector.sub(camera.position).normalize());

        // Were any already added points hit?
        let meshes = Application.PointMeshes.Values;
        let pointIntersects = raycaster.intersectObjects(meshes);
        if (pointIntersects.length > 0) {
            console.log('You hit an already existing point!');
        } else {
            console.log('No points hit.');

            // Add a point if we clicked anywhere on the miniature.
            let miniatureIntersects = raycaster.intersectObjects(Application.Miniature.Object.children);
            if (0 < miniatureIntersects.length) {
                console.log('You hit the miniature.')

                let firstIntersect = miniatureIntersects[0];
                this.AddAnnotation(firstIntersect.point);

                this.TeardownAddPointAnnotationMode();
            } else {
                console.log('Miniature not hit.')
            }
        }
    }

    private AddAnnotation(preferredLocation: Vector3) {
        let standardLocation = CoordinateSystemConversion.ConvertPointPreferredToStandard(preferredLocation, Application.PreferredCoordinateSystem.Value);
        let standardLocationMy = new Vector3My();
        standardLocationMy.FromVector3(standardLocation);

        let ID = this.Annotations.GetNextID();
        let annotation = new PointAnnotation(ID, 'Annotation ' + ID, undefined, undefined, undefined, standardLocationMy);
        this.Annotations.Add(annotation); // Will add the visual automatically.

        this.SelectedAnnotation = annotation;

        this.FillSelect();

        this.EditAnnotationInEditor(annotation);
    }

    private SelectClick = () => {
        this.SetupSelectPointAnnotationMode();
    }

    private SetupSelectPointAnnotationMode(): void {
        this.AddButton.Disable();

        Application.TrackballController.Controls.enabled = false;
        Application.Theater.Renderer.domElement.addEventListener("mousedown", this.SelectPointWebGLOutputMouseDown);

        window.addEventListener('keydown', this.SelectPointAnnotationModeKeyDown);
    }

    private TeardownSelectPointAnnotationMode(): void {
        this.AddButton.Enable();

        Application.TrackballController.Controls.enabled = true;
        Application.Theater.Renderer.domElement.removeEventListener("mousedown", this.SelectPointWebGLOutputMouseDown);

        window.removeEventListener('keydown', this.SelectPointAnnotationModeKeyDown);
    }

    private SelectPointAnnotationModeKeyDown = (event: KeyboardEvent) => {
        switch (event.keyCode) {
            case 27: // Escape
                this.TeardownSelectPointAnnotationMode();
                break;
        }
    }

    private SelectPointWebGLOutputMouseDown = (event: MouseEvent) => {
        let camera = Application.Theater.Camera;
        let scene = Application.Theater.Scene;

        let vector = new Vector3((event.clientX / window.innerWidth) * 2 - 1, -(event.clientY / window.innerHeight) * 2 + 1, 0.5);
        vector = vector.unproject(camera);

        let raycaster = new Raycaster(camera.position, vector.sub(camera.position).normalize());

        // Were any already added points hit?
        let meshes = Application.PointMeshes.Values;
        let pointIntersects = raycaster.intersectObjects(meshes);
        if (pointIntersects.length > 0) {
            console.log('You hit an already existing point!');

            let firstIntersect = pointIntersects[0];
            let selectedObject = firstIntersect.object;

            // Get the annotation for the mesh, by first finding the PointVisualsManager for the selected mesh, then finding the PointAnnotation for the visuals.
            let selectedAnnotationVisual: PointVisualsManager = null;
            for (let iVisual = 0; iVisual < this.AnnotationVisuals.length; iVisual++) {
                const visual = this.AnnotationVisuals[iVisual];
                if (visual.Mesh === selectedObject) {
                    selectedAnnotationVisual = visual;
                    break;
                }
            }
            if (null === selectedAnnotationVisual) {
                console.error('Unable to find point annotation visual for selected object.');
            }

            let annotations = this.Annotations.Values;
            let selectedAnnotation: PointAnnotation = null;
            for (let iAnnotation = 0; iAnnotation < annotations.length; iAnnotation++) {
                const annotation = annotations[iAnnotation];
                if (annotation === selectedAnnotationVisual.PointAnnotation) {
                    selectedAnnotation = annotation;
                    break;
                }
            }
            if (null === selectedAnnotation) {
                console.error('Unable to find point annotation for selected point annotation visual.');
            }

            this.SelectedAnnotation = selectedAnnotation;

            this.TeardownSelectPointAnnotationMode();
        } else {
            console.log('No points hit.');
        }
    }

    private MoveClick = () => {
        this.SetupMoveMode();
    }

    private SetupMoveMode(): void {
        this.AddButton.Disable();
        this.SelectButton.Disable();
        this.EditButton.Disable();
        this.RemoveButton.Disable();

        Application.TrackballController.Controls.enabled = false;
        Application.Theater.Renderer.domElement.addEventListener("mousedown", this.MoveModeWebGLOutputMouseDown);

        window.addEventListener('keydown', this.MoveModeKeyDown);
    }

    private TeardownMoveMode(): void {
        this.AddButton.Enable();
        this.SelectButton.Enable();
        this.EditButton.Enable();
        this.RemoveButton.Enable();

        Application.TrackballController.Controls.enabled = true;
        Application.Theater.Renderer.domElement.removeEventListener("mousedown", this.MoveModeWebGLOutputMouseDown);

        window.removeEventListener('keydown', this.MoveModeKeyDown);
    }

    private MoveModeKeyDown = (event: KeyboardEvent) => {
        switch (event.keyCode) {
            case 27: // Escape
                this.TeardownMoveMode();
                break;
        }
    }

    private MoveModeWebGLOutputMouseDown = (event: MouseEvent) => {
        let camera = Application.Theater.Camera;
        let scene = Application.Theater.Scene;

        let vector = new Vector3((event.clientX / window.innerWidth) * 2 - 1, -(event.clientY / window.innerHeight) * 2 + 1, 0.5);
        vector = vector.unproject(camera);

        let raycaster = new Raycaster(camera.position, vector.sub(camera.position).normalize());

        // Were any already added points hit?
        let meshes = Application.PointMeshes.Values;
        let pointIntersects = raycaster.intersectObjects(meshes);
        if (pointIntersects.length > 0) {
            console.log('You hit an already existing point!');
        } else {
            console.log('No points hit.');

            // Add a point if we clicked anywhere on the miniature.
            let miniatureIntersects = raycaster.intersectObjects(Application.Miniature.Object.children);
            if (0 < miniatureIntersects.length) {
                console.log('You hit the miniature.')

                let firstIntersect = miniatureIntersects[0];

                let preferredLocation = firstIntersect.point;
                let standardLocation = CoordinateSystemConversion.ConvertPointPreferredToStandard(preferredLocation, Application.PreferredCoordinateSystem.Value);
                this.SelectedAnnotation.StandardLocation.FromVector3(standardLocation); // Visual location will update via events.

                this.TeardownMoveMode();
            } else {
                console.log('Miniature not hit.')
            }
        }
    }

    private EditClick = () => {
        let option = <HTMLOptionElement>this.Select.children[this.Select.selectedIndex];
        let annotation = this.Annotations.GetByIDString(option.value);

        this.EditAnnotationInEditor(annotation);
    }

    private EditAnnotationInEditor(annotation: PointAnnotation): void {
        let instanceForEdit = annotation.Clone();

        let editor = new PointAnnotationEditorBox(instanceForEdit);
        editor.Closed.SubscribeOnce(this.EditorClosed);

        editor.Show();
    }

    private RemoveClick = () => {
        let option = <HTMLOptionElement>this.Select.children[this.Select.selectedIndex];

        if (option.value !== PointAnnotationMode.DummyAnnotationID.toString()) {
            let annotation = this.Annotations.GetByIDString(option.value);
            this.Annotations.Remove(annotation);

            this.FillSelect();
        }
    }

    private EditorClosed = (result: EditorBoxResult<PointAnnotation>) => {
        if (result.Action === 'Accept') {
            let annotation = this.Annotations.GetByID(result.Instance.ID);
            annotation.Copy(result.Instance);
        }

        this.FillSelect();
    }
}