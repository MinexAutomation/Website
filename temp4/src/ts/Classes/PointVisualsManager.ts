import { PointAnnotation } from "../Annotations/PointAnnotation";
import { Application } from "../Application";
import { Mesh, MeshBasicMaterial, SphereGeometry } from "three";
import { CoordinateSystemConversion } from "../CoordinateSystemConversion";
import { Vector3My } from "./Vectors/Vector3My";
import { Category } from "../Annotations/Category";
import { VisualSpecification } from "./VisualSpecification";


export class PointVisualsManager {
    private zPointAnnotation: PointAnnotation;
    public get PointAnnotation(): PointAnnotation {
        return this.zPointAnnotation;
    }
    private Visuals: VisualSpecification = null;
    private Geometry: SphereGeometry;
    private Material: MeshBasicMaterial;
    private zMesh: Mesh;
    public get Mesh(): Mesh {
        return this.zMesh;
    }


    public constructor(pointAnnotation: PointAnnotation) {
        this.zPointAnnotation = pointAnnotation;

        // Create the visual.
        this.Geometry = new SphereGeometry(1);
        this.Material = new MeshBasicMaterial({ color: 0x0000ff });
        this.Material.transparent = true; // This allows the opacity to be controlled.
        this.zMesh = new Mesh(this.Geometry, this.Material);
        Application.PointMeshes.Add(this.zMesh);
        Application.Theater.Scene.add(this.zMesh);

        // Listen for updates to the point annotation.
        this.zPointAnnotation.CategoryChanged.Subscribe(this.CategoryChangedHandler);
        this.zPointAnnotation.StandardLocationChanged.Subscribe(this.StandardLocationChangedHandler);

        this.ProcessLocation();
        this.SetVisuals();
        this.ProcessVisuals();
    }

    public Dispose(): void {
        this.zPointAnnotation.CategoryChanged.Unsubscribe(this.CategoryChangedHandler);
        this.zPointAnnotation.StandardLocationChanged.Unsubscribe(this.StandardLocationChangedHandler);

        Application.Theater.Scene.remove(this.zMesh);
        this.Geometry.dispose(); // From: https://github.com/mrdoob/three.js/blob/master/examples/webgl_test_memory.html
        this.Material.dispose();
    }

    private CategoryChangedHandler = (category: Category) => {
        this.SetVisuals();
    }

    private StandardLocationChangedHandler = (standardLocation: Vector3My) => {
        this.ProcessLocation();
    }

    private ProcessLocation(): void {
        // Position the visual mesh.
        let standardPosition = this.zPointAnnotation.StandardLocation.ToVector3();
        let preferredPosition = CoordinateSystemConversion.ConvertPointStandardToPreferred(standardPosition, Application.PreferredCoordinateSystem.Value);
        this.zMesh.position.copy(preferredPosition);
    }

    /**
     * If the point annotation has a non-null category, use the category's visuals. Else, use the point-annotation's own visuals.
     */
    private SetVisuals(): void {
        if(null !== this.Visuals) {
            this.Visuals.Changed.Unsubscribe(this.VisualsChangedHandler);
        }

        if(null === this.zPointAnnotation.Category) {
            this.Visuals = this.zPointAnnotation.Visuals;
        } else {
            this.Visuals = this.zPointAnnotation.Category.Visuals;
            this.ProcessVisuals();
        }

        this.Visuals.Changed.Subscribe(this.VisualsChangedHandler);
    }

    private VisualsChangedHandler = (visuals: VisualSpecification) => {
        this.ProcessVisuals();
    }

    private ProcessVisuals(): void {
        // Color, size, and transpare the visual mesh.
        this.Material.color.r = this.Visuals.Color.R;
        this.Material.color.g = this.Visuals.Color.G;
        this.Material.color.b = this.Visuals.Color.B;
        this.zMesh.scale.set(this.Visuals.Size, this.Visuals.Size, this.Visuals.Size);
        this.Material.opacity = this.Visuals.Transparency;
    }
}