import { observable, action, flow } from "mobx";

import exampleApi from "./example.api";


export default observable({
    // State
    message: "NO MESSAGE",
    text: "",
    inputA: "Bye",
    inputB: "",

    // Flows
    getServerValue: flow(function *getServerValue() {
        // Yield stops the execution util the value of the promise is received
        const ajaxResponse = yield exampleApi.getServerValue();

        // State change
        this.message = ajaxResponse.response;
    }),

    // Actions
    say(value) {
        this.text = value;
    },
}, {
    say: action("Say something")
});;
