import { ControlPanel } from "./ControlPanel";
import { ModeFactory } from "../Modes/ModeFactory";
import { ModeInfo, IMode } from "../Modes/Mode";


// Allows choosing which mode will put its controls to the control panel.
// The ModesControl should always be first in the Control Panel.
export class ModesControl {
    public static readonly HtmlElementId = 'ModesControl';
    public static readonly SelectHtmlElementId = 'ModesControl-Select';


    private readonly zHtmlElement: HTMLDivElement;
    public get HtmlElement() : HTMLDivElement {
        return this.zHtmlElement;
    }
    private readonly Style: HTMLStyleElement;
    private readonly StyleSheet: CSSStyleSheet;
    private readonly Select: HTMLSelectElement;
    private readonly ModeFactory: ModeFactory;
    private Mode: IMode = null;


    public constructor(controlPanel: ControlPanel) {
        this.ModeFactory = new ModeFactory(controlPanel);
        
        // HTML.
        this.zHtmlElement = document.createElement('div');
        controlPanel.HtmlElement.appendChild(this.zHtmlElement);
        this.HtmlElement.id = ModesControl.HtmlElementId;
        this.HtmlElement.className = ControlPanel.ControlClassName;

        this.Style = document.createElement('style');
        document.head.appendChild(this.Style);
        this.StyleSheet = <CSSStyleSheet>this.Style.sheet;

        let title = document.createElement('p');
        title.className = ControlPanel.ControlTitleClassName;
        title.innerHTML = 'Modes';
        this.HtmlElement.appendChild(title);
        
        // Mode selector.
        this.Select = document.createElement('select');
        this.HtmlElement.appendChild(this.Select);
        this.Select.id = ModesControl.SelectHtmlElementId;

        ModeFactory.ModeInfos.forEach(modeInfo => {
            let option = document.createElement('option');
            this.Select.appendChild(option);

            option.value = modeInfo.ID;
            option.innerHTML = modeInfo.Description;
        });

        this.Select.onchange = this.OnChange;

        // Perform the actions to select the default node.
        this.OnChange();

        // Styles.
        this.AddCssRules();
    }

    private AddCssRules() {
        let rule: string;

        rule = `
        width: 100px;
        `;
        this.StyleSheet.addRule('#' + ModesControl.HtmlElementId + ' select', rule);
    }

    private OnChange = () => {
        let selectedIndex = this.Select.selectedIndex;
        let selected = <HTMLOptionElement>this.Select.childNodes[selectedIndex];
        let selectedID = selected.value;

        if(null !== this.Mode) {
            this.Mode.Dispose();
        }

        this.Mode = this.ModeFactory.GetModeByID(selectedID);
    }

    public SetSelectedIndex(index: number) : void {
        this.Select.selectedIndex = index;
        this.OnChange();
    }
}