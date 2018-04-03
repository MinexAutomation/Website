// Light controls.
var lightOn = true;
function toggleLight() {
    lightOn = !lightOn;
    setLight(lightOn);
}
function setLight(onOrOff) {
    var toggleSwitch = document.getElementById("Light-On-Off");
    toggleSwitchSetOnOff(toggleSwitch, onOrOff);

    var pointLight = siteData.pointLight;
    if (onOrOff) {
        pointLight.visible = true;
    } else {
        pointLight.visible = false;
    }
}

var lightOscillation = false;
function toggleLightOscillation() {
    lightOscillation = !lightOscillation;
    setLightOscillation(lightOscillation);
}
function setLightOscillation(onOrOff) {
    var toggleSwitch = document.getElementById("Light-Oscillate");
    toggleSwitchSetOnOff(toggleSwitch, onOrOff);
}

var defaultIncrement = 1;
function moveLight(xIncrement, yIncrement, zIncrement) {
    siteData.pointLight.position.x = siteData.pointLight.position.x + xIncrement;
    siteData.pointLight.position.y = siteData.pointLight.position.y + yIncrement;
    siteData.pointLight.position.z = siteData.pointLight.position.z + zIncrement;

    siteData.sphereLightMesh.position.x = siteData.sphereLightMesh.position.x + xIncrement;
    siteData.sphereLightMesh.position.y = siteData.sphereLightMesh.position.y + yIncrement;
    siteData.sphereLightMesh.position.z = siteData.sphereLightMesh.position.z + zIncrement;
}

// Create the default object movement mode, which moves the light.
function setDefaultMovementMode() {
    siteData.currentObjectMoveFunction = moveLight;
}