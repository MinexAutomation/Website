/**
 * A static class for showing and hiding a modal.
 * 
 * To use, call Initialize() first, then add whatever messages you want displayed, then call Show().
 */
export class Modal {
    public static readonly RootHtmlElementID = 'Modal-Root';
    public static readonly ContentHtmlElementID = 'Modal-Content';
    public static readonly HeaderHtmlElementID = 'Modal-Header';
    public static readonly CloseButtonHtmlElementID = 'Modal-CloseButton';
    public static readonly BodyHtmlElementID = 'Modal-Body';
    public static readonly FooterHtmlElementID = 'Modal-Footer';


    private static RootHtmlElement: HTMLDivElement;
    private static Style: HTMLStyleElement;
    private static StyleSheet: CSSStyleSheet;
    private static HeaderMessageHtmlElement: HTMLElement;
    public static get HeaderMessage(): string {
        return Modal.HeaderMessageHtmlElement.innerHTML;
    }
    public static set HeaderMessage(value: string) {
        Modal.HeaderMessageHtmlElement.innerHTML = value;
    }
    private static CloseButtonHtmlElement: HTMLElement;
    private static BodyHtmlElement: HTMLElement;
    public static GetBodyHtmlElement(): HTMLElement {
        return Modal.BodyHtmlElement;
    }
    public static get BodyMessage(): string {
        return Modal.BodyHtmlElement.innerHTML;
    }
    public static set BodyMessage(value: string) {
        Modal.BodyHtmlElement.innerHTML = value;
    }
    private static FooterMessageHtmlElement: HTMLElement;
    public static get FooterMessage(): string {
        return Modal.FooterMessageHtmlElement.innerHTML;
    }
    public static set FooterMessage(value: string) {
        Modal.FooterMessageHtmlElement.innerHTML = value;
    }

    public static Initialize(): void {
        Modal.BuildHtml();
        Modal.AddStyle();
        Modal.WireEvents();
    }

    public static Show(): void {
        Modal.RootHtmlElement.style.display = 'block';
    }

    public static Hide(): void {
        Modal.RootHtmlElement.remove();
        Modal.Style.remove();

        window.removeEventListener('click', Modal.OnOutsideClick);
    }

    private static WireEvents(): void {
        // Listen for the inside close button click.
        Modal.CloseButtonHtmlElement.addEventListener('click', () => { Modal.Hide(); });

        // Listen for the outside close click.
        window.addEventListener('click', Modal.OnOutsideClick);
    }

    private static OnOutsideClick = (ev: MouseEvent) => {
        if(ev.target === Modal.RootHtmlElement) {
            Modal.Hide();
        }
    }

    /**
     * Builds the HTML element tree.
     */
    private static BuildHtml(): void {
        Modal.RootHtmlElement = document.createElement('div');
        document.body.appendChild(Modal.RootHtmlElement);
        Modal.RootHtmlElement.id = Modal.RootHtmlElementID;

        let content = document.createElement('div');
        Modal.RootHtmlElement.appendChild(content);
        content.id = Modal.ContentHtmlElementID;

        let header = document.createElement('div');
        content.appendChild(header);
        header.id = Modal.HeaderHtmlElementID;

        Modal.CloseButtonHtmlElement = document.createElement('span');
        header.appendChild(Modal.CloseButtonHtmlElement);
        Modal.CloseButtonHtmlElement.id = Modal.CloseButtonHtmlElementID;
        Modal.CloseButtonHtmlElement.innerHTML = '&times;';

        Modal.HeaderMessageHtmlElement = document.createElement('h2');
        header.appendChild(Modal.HeaderMessageHtmlElement);

        Modal.BodyHtmlElement = document.createElement('div');
        content.appendChild(Modal.BodyHtmlElement);
        Modal.BodyHtmlElement.id = Modal.BodyHtmlElementID;

        let footer = document.createElement('div');
        content.appendChild(footer);
        footer.id = Modal.FooterHtmlElementID;

        Modal.FooterMessageHtmlElement = document.createElement('h3');
        footer.appendChild(Modal.FooterMessageHtmlElement);
    }

    /**
     * Adds the CSS styling for all elements.
     */
    private static AddStyle(): void {
        Modal.Style = document.createElement('style');
        document.head.appendChild(Modal.Style);

        Modal.StyleSheet = <CSSStyleSheet>Modal.Style.sheet;

        let rule: string;

        rule = `
        display: none;
        position: fixed;
        z-index: 1;
        left: 0;
        top: 0;
        height: 100%;
        width: 100%;
        overflow: auto;
        background-color: rgba(0, 0, 0, 0.5);
        `;
        Modal.StyleSheet.addRule('#' + Modal.RootHtmlElementID, rule);

        rule = `
        background-color: #f4f4f4;
        margin: 20% auto;
        width: 70%;
        box-shadow: 0 5px 8px 0 rgba(0, 0, 0, 0.2), 0 7px 20px 0 rgba(0, 0, 0, 0.17);

        animation-name: modalOpen;
        animation-duration: 1s;
        `;
        Modal.StyleSheet.addRule('#' + Modal.ContentHtmlElementID, rule);

        rule = `
        background: coral;
        padding: 15px;
        color: white;
        `;
        Modal.StyleSheet.addRule('#' + Modal.HeaderHtmlElementID, rule);

        rule = `
        margin: 0;
        `;
        Modal.StyleSheet.addRule('#' + Modal.HeaderHtmlElementID + ' h2', rule);

        rule = `
        padding: 10px 20px;
        `;
        Modal.StyleSheet.addRule('#' + Modal.BodyHtmlElementID, rule);

        rule = `
        background: coral;
        padding: 10px;
        color: white;
        text-align: center;
        `;
        Modal.StyleSheet.addRule('#' + Modal.FooterHtmlElementID, rule);

        rule = `
        margin: 0;
        `;
        Modal.StyleSheet.addRule('#' + Modal.FooterHtmlElementID + ' h3', rule);

        rule = `
        color: white;
        float: right;
        font-size: 30px;
        `;
        Modal.StyleSheet.addRule('#' + Modal.CloseButtonHtmlElementID, rule);

        rule = `
        color: black;
        text-decoration: none;
        cursor: pointer;
        `;
        Modal.StyleSheet.addRule('#' + Modal.CloseButtonHtmlElementID + ':hover' + ', ' + '#' + Modal.CloseButtonHtmlElementID + ':focus', rule);

        rule = `
        from{ opacity: 0}
        to {opacity: 1}
        `;
        Modal.StyleSheet.addRule('@keyframes modalOpen', rule);
    }
}