import express from "express";
import QRCode from "qrcode";
import bodyParser from "body-parser";

const app = express();
const port = 8000;

app.use(express.static('public'));

app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

app.post('/generate-qrcode', async (req, res) => {
  try {
    const { text, logUrl, size } = req.body;

    if (!text) {
      return res.status(400).send('No text provided');
    }
    
    const qrCodeSize = isNaN(Number(size)) ? 400 : Number(size); 
    const qrCodeImage = await QRCode.toDataURL(text, {
      width: qrCodeSize,
      height: qrCodeSize
    });
    
    if(logUrl == "true" || logUrl == true){
      console.log(qrCodeImage);
    }

    res.send(`<img src="${qrCodeImage}" width="${qrCodeSize}" height="${qrCodeSize}"/>`);
  } catch (err) {
    res.status(500).send('Error generating QR code');
  }
});



app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
