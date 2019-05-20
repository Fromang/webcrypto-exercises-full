import * as React from "react";

import "./Json.scss";


class Json extends React.Component {

    render() {
        return (
            <pre className="Json">
                { JSON.stringify(this.props.data, null, 4) }
            </pre>
        );
    }
}

Json.defaultProps = {
    data: {}
};


export default Json;
