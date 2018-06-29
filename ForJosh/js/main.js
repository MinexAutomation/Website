window.addEventListener('load', function () {
    // Test for the presence of WebGL.
    var canvas = document.createElement('canvas');
    var gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');

    // Report the result.
    var outputParagraph = document.getElementById('WebGlDetectedP');
    if (gl && gl instanceof WebGLRenderingContext) {
        outputParagraph.innerHTML = 'WebGL Supported';
    } else {
        outputParagraph.innerHTML = '!!! No WebGL !!!';
    }
}, false);

// // Respond to keyboard events to move the current object.
// window.addEventListener('keydown', onKeydown);
// function onKeydown(event) {
//     if (event.defaultPrevented) {
//         return; // Do nothing if the event has already been handled.
//     }

//     if(siteData.currentObjectMoveFunction == null) {
//         return; // Do nothing if there is nothing defined as movable.
//     }

//     switch (event.key) {
//         case 'ArrowUp':
//         case 'w':
//             siteData.currentObjectMoveFunction(+defaultIncrement, 0, 0);
//             break;
//         case 'ArrowDown':
//         case 's':
//             siteData.currentObjectMoveFunction(-defaultIncrement, 0, 0);
//             break;
//         case 'ArrowLeft':
//         case 'a':
//             siteData.currentObjectMoveFunction(0, -defaultIncrement, 0);
//             break;
//         case 'ArrowRight':
//         case 'd':
//             siteData.currentObjectMoveFunction(0, +defaultIncrement, 0);
//             break;
//         case 'Shift':
//         case 'r':
//             siteData.currentObjectMoveFunction(0, 0, +defaultIncrement);
//             break;
//         case 'Control':
//         case 'f':
//             siteData.currentObjectMoveFunction(0, 0, -defaultIncrement);
//             break;
//     }
// }

siteData.currentObjectMoveFunction = moveLight;

// Sets up the scene.
function init() {
    initializeSite();
    // initializeVolumeSelection();

    var step = 0;
    var increment = 0.05;
    var offset = getOffset(step);
    render();

    // Renders the scene and updates the render as needed.
    function render() {
        // console.log(scene);

        if (siteData.stats !== undefined) {
            siteData.stats.update();
        }

        var delta = siteData.clock.getDelta();
        siteData.cameraControls.update(delta);

        if (lightOscillation) {
            step += increment;
        }
        var newOffset = getOffset(step);
        var xIncrement = newOffset - offset;
        offset = newOffset;
        moveLight(xIncrement, 0, 0);

        // Read more about requestAnimationFrame at http://www.paulirish.com/2011/requestanimationframe-for-smart-animating/
        requestAnimationFrame(render);

        // Render the scene.
        siteData.renderer.render(siteData.scene, siteData.camera);
    }

    function getOffset(step) {
        var offset = 10 * Math.sin(step);
        return offset;
    }
}