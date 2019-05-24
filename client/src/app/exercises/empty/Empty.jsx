import * as React from "react";
import { observer, inject } from "mobx-react";

import { Box, Result, Stage, StageInput, Json } from "../../components";
import * as utils from "../../../utils";


class Empty extends React.Component {

    render() {
        const { empty } = this.props.storage;

        return (
            <Box title="Empty">
            </Box>
        );
    }
}

export default inject("storage")(observer(Empty));
