/* eslint-disable @typescript-eslint/no-use-before-define */
import * as blobUtil from 'blob-util';

// Receives rtf and html data
// Returns dictionary object of original img[src]:imgBlob
// We must read the data from the rtf because the browser is not allowed to render pasted images using simply the src from your clipboard
export const imagePastingListener = (rtf: string, html: string) => {
  const ret: { [key: string]: string } = {};
  const imgTags = extractTagsFromHtml(html);
  const newSrcValues = [];

  const hexImages = extractFromRtf(rtf);
  if (hexImages.length === 0) {
    return;
  }

  for (let i = 0; i < hexImages.length; i++) {
    const base64string = createSrcWithBase64(hexImages[i]);
    const blob = blobUtil.base64StringToBlob(base64string);
    const URLObj = window.URL || window.webkitURL;
    const url = URLObj.createObjectURL(blob);
    newSrcValues.push(url);
  }

  if (imgTags.length === newSrcValues.length) {
    for (let i = 0; i < imgTags.length; i++) {
      // Replace only `file` urls of images ( shapes get newSrcValue with null ).
      if (imgTags[i].indexOf('file://') === 0 && newSrcValues[i]) {
        ret[imgTags[i]] = newSrcValues[i];
      }
    }
  }

  return ret;
};

const extractFromRtf = (rtfContent: string) => {
  const ret: { hex: any; type: string }[] = [];
  const rePictureHeader =
    /\{\\pict[\s\S]+?\\bliptag-?\d+(\\blipupi-?\d+)?(\{\\\*\\blipuid\s?[\da-fA-F]+)?[\s}]*?/;
  const rePicture = new RegExp(
    `(?:(${rePictureHeader.source}))([\\da-fA-F\\s]+)\\}`,
    'g',
  );
  let imageType = '';

  const wholeImages = rtfContent.match(rePicture);
  if (!wholeImages) {
    return ret;
  }

  for (let i = 0; i < wholeImages.length; i++) {
    if (rePictureHeader.test(wholeImages[i])) {
      if (wholeImages[i].indexOf('\\pngblip') !== -1) {
        imageType = 'image/png';
      } else if (wholeImages[i].indexOf('\\jpegblip') !== -1) {
        imageType = 'image/jpeg';
      } else {
        continue;
      }

      ret.push({
        hex: wholeImages[i]
          .replace(rePictureHeader, '')
          .replace(/[^\da-fA-F]/g, ''),
        type: imageType,
      });
    }
  }

  return ret;
};

export const extractTagsFromHtml = (html: string) => {
  const regexp = /<img[^>]+src="([^"]+)[^>]+/g;
  const ret = [];
  let item;

  while ((item = regexp.exec(html))) {
    ret.push(item[1]);
  }

  return ret;
};

const convertHexStringToBytes = (hexString: string) => {
  const bytesArray = [];
  const bytesArrayLength = hexString.length / 2;
  let i;

  for (i = 0; i < bytesArrayLength; i++) {
    bytesArray.push(parseInt(hexString.substr(i * 2, 2), 16));
  }
  return bytesArray;
};

function createSrcWithBase64(img: { hex: any }) {
  return convertBytesToBase64(convertHexStringToBytes(img.hex));
}

const convertBytesToBase64 = (bytesArray: string | any[]) => {
  // Bytes are `8bit` numbers, where base64 use `6bit` to store data. That's why we process 3 Bytes into 4 characters representing base64.
  //
  // Algorithm:
  // 1. Take `3 * 8bit`.
  // 2. If there is less than 3 bytes, fill empty bits with zeros.
  // 3. Transform `3 * 8bit` into `4 * 6bit` numbers.
  // 4. Translate those numbers to proper characters related to base64.
  // 5. If extra zero bytes were added fill them with `=` sign.
  //
  // Example:
  // 1. Bytes Array: [ 8, 161, 29, 138, 218, 43 ] -> binary: `0000 1000 1010 0001 0001 1101 1000 1010 1101 1010 0010 1011`.
  // 2. Binary: `0000 10|00 1010| 0001 00|01 1101| 1000 10|10 1101| 1010 00|10 1011` ← `|` (pipe) shows where base64 will cut bits during transformation.
  // 3. Now we have 6bit numbers (written in decimal values), which are translated to indexes in `base64characters` array.
  //    Decimal: `2 10 4 29 34 45 40 43` → base64: `CKEditor`.
  const base64characters =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  let base64string = '';
  const bytesArrayLength = bytesArray.length;
  let i;

  for (i = 0; i < bytesArrayLength; i += 3) {
    const array3 = bytesArray.slice(i, i + 3);
    const array3length = array3.length;
    const array4 = [];

    if (array3length < 3) {
      for (let j = array3length; j < 3; j++) {
        //@ts-ignore
        array3[j] = 0;
      }
    }

    // 0xFC -> 11111100 || 0x03 -> 00000011 || 0x0F -> 00001111 || 0xC0 -> 11000000 || 0x3F -> 00111111
    array4[0] = (array3[0] & 0xfc) >> 2;
    array4[1] = ((array3[0] & 0x03) << 4) | (array3[1] >> 4);
    array4[2] = ((array3[1] & 0x0f) << 2) | ((array3[2] & 0xc0) >> 6);
    array4[3] = array3[2] & 0x3f;

    for (let j = 0; j < 4; j++) {
      // Example: if array3length === 1, then we need to add 2 equal signs at the end of base64.
      // array3[ 0 ] is used to calculate array4[ 0 ] and array4[ 1 ], so there will be regular values,
      // next two ones have to be replaced with `=`, because array3[ 1 ] and array3[ 2 ] wasn't present in the input string.
      if (j <= array3length) {
        base64string += base64characters.charAt(array4[j]);
      } else {
        base64string += '=';
      }
    }
  }
  return base64string;
};
