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
    
    if(logUrl == "true" || (typeof logUrl === 'boolean' && logUrl)){
      console.log(qrCodeImage);
    }

    res.send(`<img src="${qrCodeImage}" width="${qrCodeSize}" height="${qrCodeSize}"/>`);
  } catch (err) {
    res.status(500).send('Error generating QR code');
  }
});

app.post('/generate-qrcode-from-json-bulk', async (req, res) => {
  try {
    const { json, logUrl, size } = req.body;

    if (!json) {
      return res.status(400).send('No json provided');
    }

    let jsonInput = JSON.parse(json);
    console.log("input : \n " + jsonInput + "\ntype : " + typeof jsonInput);
    console.log("keys: " + jsonInput.keys)
    let qrCodeContainer = "";
    for(const key of jsonInput.keys){
        try {
            const response = await fetch('http://localhost:8000/generate-qrcode', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ text: key.url, logUrl: false, size: 400 })
            });
            qrCodeContainer += await response.text();
        } catch (error) {
            console.error('Error fetching QR code:', error);
        }
    }

    res.send(qrCodeContainer);
  } catch (err) {
    res.status(500).send('Error generating QR code, ' + err);
  }
});



app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
