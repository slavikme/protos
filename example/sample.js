Array.prototype.toString = function () {
    return JSON.stringify(this);
};

String.prototype.trim = function (char) {
    if (char instanceof RegExp) {
        char = char.source;
    } else if (typeof char === 'string') {
        char = `[${char.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}]`;
    }
    const regex = new RegExp(`^${char}+|${char}+$`, 'g');
    return this.replace(regex, '');
};


Number.prototype.toFixed = function (digits) {
    if (digits >= 0) {
        return this.__original_toFixed(digits);
    }
    const strNum = String(this);
    const size = strNum.length;
    return strNum.padStart(-digits + size - `${strNum}.`.indexOf('.'), '0');
};

const arrayToStringLoc1 = () => [1, 2, 3].toString();
const stringTrimLoc1 = () => "   Hello!!!!".trim(/[\s!]/);
const numberToFixedLoc1 = () => (15.8).toFixed(-4);
