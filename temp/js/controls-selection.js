// Selection controls.
var selectionOn = false;
function toggleSelection() {
    selectionOn = !selectionOn;
    setSelection(selectionOn);
}
function setSelection(onOrOff) {
    if (onOrOff) {
        setModeSelection();
    } else {
        setModeCameraMovement();
    }

    var toggleSwitch = document.getElementById("Selection-On-Off");
    toggleSwitchSetOnOff(toggleSwitch, onOrOff);
}