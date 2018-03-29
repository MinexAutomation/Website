// Selection controls.
var selectionOn = false;
function toggleSelection() {
    selectionOn = !selectionOn;
    setSelection(selectionOn);
}
function setSelection(onOrOff) {
    if (onOrOff) {
        siteData.cameraControls.enabled = false;
    } else {
        siteData.cameraControls.enabled = true;
    }

    var toggleSwitch = document.getElementById("Selection-On-Off");
    toggleSwitchStyle(toggleSwitch, onOrOff);
}