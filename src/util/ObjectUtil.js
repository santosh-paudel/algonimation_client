const clonedeep = require('lodash.clonedeep');
class ObjectUtil {
    static deepCopy(obj) {
        return clonedeep(obj);
    }
}

export {
    ObjectUtil
}