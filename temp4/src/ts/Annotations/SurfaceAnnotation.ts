import { Application } from "../Application";
import { Category } from "./Category";
import { Geometry, BufferGeometry, Vector3, Face3 } from "three";
import { SimpleEvent, ISimpleEvent } from "../Common/Events/SimpleEvent";
import { ISurfaceSelector } from "./ISurfaceSelector";
import { VisualSpecification } from "../Classes/VisualSpecification";
import { SignalEvent, ISignalEvent } from "../Common/Events/SignalEvent";
import { IIdentified } from "../Common/Interfaces/IIdentified";
import { ISurfaceAnnotationStorage } from "./ISurfaceAnnotationStorage";
import { SurfaceSelectorLocalStorageManager } from "./SurfaceSelectorLocalStorageManager";
import { GeometryLocalStorageManager } from "../Classes/GeometryLocalStorageManager";


export class SurfaceAnnotation implements IIdentified {
    /**
     * An integer ID.
     */
    public ID: number;
    public Name: string;
    public Description: string;

    private zSelector: ISurfaceSelector = null;
    public get Selector(): ISurfaceSelector {
        return this.zSelector;
    }
    public set Selector(v: ISurfaceSelector) {
        if (this.zSelector) {
            this.zSelector.Changed.Unsubscribe(this.SelectorChangedHandler);
        }

        this.zSelector = v;

        if (this.zSelector) {
            this.zSelector.Changed.Subscribe(this.SelectorChangedHandler);

            this.OnSelectorChanged();
        }
    }
    private SelectorChangedHandler = () => {
        this.OnSelectorChanged();
    }
    private zSelectorChanged: SimpleEvent<ISurfaceSelector> = new SimpleEvent<ISurfaceSelector>();
    public get SelectorChanged(): ISimpleEvent<ISurfaceSelector> {
        return this.zSelectorChanged.AsEvent();
    }
    private OnSelectorChanged(): void {
        this.UpdateGeometry();

        this.zSelectorChanged.Dispatch(this.zSelector);
    }

    private zVisualSpecification: VisualSpecification = null;
    public get VisualSpecification(): VisualSpecification {
        return this.zVisualSpecification;
    }
    public set VisualSpecification(v: VisualSpecification) {
        if (null !== this.zVisualSpecification) {
            this.zVisualSpecification.Changed.Unsubscribe(this.VisualSpecificationChangedHandler)
        }

        this.zVisualSpecification = v;

        this.zVisualSpecification.Changed.Subscribe(this.VisualSpecificationChangedHandler);

        this.OnVisualSpecificationChanged();
    }
    private VisualSpecificationChangedHandler = () => {
        this.OnVisualSpecificationChanged();
    }
    private zVisualSpecificationChanged: SimpleEvent<VisualSpecification> = new SimpleEvent<VisualSpecification>();
    public get VisualSpecificationChanged(): ISimpleEvent<VisualSpecification> {
        return this.zVisualSpecificationChanged.AsEvent();
    }
    private OnVisualSpecificationChanged(): void {
        this.zVisualSpecificationChanged.Dispatch(this.zVisualSpecification);
    }

    private zCategory: Category = null;
    public get Category(): Category {
        return this.zCategory;
    }
    public set Category(v: Category) {
        if (null !== this.zCategory) {
            this.zCategory.Changed.Unsubscribe(this.CategoryChangedHandler);
        }

        this.zCategory = v;

        if (null !== this.zCategory) {
            this.zCategory.Changed.Subscribe(this.CategoryChangedHandler);
        }

        this.OnCategoryChanged();
    }
    private CategoryChangedHandler = () => {
        this.OnCategoryChanged();
    }
    private zCategoryChanged: SimpleEvent<Category> = new SimpleEvent<Category>();
    public get CategoryChanged(): ISimpleEvent<Category> {
        return this.zCategoryChanged.AsEvent();
    }
    private OnCategoryChanged(): void {
        this.zCategoryChanged.Dispatch(this.Category);
    }

    private zGeometry: Geometry = new Geometry();
    public get Geometry(): Geometry {
        return this.zGeometry
    }
    public set Geometry(v: Geometry) {
        this.zGeometry = v;
    }

    private MiniatureGeometry: BufferGeometry = Application.Miniature.Geometry;

    private zDisposed: SignalEvent = new SignalEvent();
    public get Disposed(): ISignalEvent {
        return this.zDisposed.AsEvent();
    }

    public constructor(
        selector?: ISurfaceSelector,
        id?: number, name?: string, description: string = "",
        category: Category = null,
        visualSpecification: VisualSpecification = new VisualSpecification(),
    ) {
        this.Selector = selector;
        this.ID = id;
        this.Name = name;
        this.Description = description;
        this.Category = category;
        this.VisualSpecification = visualSpecification;
    }

