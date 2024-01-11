import express from "express";
import cors from "cors";
import bodyParser from "body-parser";


const app = express();
const port = 3000;

app.use(express.static('public'));

app.use(cors({
    origin: 'http://localhost:8000'
  }));


app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

app.get('/', (req, res) => {
    res.send('Hello World!');
});

app.post('/generate-qrcode-from-json-bulk', async (req, res) => {
    try {
      const { json, logUrl, size } = req.body;
  
      if (!json) {
        return res.status(400).send('No json provided');
      }
  
      let jsonInput = JSON.parse(json);
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
