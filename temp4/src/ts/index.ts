import * as DATGUI_Workaround from 'dat.gui';
const dat = (<any>DATGUI_Workaround).default;

import { Application } from "./Application";
import { DynamicHtml } from "./DynamicHTML";
import { LoadingBlocker } from "./Loading Blocker/LoadingBlocker";
import { ModelInitialization } from "./ModelInitialization";


class Startup {
    static main() {
        // ModelInitialization.main();
        // DynamicHtml.main();
        // Startup.testLoadingBlocker();
        // Startup.testDatGui();
        Application.Main();
    }

    private static testDatGui() {
        console.log('1');
        let outputTextElement = document.createElement('h1');
        document.body.appendChild(outputTextElement);

        let controlValues: any = new Object();
        controlValues.x = 1;

        let datGui: DATGUI_Workaround.GUI = new dat.GUI();
        let valuesFolder = datGui.addFolder('Values');
        valuesFolder.open();

        let button = document.createElement('button');
        button.innerHTML = 'Click to remove controls';
        button.onclick = function() {
            datGui.destroy();
        };
        document.body.appendChild(button);

        let maxDistance = 100;

        let xControl = valuesFolder.add(controlValues, 'x', -maxDistance, maxDistance);

        function render() {
            outputTextElement.innerHTML = controlValues.x;

            requestAnimationFrame(render);
        }
        render();
    }

    private static testLoadingBlocker(): void {
        let loadingBlocker = new LoadingBlocker();

        // Load 10% every 1000 milliseconds.
        let nSteps = 10;
        let iStep = 0;
        let interval = setInterval(function() {
            iStep++;
            loadingBlocker.message = 'Loading ...' + (iStep / nSteps) * 100 + '%';

            if(iStep === nSteps) {
                clearInterval(interval);
                loadingBlocker.remove();
            }
        }, 1000);
    }

    // private static showBlockUntilLoaded() {
    //     let blocker = document.createElement('div');
    //     let description = document.createElement('p');
    //     description.id = 
    // }
}
Startup.main();
// window.onload = Application.Main;
