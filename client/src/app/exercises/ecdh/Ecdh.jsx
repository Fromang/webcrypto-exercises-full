import * as React from "react";
import { observer, inject } from "mobx-react";

import { Box, Result, Stage, StageInput, Json } from "../../components";
import * as utils from "../../../utils";


class Ecdh extends React.Component {

    constructor(props, context) {
        super(props, context);


        const { ecdh } = this.props.storage;
        ecdh.prepare();
    }

    render() {
        const { ecdh } = this.props.storage;

        return ( !ecdh.isPrepared ?
            // If is not prepared
            <Box title="[NON PREPARED] Complete example using ECDH">
                <Result>
                    <p>
                        THIS IS AN EXAMPLE. TO DISTRIBUTE KEYS IN A REAL ENVIRONMENT, CERTIFICATES CAN BE USED
                    </p>
                    <p>
                        Previous preparations. It generates the client keys and obtain the server public key.
                        This step must be only executed the first time and update the code to with the resultant keys.
                    </p>

                    Keys:
                    <Json data={ecdh.keys}/>
                </Result>
                <Stage actionName="Store" action={() => ecdh.updateStorage()}>
                    Store the keys
                </Stage>
            </Box> :

            // It is prepared
            <Box title="Complete example using ECDH">
                <Stage actionName="Clean" action={() => ecdh.cleanStorage()}>
                    (OPTIONAL) You may want to clean the local storage to store new keys
                </Stage>

                <Stage actionName="Generate" action={() => ecdh.ecdhGenerate()}>
                    Generate ECDH keys
                </Stage>
                <Result>
                    <Json data={ecdh.ecdhMessage}/>
                </Result>

                <Stage actionName="Send" action={() => ecdh.ecdhSend()}>
                    Send ECDH signed key
                </Stage>
                <Result>
                    Generated shared secret: "{utils.arrayBufferToHex(ecdh.sharedSecret)}"
                </Result>

                <Stage actionName="Encrypt" action={() => ecdh.encrypt()}>
                    Write a message to be encrypted
                    <StageInput name="ecdh.cleartext" placeholder="Write a cleartext..."/>
                </Stage>
                <Result>
                    The ciphertext is "{utils.arrayBufferToHex(ecdh.ciphertext)}"
                </Result>

                <Stage actionName="Send" action={() => ecdh.sendCiphertext()}>
                    Send the encrypted message
                </Stage>
                <Result>
                    The server response is
                    <Json data={ecdh.response}/>
                </Result>

                <Stage actionName="Decrypt" action={() => ecdh.decrypt()}>
                    Decrypt the message received
                </Stage>
                <Result>
                    The decrypted message is {ecdh.serverCleartext}
                </Result>
            </Box>
        );
    }
}

export default inject("storage")(observer(Ecdh));
