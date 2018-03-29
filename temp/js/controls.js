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

