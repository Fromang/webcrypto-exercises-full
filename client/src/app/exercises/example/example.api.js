import { ajax } from "rxjs/ajax";

import config from "../../../config";


export default {
    getServerValue() {
        return ajax.get(`${config.baseUrl}/example`).toPromise();
    }
}
