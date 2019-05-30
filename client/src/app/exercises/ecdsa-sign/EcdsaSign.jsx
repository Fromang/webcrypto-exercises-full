import * as React from "react";
import { observer, inject } from "mobx-react";

import { Box, Result, Stage, StageInput, Json } from "../../components";


class EcdsaSign extends React.Component {

    render() {
        const { ecdsaSign } = this.props.storage;

        return (
            <Box title="ECDS signature generation">
                <Stage actionName="Generate" action={() => ecdsaSign.generateKeys()}>
                    Generate a key pair
                </Stage>
                <Result>
                    <Json data={ecdsaSign.publicKey}/>
                </Result>

                <Stage actionName="Sign" action={() => ecdsaSign.sign()}>
                    Sign message
                    <StageInput name="ecdsaSign.message" placeholder="Write a message..."/>
                </Stage>
                <Result>
                    The signature value is "{ ecdsaSign.signedMessage.sign }"
                </Result>

                <Stage actionName="Send signed message" action={() => ecdsaSign.sendSignedMessage()}>
                    Send the message
                    <StageInput name="ecdsaSign.signedMessage.message" placeholder="Write a message..."/>
                    <StageInput name="ecdsaSign.signedMessage.sign"    placeholder="Write a signature..."/>
                </Stage>
                <Result>
                    The server response is: "{ ecdsaSign.serverResponse }"
                </Result>
            </Box>
        );
    }
}

export default inject("storage")(observer(EcdsaSign));
