const express = require('express');
const router = express.Router();
var path = require('path');
const Video =require('../models/video');
const fs = require("fs");

router.post('/upload', function(req, res) {
    let dataFile;
    let uploadPath;
  
    if (!req.files || Object.keys(req.files).length === 0) {
      return res.status(400).send('No files were uploaded.');
    }
  
    // The name of the input field (i.e. "dataFile") is used to retrieve the uploaded file
    dataFile = req.files.dataFile;
    let fileName = Date.now() + dataFile.name;

    uploadPath = path.join(__dirname, '../../public', fileName );
  
    // Use the mv() method to place the file somewhere on your server
    dataFile.mv(uploadPath, function(err) {
      if (err)
        return res.status(500).send(err);
      res.send({fileName});
    });
});

router.get('/video/:id', async function(req, res) {
    let videoData = await Video.findOne({_id:req.params.id});
    // const stream = fs.createReadStream(path.join(__dirname, '../../public', videoData.fileName ));
    // stream.pipe(res);
    const range = req.headers.range;
    if (!range) {
        res.status(400).send("Requires Range header");
    }
    const videoPath = path.join(__dirname, '../../public', videoData.fileName );
    const videoSize = fs.statSync(path.join(__dirname, '../../public', videoData.fileName )).size;
    const CHUNK_SIZE = 6 ** 6;
    const start = Number(range.replace(/\D/g, ""));
    const end = Math.min(start + CHUNK_SIZE, videoSize - 1);
    const contentLength = end - start + 1;
    const headers = {
        "Content-Range": `bytes ${start}-${end}/${videoSize}`,
        "Accept-Ranges": "bytes",
        "Content-Length": contentLength,
        "Content-Type": "video/mp4",
    };
    res.writeHead(206, headers);
    const videoStream = fs.createReadStream(videoPath, { start, end });
    videoStream.pipe(res);
});

module.exports = router;