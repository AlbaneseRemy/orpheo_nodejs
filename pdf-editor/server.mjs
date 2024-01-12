import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import PDFDocument from "pdf-lib";
import multer from "multer";
import { promises as fs } from 'fs';


const app = express();
const port = 3000;

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/uploads/')
    },
    filename: function (req, file, cb) {
        const fileName = file.originalname.toLowerCase().split(' ').join('-');
        cb(null, fileName)
    }
});

app.use(express.static('public'));

app.use(cors({
    origin: 'http://localhost:8000'
}));

app.use(express.json({ limit: '10mb' }));



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
        for (const key of jsonInput.keys) {
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

const upload = multer({
    storage: storage,
    fileFilter: function (req, file, cb) {
        if (file.mimetype !== 'application/pdf') {
            return cb(new Error('Only PDF files are allowed!'), false);
        }
        cb(null, true);
    }
});

// Route for file upload
app.post('/upload', upload.single('pdf'), (req, res) => {
    // Handle the uploaded file here
    const file = req.file;
    console.log(file);
    if(!file){
        res.status(400).send('No file uploaded.');
        return;
    }
    res.send('File uploaded successfully.');
});

app.post('/return-pdf-without-json', async (req, res) => {    
    try{
        const pdfBuffer = await fs.readFile('./public/uploads/dod_character.pdf');
        const pdfDoc = await PDFDocument.PDFDocument.load(pdfBuffer);
        const qrCodeImageBytes = "data:image/png;base64,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"
        const qrCodeImage = await pdfDoc.embedPng(qrCodeImageBytes);

        const form = pdfDoc.getForm();
        const imageButton = form.getButton('CHARACTER IMAGE');
        imageButton.setImage(qrCodeImage);

        const pdfBytes = await pdfDoc.save();
        res.setHeader('Content-Disposition', 'attachment; filename=download.pdf');
        res.setHeader('Content-Type', 'application/pdf');
        res.send(Buffer.from(pdfBytes));
    } catch(err){
        console.error('Error generating PDF, ' + err);
        res.status(500).send('Error generating PDF, ' + err);
    }
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
