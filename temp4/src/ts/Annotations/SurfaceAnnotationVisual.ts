import { Application } from "../Application";
import { MeshBasicMaterial, Mesh, Side, DoubleSide, Object3D, Group } from "three";
import { SurfaceAnnotation } from "./SurfaceAnnotation";
import { VisualSpecification } from "../Classes/VisualSpecification";


export class SurfaceAnnotationVisual {
    private zAnnotation: SurfaceAnnotation;
    public get Annotation(): SurfaceAnnotation {
        return this.zAnnotation;
    }

    private zVisualSpecification: VisualSpecification = null;
    public get VisualSpecification(): VisualSpecification {
        return this.zVisualSpecification;
    }
    public set VisualSpecification(v: VisualSpecification) {
        if (null !== this.zVisualSpecification) {
            this.zVisualSpecification.Changed.Unsubscribe(this.VisualSpecificationChangedHandler);
        }

        this.zVisualSpecification = v;

        this.zVisualSpecification.Changed.Subscribe(this.VisualSpecificationChangedHandler);

        this.OnVisualSpecificationChanged();
    }
    private OnVisualSpecificationChanged(): void {
        this.VisualSpecificationChangedHandler();
    }

    private Material: MeshBasicMaterial;
    private Mesh: Mesh;
    private Object: Group;


    public constructor(annotation: SurfaceAnnotation) {
        this.zAnnotation = annotation;

        this.Material = new MeshBasicMaterial();
        this.Material.side = DoubleSide;
        this.Material.transparent = true; // This allows the opacity to be controlled.
        this.Mesh = new Mesh(this.zAnnotation.Geometry, this.Material);
        this.Object = new Group();
        this.Object.children.push(this.Mesh);
        Application.Theater.Scene.add(this.Object);

        this.Mesh.applyMatrix(Application.PreferredCoordinateSystem.Value.GetTransformationMatrix());

        this.ConnectEvents();
    }

    private IsDisposed: boolean = false;
    public Dispose(): void {
        if (!this.IsDisposed) {
            Application.Theater.Scene.remove(this.Object);

            this.Material.dispose();

            this.DisconnectEvents();

            this.IsDisposed = true;
        }
    }

    private ConnectEvents(): void {
        this.zAnnotation.CategoryChanged.Subscribe(this.AnnotationCategoryChangedHandler);
        this.zAnnotation.Disposed.Subscribe(this.AnnotationDisposedHandler);
        this.SetVisualSpecification();
    }

    private DisconnectEvents(): void {
        this.zAnnotation.CategoryChanged.Unsubscribe(this.AnnotationCategoryChangedHandler);
        this.zAnnotation.Disposed.Unsubscribe(this.AnnotationDisposedHandler);
        if (null !== this.zVisualSpecification) {
            this.zVisualSpecification.Changed.Unsubscribe(this.VisualSpecificationChangedHandler);
        }
    }

    private SetVisualSpecification(): void {
        if (null === this.Annotation.Category) {
            this.VisualSpecification = this.Annotation.VisualSpecification;
        } else {
            this.VisualSpecification = this.Annotation.Category.Visuals;
        }
    }

    private AnnotationCategoryChangedHandler = () => {
        this.SetVisualSpecification();
    }

    private VisualSpecificationChangedHandler = () => {
        let color = this.VisualSpecification.Color;
        this.Material.color.setRGB(color.R, color.G, color.B);
        this.Material.opacity = this.VisualSpecification.Transparency;
    }

    private AnnotationDisposedHandler = () => {
        this.Dispose();
    }

    /**
     * Hides, but does not dispose of, a visual.
     */
    public Hide(): void {
        this.Object.visible = false;
    }

    /**
     * Shows a visual that may have been hidden.
     */
    public Show(): void {
        this.Object.visible = true;
    }
}