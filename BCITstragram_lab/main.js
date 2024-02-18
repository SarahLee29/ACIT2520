const path = require("path");
/*
*
 * Project: Milestone 1
 * File Name: main.js
 * Description:  users are allowed to filter images based on grayscaled, sepiaTone, and blur
 *
 * Created Date: Feb 17, 2024
 * Author: Xiaoting Li
 *
 */

const IOhandler = require("./IOhandler");
const zipFilePath = path.join(__dirname, "myfile.zip");
const pathUnzipped = path.join(__dirname, "unzipped");
const pathProcessed = path.join(__dirname, "grayscaled");
const pathSeProcessed = path.join(__dirname, "sepia");
const pathBlurProcessed = path.join(__dirname, "blur");

IOhandler.unzip(zipFilePath, pathUnzipped)
    .then(() => IOhandler.readDir(pathUnzipped))  // ????????with ()=> :unzip execute after readDir, without ()=> unzip excute first
    .then((imgs) => {
        imgs.forEach(img => {
            IOhandler.grayScale(img, pathProcessed);    // greyscale
            IOhandler.sepiaTone(img, pathSeProcessed);  // sepiaTone
            IOhandler.blur(img, pathBlurProcessed)      // blur
        })
    })

// ??????????????????
// do we have to return promise to control the sequence? 
// since we use .then, we can achieve this by having one promise followed by normal async function?



