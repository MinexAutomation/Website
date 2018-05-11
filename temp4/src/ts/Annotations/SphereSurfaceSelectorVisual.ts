import { SphereSurfaceSelector } from "./SphereSurfaceSelector";
import { ControlPanel } from "../Controls/ControlPanel";
import { ButtonControl } from "../Controls/ButtonControl";
import { SphereGeometry, MeshBasicMaterial, Color, Mesh, Vector3 } from "three";
import { Application } from "../Application";
import { CoordinateSystemConversion } from "../CoordinateSystemConversion";

export class SphereSurfaceSelectorVisual {
    public static readonly SphereSelectorHtmlElementID: string = 'SurfaceAnnotations-SphereSelector';
    public static readonly DefaultCenterRadius: number = 0.5;
    public static readonly DefaultCenterColor: Color = new Color(0xff0000);
    public static readonly DefaultSphereRadius: number = 1;
    public static readonly DefaultSphereColor: Color = new Color('plum');


    private Selector: SphereSurfaceSelector;
    private ControlPanel: ControlPanel;

    private SphereSelectorHtmlElement: HTMLElement;
    private CenterButton: ButtonControl;
    private RadiusButton: ButtonControl;
    private SphereSelectorFinishedButton: ButtonControl;

    private CenterGeometry: SphereGeometry = new SphereGeometry(SphereSurfaceSelectorVisual.DefaultCenterRadius);
    private CenterMaterial: MeshBasicMaterial = new MeshBasicMaterial({ color: SphereSurfaceSelectorVisual.DefaultCenterColor });
    private CenterMesh: Mesh = new Mesh(this.CenterGeometry, this.CenterMaterial);

    private SphereGeometry: SphereGeometry = new SphereGeometry(SphereSurfaceSelectorVisual.DefaultSphereRadius);
    private SphereMaterial: MeshBasicMaterial = new MeshBasicMaterial({ color: SphereSurfaceSelectorVisual.DefaultSphereColor, wireframe: true });
    private SphereMesh: Mesh = new Mesh(this.SphereGeometry, this.SphereMaterial);


    public constructor(selector: SphereSurfaceSelector, controlPanel: ControlPanel) {
        this.Selector = selector;
        this.ControlPanel = controlPanel;

        this.CreateSphereSelectorControls();
        this.ConnectEvents();

        Application.Theater.Scene.add(this.CenterMesh);
        Application.Theater.Scene.add(this.SphereMesh);
    }

    public Dispose(): void {
        Application.Theater.Scene.remove(this.CenterMesh);
        this.CenterMaterial.dispose();
        this.CenterGeometry.dispose();

        Application.Theater.Scene.remove(this.SphereMesh);
        this.SphereMaterial.dispose();
        this.SphereGeometry.dispose();

        this.DisconnectEvents();
        this.DisposeSphereSelectorControls();
    }

    private ConnectEvents(): void {
        this.Selector.Changed.Subscribe(this.SelectorChangedHandler);

        window.addEventListener('keydown', this.WindowKeyDownHandler);

        this.SelectorChangedHandler();
    }

    private DisconnectEvents(): void {
        this.Selector.Changed.Unsubscribe(this.SelectorChangedHandler);

        window.removeEventListener('keydown', this.WindowKeyDownHandler);
    }

    private SelectorChangedHandler = () => {
        this.CenterMesh.position.copy(this.Selector.Center);
        this.SphereMesh.position.copy(this.Selector.Center);

        this.SphereMesh.scale.set(this.Selector.Radius, this.Selector.Radius, this.Selector.Radius);
    }

    private WindowKeyDownHandler = (ev: KeyboardEvent) => {
        switch (ev.keyCode) {
            // Right.
            case 68: // 'd'
            case 39: // right-arrow
                this.Selector.Center = this.Selector.Center.add(new Vector3(1, 0, 0));
                break;

            // Left.
            case 65: // 'a'
            case 37: // left-arrow
                this.Selector.Center = this.Selector.Center.add(new Vector3(-1, 0, 0));
                break;

            // Up.
            case 87: // 'w'
            case 38: // up-arrow
                this.Selector.Center = this.Selector.Center.add(new Vector3(0, 1, 0));
                break;

            // Down.
            case 83: // 's'
            case 40: // down-arrow
                this.Selector.Center = this.Selector.Center.add(new Vector3(0, -1, 0));
                break;

            // In.
            case 82: // 'r'
            case 16: // shft
                this.Selector.Center = this.Selector.Center.add(new Vector3(0, 0, 1));
                break;

            // Out.
            case 70: // 'f'
            case 17: // ctrl
                this.Selector.Center = this.Selector.Center.add(new Vector3(0, 0, -1));
                break;

            // Increase radius.
            case 84: // 't'
            case 107: // add
                this.Selector.Radius = this.Selector.Radius + 1;
                break;

            // Decrease radius.
            case 71: // 'g'
            case 109: // subtract
                this.Selector.Radius = this.Selector.Radius - 1;
                break;

            default:
                // Do nothing.
                break;
        }
    }

    private CreateSphereSelectorControls(): void {
        this.SphereSelectorHtmlElement = this.ControlPanel.CreateChildControlElement(SphereSurfaceSelectorVisual.SphereSelectorHtmlElementID);

        this.ControlPanel.CreateChildControlTitle(this.SphereSelectorHtmlElement, 'Sphere Selector');

        this.CenterButton = new ButtonControl(this.SphereSelectorHtmlElement, 'Center');

        this.RadiusButton = new ButtonControl(this.SphereSelectorHtmlElement, 'Radius');

        this.SphereSelectorFinishedButton = new ButtonControl(this.SphereSelectorHtmlElement, 'Finished');
        this.SphereSelectorFinishedButton.Click.Subscribe(this.SphereSelectorFinishedClick);
    }

    private DisposeSphereSelectorControls(): void {
        this.SphereSelectorHtmlElement.remove();
        this.SphereSelectorHtmlElement = null;
    }

    private SphereSelectorFinishedClick = () => {
        this.Dispose();
    }
}