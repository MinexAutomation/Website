import { BoxSurfaceSelector } from "./BoxSurfaceSelector";
import { ButtonControl } from "../Controls/ButtonControl";
import { ControlPanel } from "../Controls/ControlPanel";
import { SphereGeometry, MeshBasicMaterial, Mesh, BoxGeometry, Color, Vector3 } from "three";
import { Application } from "../Application";
import { Box3My } from "../Classes/Box3My";

export class BoxSurfaceSelectorVisual {
    public static readonly BoxSelectorHtmlElementID: string = 'SurfaceAnnotations-BoxSelector';
    public static readonly DefaultCornerRadius: number = 0.5;
    public static readonly DefaultCorner1Color: number = 0xff0000;
    public static readonly DefaultCorner2Color: number = 0x00ff00;
    public static readonly DefaultBoxSize: number = 1;
    public static readonly DefaultBoxColor: Color = new Color('plum');


    private Selector: BoxSurfaceSelector;
    private ControlPanel: ControlPanel;

    private BoxSelectorHtmlElement: HTMLElement;
    private Corner1Button: ButtonControl;
    private Corner2Button: ButtonControl;
    private BoxSelectorFinishedButton: ButtonControl;

    private Corner1Geometry: SphereGeometry = new SphereGeometry(BoxSurfaceSelectorVisual.DefaultCornerRadius);
    private Corner1Material: MeshBasicMaterial = new MeshBasicMaterial({ color: BoxSurfaceSelectorVisual.DefaultCorner1Color });
    private Corner1Mesh: Mesh = new Mesh(this.Corner1Geometry, this.Corner1Material);

    private Corner2Geometry: SphereGeometry = new SphereGeometry(BoxSurfaceSelectorVisual.DefaultCornerRadius);
    private Corner2Material: MeshBasicMaterial = new MeshBasicMaterial({ color: BoxSurfaceSelectorVisual.DefaultCorner2Color });
    private Corner2Mesh: Mesh = new Mesh(this.Corner2Geometry, this.Corner2Material);

    private BoxGeometry: BoxGeometry = new BoxGeometry(BoxSurfaceSelectorVisual.DefaultBoxSize, BoxSurfaceSelectorVisual.DefaultBoxSize, BoxSurfaceSelectorVisual.DefaultBoxSize);
    private BoxMaterial: MeshBasicMaterial = new MeshBasicMaterial({ color: BoxSurfaceSelectorVisual.DefaultBoxColor, wireframe: true });
    private BoxMesh: Mesh = new Mesh(this.BoxGeometry, this.BoxMaterial);

    private MoveFunction: (x: number, y: number, z: number) => void;


    public constructor(selector: BoxSurfaceSelector, controlPanel: ControlPanel) {
        this.Selector = selector;
        this.ControlPanel = controlPanel;

        this.CreateBoxSelectorControls();
        this.ConnectEvents();

        Application.Theater.Scene.add(this.Corner1Mesh);
        Application.Theater.Scene.add(this.Corner2Mesh);
        Application.Theater.Scene.add(this.BoxMesh);
    }

    public Dispose(): void {
        Application.Theater.Scene.remove(this.Corner1Mesh);
        this.Corner1Material.dispose();
        this.Corner1Geometry.dispose();

        Application.Theater.Scene.remove(this.Corner2Mesh);
        this.Corner2Material.dispose();
        this.Corner2Geometry.dispose();

        Application.Theater.Scene.remove(this.BoxMesh);
        this.BoxMaterial.dispose();
        this.BoxGeometry.dispose();

        this.DisconnectEvents();
        this.DisposeBoxSelectorControls();
    }

    private ConnectEvents(): void {
        this.Selector.Changed.Subscribe(this.SelectorChangedHandler);

        window.addEventListener('keydown', this.WindowKeyDownHandler);

        this.SelectorChangedHandler();
        this.Corner1ClickHandler(); // Set the initial move object to be corner 1.
    }

    private DisconnectEvents(): void {
        this.Selector.Changed.Unsubscribe(this.SelectorChangedHandler);

        window.removeEventListener('keydown', this.WindowKeyDownHandler);
    }

    private SelectorChangedHandler = () => {
        this.Corner1Mesh.position.copy(this.Selector.Corner1);
        this.Corner2Mesh.position.copy(this.Selector.Corner2);

        let boundingBox = new Box3My();
        boundingBox.Update(
            this.Selector.Corner1.x, this.Selector.Corner2.x,
            this.Selector.Corner1.y, this.Selector.Corner2.y,
            this.Selector.Corner1.z, this.Selector.Corner2.z);

        let xSize = boundingBox.xMax - boundingBox.xMin;
        let ySize = boundingBox.yMax - boundingBox.yMin;
        let zSize = boundingBox.zMax - boundingBox.zMin;

        this.BoxMesh.scale.set(xSize, ySize, zSize);

        let newPosition = new Vector3(boundingBox.xMin + xSize / 2, boundingBox.yMin + ySize / 2, boundingBox.zMin + zSize / 2);
        this.BoxMesh.position.copy(newPosition);
    }

    private WindowKeyDownHandler = (ev: KeyboardEvent) => {
        switch (ev.keyCode) {
            // Right.
            case 68: // 'd'
            case 39: // right-arrow
                this.MoveFunction(1, 0, 0);
                break;

            // Left.
            case 65: // 'a'
            case 37: // left-arrow
                this.MoveFunction(-1, 0, 0);
                break;

            // Up.
            case 87: // 'w'
            case 38: // up-arrow
                this.MoveFunction(0, 1, 0);
                break;

            // Down.
            case 83: // 's'
            case 40: // down-arrow
                this.MoveFunction(0, -1, 0);
                break;

            // In.
            case 82: // 'r'
            case 16: // shft
                this.MoveFunction(0, 0, 1);
                break;

            // Out.
            case 70: // 'f'
            case 17: // ctrl
                this.MoveFunction(0, 0, -1);
                break;

            default:
                // Do nothing.
                break;
        }
    }

    private CreateBoxSelectorControls(): void {
        this.BoxSelectorHtmlElement = this.ControlPanel.CreateChildControlElement(BoxSurfaceSelectorVisual.BoxSelectorHtmlElementID);

        this.ControlPanel.CreateChildControlTitle(this.BoxSelectorHtmlElement, 'Box Selector');

        this.Corner1Button = new ButtonControl(this.BoxSelectorHtmlElement, 'Corner 1');
        this.Corner1Button.Click.Subscribe(this.Corner1ClickHandler);

        this.Corner2Button = new ButtonControl(this.BoxSelectorHtmlElement, 'Corner 2');
        this.Corner2Button.Click.Subscribe(this.Corner2ClickHandler);

        this.BoxSelectorFinishedButton = new ButtonControl(this.BoxSelectorHtmlElement, 'Finished');
        this.BoxSelectorFinishedButton.Click.Subscribe(this.BoxSelectorFinishedButtonClickHandler);
    }

    private DisposeBoxSelectorControls(): void {
        this.BoxSelectorHtmlElement.remove();
        this.BoxSelectorHtmlElement = null;
    }

    private Corner1ClickHandler = () => {
        this.MoveFunction = (x, y, z) => {
            this.Selector.Corner1 = this.Selector.Corner1.add(new Vector3(x, y, z));
        };
    }

    private Corner2ClickHandler = () => {
        this.MoveFunction = (x, y, z) => {
            this.Selector.Corner2 = this.Selector.Corner2.add(new Vector3(x, y, z));
        };
    }

    private BoxSelectorFinishedButtonClickHandler = () => {
        this.Dispose();
    }
}