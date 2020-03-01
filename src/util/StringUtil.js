class StringUtil {

    // static contains(subst, str, caseInsensitive) {
    //     for (const c of str) {

    //     }
    // }

    static _compareCharCaseSensitive(c1, c2) {
        return c1.charCodeAt(0) === c2.charCodeAt(0);
    }

    static _compareCharCaseInSensitive(c1, c2) {

        const asCIIC1 = c1.charCodeAt(0);
        const asCIIC2 = c2.charCodeAt(0);

        return asCIIC1 === asCIIC2 || Math.abs(asCIIC1 - asCIIC2) === 32;

    }
}

export {
    StringUtil
}