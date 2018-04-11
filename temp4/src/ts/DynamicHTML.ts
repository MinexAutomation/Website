import { Constants } from "./Constants";
import { ViewModel } from "./ViewModel";


export class DynamicHtml {
    public static main(): void {
        DynamicHtml.addTitle();
        DynamicHtml.addButton();
    }

    private static addButton() {
        let button = document.createElement('button');
        button.innerHTML = 'Click me!';

        button.onclick = function () {
            ViewModel.toggleTextToggle();
            DynamicHtml.setTextToggleText();
        }

        document.body.appendChild(button);
    }

    private static addTitle() {
        let titleElement = document.createElement('h1');
        titleElement.id = Constants.titleElementId;
        document.body.appendChild(titleElement);

        DynamicHtml.setTextToggleText();

        DynamicHtml.addTitleCssStyle();
        
        titleElement.className = Constants.titleStyleClassName;
    }

    private static addTitleCssStyle() {
        let styleSheets = document.styleSheets;
        // let styleSheet = styleSheets[0];

        let titleStyle = document.createElement('style');
        // titleStyle.appendChild(document.createTextNode('')); // Webkit hack.
        document.head.appendChild(titleStyle);

        let styleSheet = <CSSStyleSheet>titleStyle.sheet;
        let rule = 'color: blue';
        styleSheet.addRule('.' + Constants.titleStyleClassName, rule);
        // let rule = '.title { color: coral }';
        // styleSheet.insertRule(rule);
    }

    private static setTextToggleText() {
        let title = this.getTitle();
        if (ViewModel.textToggle) {
            title.innerHTML = Constants.textToggleTrueText;
        } else {
            title.innerHTML = Constants.textToggleFalseText;
        }
    }

    private static getTitle() {
        let output = <HTMLHeadingElement>document.getElementById(Constants.titleElementId);
        return output;
    }

    private static setViewModel() {
        ViewModel.textToggle = true;
    }
}