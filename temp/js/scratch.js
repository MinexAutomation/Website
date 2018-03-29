InteractionMode.cameraMovement = 'CameraMovement';
InteractionMode.selection = 'Selection';
InteractionMode.volumeSelection = 'VolumeSelection';
function InteractionMode() {
    this.mode = this.cameraMovement;

    this.setMode = function (mode) {
        switch (mode) {
            case InteractionMode.cameraMovement:
                this.mode = InteractionMode.cameraMovement;
                break;

            case InteractionMode.selection:
                this.mode = InteractionMode.selection;
                break;

            case thInteractionModeis.volumeSelection:
                this.mode = InteractionMode.volumeSelection;
                break;

            default:
                this.mode = InteractionMode.cameraMovement;
                break;
        }
    }
}


var test = InteractionMode.cameraMovement;
console.log(test);

var test2 = new InteractionMode();
test2.setMode(InteractionMode.volumeSelection);
console.log(test2.mode);