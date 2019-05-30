
/* Example of P1363 codification:
 *  // r
 *  000305
 *  // s
 *  810522
 *
 * It always have the same size. It is always even and the fist half part is r. The rest is s.
 */

/*
 * Example of DER codification
 *   // SEQUENCE
 *   30
 *   // (length of payload)
 *   0A
 *   // INTEGER(r)
 *   02
 *       // (length of payload)
 *       02
 *       // note the leading 0x00 is omitted
 *       0305
 *   // INTEGER(s)
 *   02
 *       // (length of payload)
 *       04
 *       // Since INTEGER is a signed type, but this represented a positive number,
 *       // a 0x00 has to be inserted to keep the sign bit clear.
 *      00810522
 */

const derTypes = {
    "INTEGER": 0x02,
    "SEQUENCE": 0x30,
}

const curveLengths = {
    "P-256": 256 / 8,
    "P-384": 384 / 8,
    "P-512": 512 / 8
}

/**
 * Put this function in a reduce to remove left zeros and keep sign bit to 0
 * @param {Uint8Array} array
 * @returns {Uint8Array} Clean UInt8Array
 */
function removeZeroes(array) {
    return array.reduce((prev, curr, i) => {
        if(!prev && curr === 0) return; // Continue removing elements
        if(!prev) { // Initialize the resultant array
            // Since INTEGER is a signed type, but this represented a positive number,
            // a 0x00 has to be inserted to keep the sign bit clear.
            const signBit = curr >= 128;
            prev = new Uint8Array(array.length - i + signBit); // Add a boolean means add 1 if true
        }

        // Set current item
        prev[i - array.length + prev.length] = curr;

        return prev;
    }, undefined);
}

/**
 * Convert from a ECDSA signature from P1363 to DER.
 * <a href="https://stackoverflow.com/questions/39554165/ecdsa-signatures-between-node-js-and-webcrypto-appear-to-be-incompatible">reference</a>
 * @param {ArrayBuffer} p1363Signature A signature in p1363 format
 * @returns {ArrayBuffer} DER formatted signature.
 */
export function signatureP1363ToDer(p1363Signature) {
    // Prepare the array buffer to work
    const signature = new Uint8Array(p1363Signature);
    const signLength = signature.length;

    // Extract r and s and clean them
    const r = removeZeroes(new Uint8Array(signature.slice(0, signLength / 2)));
    const s = removeZeroes(new Uint8Array(signature.slice(signLength / 2)));

    // Format it in ASN1 format.
    return new Uint8Array([
        derTypes["SEQUENCE"], // SEQUENCE
        4 + r.length + s.length, // Length of payload.
        derTypes["INTEGER"], // INTEGER(r)
            r.length, // Length of r
            ...r,
        derTypes["INTEGER"], // INTEGER(s)
            s.length,
            ...s
    ]).buffer;
}

/**
 *
 * @param {Uint8Array} buffer
 * @param {number} index
 * @returns {Uint8Array}
 */

function derExtractInteger(buffer, index) {
    // Check integer type
    if(buffer[index] !== derTypes["INTEGER"]) {
        throw Error("Wrong signature format");
    }

    const integerLength = buffer[index + 1];
    const end = index + 2 + integerLength;
    if(end > buffer.length) {
        throw Error("Wrong signature format");
    }

    return {
        integer: buffer.subarray(index + 2, end),
        end: end
    };
}

/**
 *
 * @param {Uint8Array} buffer
 * @param {number} length
 */
function fixed(buffer, length) {
    if(buffer.length > length) {
        return buffer.slice(buffer.length - length, buffer.length);
    } else if(length > buffer.length) {
        const fixedBuffer = new Uint8Array(length);
        for(let i = 0; i < length; i++) {
            fixedBuffer[i + length - buffer.length] = buffer[i];
        }
        return fixedBuffer;
    } else {
        return buffer;
    }
}

/**
 * Convert from a ECDSA signature from P1363 to DER.
 * <a href="https://stackoverflow.com/questions/39554165/ecdsa-signatures-between-node-js-and-webcrypto-appear-to-be-incompatible">reference</a>
 * @param {ArrayBuffer} p1363Signature A signature in p1363 format
 * @returns {ArrayBuffer} DER formatted signature.
 */
export function signatureDerToP1363(derSignature, curveName) {

    // Prepare the array buffer to work
    const signature = new Uint8Array(derSignature);
    const integerLength = curveLengths[curveName];

    // Check first bit is sequence
    if(signature[0] !== derTypes["SEQUENCE"])  {
        return new Error("In DER signatures, first bit must be 0x30");
    }

    // Check payload length
    const payloadLength = signature[1];
    if(signature.length - 2 !== payloadLength)  {
        return new Error("Wrong signature length");
    }

    // Extract r and s and clean them
    const { integer: r, end } = derExtractInteger(signature, 2);
    const { integer: s } = derExtractInteger(signature, end);
    const fixedR = fixed(r, integerLength);
    const fixedS = fixed(s, integerLength);

    // Format it in P1363 format
    return new Uint8Array([
        ...fixedR,
        ...fixedS
    ]).buffer;
}
