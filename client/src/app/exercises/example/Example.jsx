import * as React from "react";
import { observer, inject } from "mobx-react";

import { Box, Result, Stage, StageInput, Json } from "../../components";


class Example extends React.Component {

    say() {
        const { example } = this.props.storage;

        // Execute an action with using the input values
        example.say(example.inputA + ' ' + example.inputB);
    }

    render() {
        const { example } = this.props.storage;

        return (
            <Box title="This is an example">
                {/* First stage: It performs an ajax query to de express server
                    and stores the response inside storage */}
                <Stage action={() => example.getServerValue()}>
                    <label>Get some value from the server</label>
                </Stage>
                <Result>
                    The value received is
                    <Json data={example.message}/>
                </Result>

                {/* Second stage: It performs an ajax query to de express server
                    and stores the response inside storage */}
                <Stage action={() => this.say()} actionName="Say something">
                    <label>This one is using an input:</label>
                    <StageInput name="example.inputA" placeholder="Write a message here..."/>
                    <StageInput name="example.inputB" placeholder="Another message..."/>
                    <label>You may also want to put some text after the stage inputs</label>
                </Stage>
                <Result>The message is "{example.text}"</Result>
            </Box>
        );
    }
}

export default inject("storage")(observer(Example));
