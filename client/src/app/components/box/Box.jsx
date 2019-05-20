import * as React from "react";

import "./Box.scss";


class Box extends React.Component {

    render() {
        return (
            <div className="Box">
                <div className="header">
                    <h1>{ this.props.title || "No title" }</h1>
                </div>
                <div className="content">

                    { this.props.children }
                </div>
            </div>
        );
    }
}

export default Box;