    private IsDisposed: boolean = false;
    public Dispose(): void {
        if (!this.IsDisposed) {
            this.Geometry.dispose();

            this.zDisposed.Dispatch();

            this.IsDisposed = true;
        }
    }

    /**
     * Updates the surface annotation's geometry based on what vertices of the miniature are selected by the annotation's surface selector.
     * 
     * If any vertex of a face is included by the surface selector, the entire face is included. This could change, or be a specified option.
     */
    private UpdateGeometry(): void {
        this.ResetGeometry();

        let nValuesPerVertex = 3;
        let nVerticesPerFace = 3;
        let values = this.MiniatureGeometry.getAttribute('position').array;
        let nVertices = values.length / nValuesPerVertex;
        let nFaces = nVertices / nVerticesPerFace;

        // Determine which faces have at least one vertex that should be included in the surface sub-section.
        let transformationMatrix = Application.PreferredCoordinateSystem.Value.GetTransformationMatrix();

        let includedFaces: number[] = [];
        for (let iFace = 0; iFace < nFaces; iFace++) {
            let faceStartIndex = iFace * nValuesPerVertex * nVerticesPerFace;

            let includeFace = false;
            for (let iVertex = 0; iVertex < nVerticesPerFace; iVertex++) {
                let vertexStartIndex = faceStartIndex + iVertex * nVerticesPerFace;

                let x = values[vertexStartIndex + 0];
                let y = values[vertexStartIndex + 1];
                let z = values[vertexStartIndex + 2];

                // Transform standard coordinate system points into the preferred coordinate system. This adds processing time, but so far, is reasonable in time.
                // Time might be saved by altering the selectors to work in the standard coordinate system.
                let point = new Vector3(x, y, z);
                point.applyMatrix4(transformationMatrix);

                let includeVertex = this.zSelector.IncludePoint(point.x, point.y, point.z);
                if (includeVertex) {
                    includeFace = true;
                    break; // Stop if any vertex is included.
                }
            }

            if (includeFace) {
                includedFaces.push(iFace);
            }
        }

        let iVertexIndex = 0;
        includedFaces.forEach(faceIndex => {
            let faceStartIndex = faceIndex * nValuesPerVertex * nVerticesPerFace;
            for (let iVertex = 0; iVertex < nVerticesPerFace; iVertex++) {
                let vertexStartIndex = faceStartIndex + iVertex * nVerticesPerFace;

                let x = values[vertexStartIndex + 0];
                let y = values[vertexStartIndex + 1];
                let z = values[vertexStartIndex + 2];

                let vertex = new Vector3(x, y, z);
                this.Geometry.vertices.push(vertex);
            }

            let face = new Face3(iVertexIndex + 0, iVertexIndex + 1, iVertexIndex + 2);
            iVertexIndex += nVerticesPerFace;
            this.Geometry.faces.push(face);
        });

        // Post-build required geometry updates.
        this.Geometry.computeBoundingSphere();
        this.Geometry.elementsNeedUpdate = true;
    }

    /**
     * Resets the geometry object to have no faces and no vertices.
     */
    private ResetGeometry(): void {
        this.Geometry.faces.splice(0);
        this.Geometry.vertices.splice(0);
    }

    public ToObject(): ISurfaceAnnotationStorage {
        let categoryID = null !== this.Category ? this.Category.ID : Category.DummyCategoryID;

        let output: ISurfaceAnnotationStorage = {
            ID: this.ID,
            Name: this.Name,
            Description: this.Description,
            Selector: SurfaceSelectorLocalStorageManager.ToObject(this.Selector),
            Visuals: this.VisualSpecification.ToObject(),
            CategoryID: categoryID,
            Geometry: GeometryLocalStorageManager.ToObject(this.Geometry),
        };
        return output;
    }

    public FromObject(obj: ISurfaceAnnotationStorage): void {
        this.ID = obj.ID;
        this.Name = obj.Name;
        this.Description = obj.Description;
        this.Selector = SurfaceSelectorLocalStorageManager.ToSurfaceSelector(obj.Selector);
        this.VisualSpecification.FromObject(obj.Visuals);
        if (Category.DummyCategoryID !== obj.CategoryID) {
            this.Category = Application.CategoryManager.GetCategoryByID(obj.CategoryID);
        }
        this.Geometry = GeometryLocalStorageManager.ToGeometry(obj.Geometry);
        // this.Geometry.computeBoundingSphere();
        this.Geometry.elementsNeedUpdate = true;
    }
}