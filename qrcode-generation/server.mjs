import express from "express";
import bodyParser from "body-parser";
import { QRCodeCanvas } from '@loskir/styled-qr-code-node';


const app = express();
const port = 8000;

app.use(express.static('public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.post('/generate-custom-qrcode', async (req, res) => {
  try {
    let { text, width, height, margin, dotColor, backgroundColor, dotType, cornerSquareType, cornerSquareColor, cornerDotType, cornerDotColor } = req.body;

    if (!text) {
      return res.status(400).send('No text provided');
    }

    if (width == NaN || width == undefined || width == null || width == "") {
      width = 300;
    }
    if (height == NaN || height == undefined || height == null || height == "") {
      height = 300;
    }
    if (margin == NaN || margin == undefined || margin == null || margin == "") {
      margin = 0;
    }
    if (dotColor == NaN || dotColor == undefined || dotColor == null || dotColor == "") {
      dotColor = "#000000";
    }
    if (backgroundColor == NaN || backgroundColor == undefined || backgroundColor == null || backgroundColor == "") {
      backgroundColor = "#ffffff";
    }
    if (dotType == NaN || dotType == undefined || dotType == null || dotType == "") {
      dotType = "square";
    }
    if (cornerSquareType == NaN || cornerSquareType == undefined || cornerSquareType == null || cornerSquareType == "") {
      cornerSquareType = "square";
    }
    if (cornerSquareColor == NaN || cornerSquareColor == undefined || cornerSquareColor == null || cornerSquareColor == "") {
      cornerSquareColor = "#000000";
    }
    if (cornerDotType == NaN || cornerDotType == undefined || cornerDotType == null || cornerDotType == "") {
      cornerDotType = "square";
    }
    if (cornerDotColor == NaN || cornerDotColor == undefined || cornerDotColor == null || cornerDotColor == "") {
      cornerDotColor = "#000000";
    }

    const qrCode = new QRCodeCanvas({
      data: text,
      width: width,
      height: height,
      margin: margin,
      image: "https://orpheogroup.com/fr/wp-content/uploads/2020/07/Logo-Orpheo.png",
      dotsOptions: {
        color: dotColor,
        type: dotType
      },
      backgroundOptions: {
        color: backgroundColor
      },
      cornersSquareOptions: {
        type: cornerSquareType,
        color: cornerSquareColor
      },
      cornersDotOptions: {
        type: cornerDotType,
        color: cornerDotColor
      },
      imageOptions: {
        crossOrigin: "anonymous",
        margin: 10,
        hideBackgroundDots: true
      }
    });

    const image = await qrCode.toDataUrl();
    await qrCode.toFile('public/images/qr-code.svg', 'svg');

    res.send(image);
  }
  catch (err) {
    console.error(err);
    res.status(500).send('Error generating QR code');
  }

});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
