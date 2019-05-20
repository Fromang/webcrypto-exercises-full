import { observable, action } from "mobx";
import _ from "lodash";


// Main mobx observable. The rest of observables are placed
// inside and defined inside each exercise folder
const create = (exercises) => {
    return observable({
        ...exercises,

        get(path) {
            return _.get(this, path);
        },
        set(path, value) {
            _.set(this, path, value);
        }
    }, {
        set: action("Set a value inside storage")
    });
}

export default {
    create
};
