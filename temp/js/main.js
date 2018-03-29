window.addEventListener('load', function() {
    // Test for the presence of WebGL.
    var canvas = document.createElement('canvas');
    var gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');

    // Report the result.
    var outputParagraph = document.getElementById('WebGlDetectedP');
    if(gl && gl instanceof WebGLRenderingContext) {
        outputParagraph.innerHTML = 'WebGL Supported';   
    } else {
        outputParagraph.innerHTML = '!!! No WebGL !!!';
    }
}, false);