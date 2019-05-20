import * as React from "react";
import * as reactDom from "react-dom";
import { configure } from "mobx";

import App from "./app";


export default function main() {
    // Configure mobx to work in strict mode
    // This means that every state change must be performed inside an action!
    configure({
        enforceActions: "always"
    });

    // Create a new dom element to inject react
    const root = document.createElement("div");
    document.body.appendChild(root);

    reactDom.render(<App/>, root);
}
