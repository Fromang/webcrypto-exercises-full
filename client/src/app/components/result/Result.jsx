import * as React from "react";

import "./Result.scss";


class Result extends React.Component {

    render() {
        return (
            <div className="Result">
                { this.props.children }
            </div>
        );
    }
}

export default Result;
