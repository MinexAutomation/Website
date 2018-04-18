import { DirectionalLight, PointLight, AmbientLight, Scene } from "three";
import { LightingSpecification } from "./LightingSpecification";

export class Lighting {
    public readonly AmbientLight: AmbientLight = new AmbientLight(0xffffff);
    public readonly DirectionalLight: DirectionalLight = new DirectionalLight(0xffffff);
    public readonly PointLight: PointLight = new PointLight(0xffffff);
    public readonly Specification: LightingSpecification = new LightingSpecification();


    public constructor(scene: Scene) {
        scene.add(this.AmbientLight);
        scene.add(this.DirectionalLight);
        scene.add(this.PointLight);

        this.Specification.Changed.Subscribe(this.OnSpecificationChanged)
        
        this.Specification.SetDefaults();
        this.Specification.OnChange();
    }

    private OnSpecificationChanged = () => {
        this.ApplySpecification(this.Specification);
    }

    public ApplySpecification(specification: LightingSpecification) {
        this.AmbientLight.visible = specification.AmbientOn;
        this.AmbientLight.intensity = specification.AmbientIntensity;

        this.DirectionalLight.visible = specification.DirectionalOn;
        this.DirectionalLight.intensity = specification.DirectionalIntensity;
        this.DirectionalLight.position.copy(specification.DirectionalPosition);

        this.PointLight.visible = specification.PointOn;
        this.PointLight.intensity = specification.PointIntensity;
        this.PointLight.position.copy(specification.PointLocation);
    }
}