import * as React from "react";

import "./Stage.scss";


class Stage extends React.Component {

    render() {
        const { actionName, action } = this.props;

        return (
            <div className="Stage">
                <div className="content">
                    { this.props.children }
                </div>
                <button onClick={action}>{actionName}</button>
            </div>
        );
    }
}

Stage.defaultProps = {
    actionName: "Execute",
    action: () => {
        console.log("No action defined")
    }
};

export default Stage;
