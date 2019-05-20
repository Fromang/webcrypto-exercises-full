export function uint8ArrayToString(buf) {
    const binStr = Array.prototype.map.call(buf, function (ch) {
        return String.fromCharCode(ch);
    }).join('');
    return binStr;
}

export function arrayBufferToHex(buffer) {
    return Array.prototype.map.call(
        new Uint8Array(buffer),
        x => ('00' + x.toString(16)).slice(-2)
    ).join('');
}

export function stringToUint8Array(str) {
    const buf = new Uint8Array(str.length);
    Array.prototype.forEach.call(str, function (ch, i) {
        buf[i] = ch.charCodeAt(0);
    });
    return buf;
}
