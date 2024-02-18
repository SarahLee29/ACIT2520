/*
 * Project: Milestone 1
 * File Name: IOhandler.js
 * Description: Collection of functions for files input/output related operations
 *
 * Created Date: Feb 17th 2024
 * Author: Xiaoting Li
 *
 */
const yauzl = require("yauzl-promise");
const fs = require('fs'),
  { pipeline } = require('stream/promises'),
  PNG = require("pngjs").PNG;
const path = require("path");
const Jimp = require('jimp');

/**
 * Description: decompress file from given pathIn, write to given pathOut
 *
 * @param {string} pathIn
 * @param {string} pathOut
 * @return {promise}
 */

const unzip = async (pathIn, pathOut) => {  //?????how to know it returns promise???
  const zip = await yauzl.open(pathIn);
  try {
    for await (const entry of zip) {
      if (entry.filename.endsWith('/')) {
        await fs.promises.mkdir(`${pathOut}/${entry.filename}`, { recursive: true });
      } else {
        const readStream = await entry.openReadStream();
        const writeStream = fs.createWriteStream(
          `${pathOut}/${entry.filename}`
        );
        await pipeline(readStream, writeStream);
      }
    }
    console.log("Extraction operation complete");
  } finally {
    await zip.close();
  }
};

/**
 * Description: read all the png files from given directory and return Promise containing array of each png file path
 *
 * @param {string} path
 * @return {promise}
 */

const readDir = (dir) => {
  return new Promise((res, rej) => {
    fs.readdir(dir, (err, fileNames) => {
      if (err) {
        console.error(err);
        rej(err);
      } else {
        filePathArray = [];
        fileNames.forEach((fileName) => {
          if (path.extname(fileName) === ".png") {
            filePath = path.join(dir, fileName);
            filePathArray.push(filePath);
          }
        })
        res(filePathArray);
      }
    })
  })
};


/**
 * Description: Read in png file by given pathIn,
 * convert to grayscale and write to given pathOut
 *
 * @param {string} filePath
 * @param {string} pathProcessed
 * @return {promise}
 */

const grayScale = (pathIn, pathOut) => {
  fs.createReadStream(pathIn)
    // .on("data", () => console.log(pathIn)) //????????????i don't understand the output
    .pipe(
      new PNG({
        filterType: 4,
      })
    )
    .on("parsed", function () {
      return new Promise((res, rej) => {
        try {
          for (var y = 0; y < this.height; y++) {
            for (var x = 0; x < this.width; x++) {
              var idx = (this.width * y + x) << 2;
              // invert color
              var value = (0.2126 * this.data[idx]) + (0.7152 * this.data[idx + 1]) + (0.0722 * this.data[idx + 2]);
              this.data[idx] = this.data[idx + 1] = this.data[idx + 2] = value;
            }
          }
          var name = `grey_processed_${path.basename(pathIn)}`;
          var processedFile = path.join(pathOut, name);
          res(this.pack().pipe(fs.createWriteStream(processedFile)));
        } catch (err) {
          rej(err)
        }
      });
    })
}

// convert to sepiaTone
const sepiaTone = (pathIn, pathOut) => {
  fs.createReadStream(pathIn)
    .pipe(
      new PNG({
        filterType: 4,
      })
    )
    .on("parsed", function () {
      return new Promise((res, rej) => {
        try {
          for (var y = 0; y < this.height; y++) {
            for (var x = 0; x < this.width; x++) {
              var idx = (this.width * y + x) << 2;
              // invert color
              let r = this.data[idx];
              let g = this.data[idx + 1];
              let b = this.data[idx + 2];
              this.data[idx] = Math.min(255, 0.393 * r + 0.769 * g + 0.189 * b);
              this.data[idx + 1] = Math.min(255, 0.349 * r + 0.686 * g + 0.168 * b);
              this.data[idx + 2] = Math.min(255, 0.272 * r + 0.534 * g + 0.131 * b);
            }
          }
          var name = `sepia_processed_${path.basename(pathIn)}`;
          var processedFile = path.join(pathOut, name);
          res(this.pack().pipe(fs.createWriteStream(processedFile)));
        } catch (err) {
          rej(err)
        }
      });
    })
}

// convert to blur
const blur = (pathIn, pathOut) => {
  var name = `blur_processed_${path.basename(pathIn)}`;
  var processedFile = path.join(pathOut, name);
  Jimp.read(pathIn)
    .then((img) => {
      img.blur(5);
      img.write(processedFile);
    })
}

// ??????when we wrap a block of codes inside a promise, what needs to be considered?

module.exports = {
  unzip,
  readDir,
  grayScale,
  sepiaTone,
  blur
};
