// Light controls.
var lightOn = true;
function toggleLight() {
    lightOn = !lightOn;
    setLight(lightOn);
}
function setLight(onOrOff) {
    var toggleSwitch = document.getElementById("Light-On-Off");
    toggleSwitchStyle(toggleSwitch, onOrOff);

    var pointLight = siteData.pointLight;
    if (onOrOff) {
        pointLight.visible = true;
    } else {
        pointLight.visible = false;
    }
}
function toggleSwitchStyle(toggleSwitch, onOrOff) {
    if (onOrOff) {
        toggleSwitch.style.background = "white";
        toggleSwitch.style.color = "black";
    } else {
        toggleSwitch.style.background = "black";
        toggleSwitch.style.color = "white";
    }
}

var lightOscillation = false;
function toggleLightOscillation() {
    lightOscillation = !lightOscillation;
    setLightOscillation(lightOscillation);
}
function setLightOscillation(onOrOff) {
    var toggleSwitch = document.getElementById("Light-Oscillate");
    toggleSwitchStyle(toggleSwitch, onOrOff);
}

// Respond to keyboard.
window.addEventListener('keydown', onKeydown);
function onKeydown(event) {
    if (event.defaultPrevented) {
        return; // Do nothing if the event has already been handled.
    }

    switch (event.key) {
        case 'ArrowUp':
        case 'w':
            moveLight(+defaultIncrement, 0, 0);
            break;
        case 'ArrowDown':
        case 's':
        moveLight(-defaultIncrement, 0, 0);
            break;

        case 'ArrowLeft':
        case 'a':
        moveLight(0, -defaultIncrement, 0);
            break;
        case 'ArrowRight':
        case 'd':
        moveLight(0, +defaultIncrement, 0);
            break;
        case 'Shift':
        case 'r':
        moveLight(0, 0, +defaultIncrement);
            break;
        case 'Control':
        case 'f':
        moveLight(0, 0, -defaultIncrement);
            break;
    }
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