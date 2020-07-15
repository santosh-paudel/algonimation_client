class MathUtil {

    static isInt(n) {
        return typeof n === "number" && n % 1 === 0;
    }

    static isFloat(n) {
        return typeof n === "number" && n % 1 !== 0;
    }


}

export {
    MathUtil
}