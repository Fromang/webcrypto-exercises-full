import * as React from "react";
import { observer, inject } from "mobx-react";

import * as utils from "../../../utils";
import { Box, Result, Stage, StageInput, Json } from "../../components";


class AesCtr extends React.Component {

    render() {
        const { aesCtr } = this.props.storage;

        return (
            <Box title="AES CTR encryption">
                <Stage actionName="Encrypt" action={() => aesCtr.encrypt()}>
                    Write a message to be encrypted
                    <StageInput name="aesCtr.cleartext" placeholder="Write a cleartext..."/>
                </Stage>
                <Result>
                    The ciphertext is "{utils.arrayBufferToHex(aesCtr.ciphertext)}"
                </Result>

                <Stage actionName="Send" action={() => aesCtr.sendCiphertext()}>
                    Send the encrypted message
                </Stage>
                <Result>
                    The server response is
                    <Json data={aesCtr.response}/>
                </Result>

                <Stage actionName="Decrypt" action={() => aesCtr.decrypt()}>
                    Decrypt the message received
                </Stage>
                <Result>
                    The decrypted message is {aesCtr.serverCleartext}
                </Result>
            </Box>
        );
    }
}

export default inject("storage")(observer(AesCtr));
