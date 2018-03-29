siteData.interactionMode = new InteractionMode();


function setModeCameraMovement() {
    siteData.cameraControls.enabled = true;
}

function setModeSelection() {
    siteData.cameraControls.enabled = false;
}

function toggleSwitchSetOnOff(toggleSwitch, onOrOff) {
    if (onOrOff) {
        toggleSwitch.style.background = "white";
        toggleSwitch.style.color = "black";
    } else {
        toggleSwitch.style.background = "black";
        toggleSwitch.style.color = "white";
    }
}

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

            case InteractionMode.volumeSelection:
                this.mode = InteractionMode.volumeSelection;
                break;

            default:
                this.mode = InteractionMode.cameraMovement;
                break;
        }
    }
    this.setModeCameraMovement = function () {
        this.setMode(InteractionMode.cameraMovement);
    }
    this.setModeSelection = function () {
        this.setMode(InteractionMode.selection);
    }
    this.setModelVolumeSelection = function () {
        this.setMode(InteractionMode.volumeSelection);
    }
}