const Jimp = require("jimp");

const jimp = async (img) => {
  await Jimp.read(img)
    .then((file) => {
      return file
        .cover(250, 250) // resize
        .quality(60) // set JPEG quality
        .greyscale() // set greyscale
        .write(img); // save
    })
    .catch((err) => {
      console.error(err);
    });
};

module.exports = jimp;
