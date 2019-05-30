import * as React from "react";
import { Provider } from "mobx-react";
import DevTools from "mobx-react-devtools";

import { storageFactory } from "../storage";

import ExampleExercise from "./exercises/example";
import RsaEncryptExercise from "./exercises/rsa-encrypt";
import AesCtrExercise from "./exercises/aes-ctr";
import EcdsaSignExercise from "./exercises/ecdsa-sign";
import EcdhExercise from "./exercises/ecdh";


class App extends React.Component {

    constructor(props, context) {
        super(props, context);

        // List of exercises
        this.exercises = [
            ExampleExercise,
            RsaEncryptExercise,
            // AesCtrExercise,
            // EcdsaSignExercise,
            // EcdhExercise
        ];

        this.createStore();
    }

    createStore() {
        const exerciseStorages = this.exercises
            .reduce((prev, curr) => Object.assign(prev, {
                [curr.name]: curr.store
            }), {});

        this.storage = storageFactory.create(exerciseStorages);

        if(process.env.NODE_ENV === 'development') {
            window.storage = this.storage; // for debug purposes
        }
    }

    render() {
        return (
            <Provider storage={this.storage}>
                <div>
                    {/* List of exercises */}
                    { this.exercises.map(m => <m.Component key={m.name}/>) }

                    {/* Mobx development tools */}
                    { process.env.NODE_ENV === 'development' ?
                        <DevTools/> : null }
                </div>
            </Provider>
        );
    }
}

export default App;
