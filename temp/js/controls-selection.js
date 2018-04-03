// Selection controls.
var selectionOn = false;
function toggleSelection() {
    selectionOn = !selectionOn;
    setSelection(selectionOn);
}
function setSelection(onOrOff) {
    if (onOrOff) {
        setSelectionMode();
    } else {
        setDefaultSelectionMode();
    }

    var toggleSwitch = document.getElementById("Selection-On-Off");
    toggleSwitchSetOnOff(toggleSwitch, onOrOff);
}

function setDefaultSelectionMode() {
    setDefaultMovementMode();
    siteData.cameraControls.enabled = true;
}

function setSelectionMode() {
    siteData.currentObjectMoveFunction = null;
    siteData.cameraControls.enabled = false;
}