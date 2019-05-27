import * as React from "react";
import { observer, inject } from "mobx-react";

import { Box, Result, Stage, StageInput, Json } from "../../components";
import * as utils from "../../../utils";


class RsaEncrypt extends React.Component {
    render() {
        const { rsaEncrypt } = this.props.storage;
        return (
            <Box title="Rsa encrypt"> 
               <Stage actionName="Import key" action={() => rsaEncrypt.getServerPublicKey()}>
                    Import public key from server
                </Stage>
                <Result>
                    <Json data={rsaEncrypt.publicKey}/>
                </Result>

                <Stage actionName="Encrypt" action={() => rsaEncrypt.encrypt()}>
                    Write a message to be encrypted
                    <StageInput name="rsaEncrypt.cleartext" placeholder="Write a cleartext..."/>
                </Stage>
                <Result>
                    The cipher text is {utils.arrayBufferToHex(rsaEncrypt.ciphertext)}
                </Result>

                <Stage actionName="Send" action={() => rsaEncrypt.sendCipherText()}>
                    Send the ciphertext to the server (that will decrypt it)
                </Stage>
            </Box>
        );
    }
}

export default inject("storage")(observer(RsaEncrypt));
