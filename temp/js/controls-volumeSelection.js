var volumeSelectionOnOff = document.getElementById('VolumeSelectionOnOff');
var selector1OnOff = document.getElementById('Selector1OnOff');
var selector2OnOff = document.getElementById('Selector2OnOff');

function initializeVolumeSelection() {
    setVolumeSelection(volumeSelectionEnable);
    setSelector1(selector1Enable);
    setSelector2(selector2Enable);
}

var volumeSelectionEnable = false;
function toggleVolumeSelection() {
    volumeSelectionEnable = !volumeSelectionEnable;
    setVolumeSelection(volumeSelectionEnable);
}
function setVolumeSelection(onOrOff) {
    toggleSwitchSetOnOff(volumeSelectionOnOff, onOrOff);

    var enabledOpacityLevel = 1;
    var disabledOpacityLevel = 0.2;
    if (onOrOff) {
        selector1OnOff.style.opacity = enabledOpacityLevel;
        selector2OnOff.style.opacity = enabledOpacityLevel;
    } else {
        selector1OnOff.style.opacity = disabledOpacityLevel;
        selector2OnOff.style.opacity = disabledOpacityLevel;
    }

    if (onOrOff) {
        setModeVolumeSelection();
    } else {
        setModeCameraMovement();
    }
}

var selector1Enable = true;
function toggleSelector1() {
    if (volumeSelectionEnable) {
        selector1Enable = !selector1Enable;
        setSelector1(selector1Enable);
    }
}
function setSelector1(onOrOff) {
    toggleSwitchSetOnOff(selector1OnOff, onOrOff);
}

var selector2Enable = false;
function toggleSelector2() {
    if (volumeSelectionEnable) {
        selector2Enable = !selector2Enable;
        setSelector2(selector2Enable);
    }
}
function setSelector2(onOrOff) {
    toggleSwitchSetOnOff(selector2OnOff, onOrOff);
}