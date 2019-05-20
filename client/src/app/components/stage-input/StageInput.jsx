import * as React from "react";
import { observer, inject } from "mobx-react";
import _ from "lodash";

import "./StageInput.scss";


class StageInput extends React.Component {

    componentWillMount() {
        this.setDefaultValue();
    }

    setValue(value) {
        const { name, storage } = this.props;
        storage.set(name, value);
    }

    getValue() {
        const { name, storage } = this.props;
        return storage.get(name);
    }

    setDefaultValue() {
        const { defaultValue } = this.props;

        // Set the default value if is not set
        if(!this.getValue() && defaultValue !== undefined) {
            this.setValue(defaultValue);
        }
    }

    render() {
        const { name, storage, defaultValue, value, ...inputProps } = this.props;

        return (
            <div className="StageInput">
                <input {...inputProps} value={this.getValue()} name={name}
                    onChange={(ev) => this.setValue(ev.target.value) }/>
            </div>
        );
    }
}

StageInput.defaultProps = {
    name: "default",
    type: "text",
    defaultValue: ""
};

export default inject("storage")(observer(StageInput));
