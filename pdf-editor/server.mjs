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

app.post('/upload', upload.single('pdf'), (req, res) => {
    const file = req.file;
    if (!file) {
        res.status(400).send('No file uploaded.');
        return;
    }
    res.send('File uploaded successfully.');
});

app.post('/return-pdf-without-json', async (req, res) => {
    try {
        const pdfBuffer = await fs.readFile('./public/uploads/test.pdf');
        const pdfDoc = await PDFDocument.PDFDocument.load(pdfBuffer);

        const response = await fetch('http://localhost:8000/generate-qrcode-return-base64', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ text: 'https://orpheogroup.com/?activation_key=123456-987654', darkColor: '#ffffff', lightColor: '#0000' })
        });

        const qrCodeImageBytes = await response.text();

        const qrCodeImage = await pdfDoc.embedPng(qrCodeImageBytes);

        const form = pdfDoc.getForm();
        const imageButton = form.getButton('qrcode_af_image');
        form.getTextField('activation-key').setText('123456 987654');
        form.getTextField('activation-key').setAlignment(PDFDocument.TextAlignment.Center);
        imageButton.setImage(qrCodeImage);

        const pdfBytes = await pdfDoc.save();
        res.setHeader('Content-Disposition', 'attachment; filename=download.pdf');
        res.setHeader('Content-Type', 'application/pdf');
        res.send(Buffer.from(pdfBytes));
    } catch (err) {
        console.error('Error generating PDF, ' + err);
        res.status(500).send('Error generating PDF, ' + err);
    }
});

app.post('/return-pdf-with-json', upload.single('pdf'), async (req, res) => {
    try {
        const file = req.file;
        if (!file) {
            res.status(400).send('No file uploaded.');
            return;
        }

        console.time();
        const newPdfDoc = await PDFDocument.PDFDocument.create();

        const jsonInput = JSON.parse(req.body.json);
        const { width, height, margin, dotColor, backgroundColor, dotType, cornerSquareType, cornerSquareColor, cornerDotType, cornerDotColor } = req.body;

        for await (const element of jsonInput.keys) {
            const pdfBuffer = await fs.readFile(file.path);
            const pdfDoc = await PDFDocument.PDFDocument.load(pdfBuffer);
        
            const response = await fetch('http://localhost:8000/generate-custom-qrcode', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ text: element.url, dotColor: dotColor, lightColor: backgroundColor, width: width, height: height, margin: margin, dotType: dotType, cornerSquareType: cornerSquareType, cornerSquareColor: cornerSquareColor, cornerDotType: cornerDotType, cornerDotColor: cornerDotColor })
            });
            const qrCodeImageBytes = await response.text();
            const qrCodeImage = await pdfDoc.embedPng(qrCodeImageBytes);
        
            const form = pdfDoc.getForm();
            const textField = form.getTextField('activation-key');
            textField.setText(element.key);
            textField.setAlignment(PDFDocument.TextAlignment.Center);
        
            const imageButton = form.getButton('qrcode_af_image');
            imageButton.setImage(qrCodeImage);

            form.flatten();

            const [firstPage, secondPage] = await newPdfDoc.copyPages(pdfDoc, [0, 1]);
            newPdfDoc.addPage(firstPage);
            newPdfDoc.addPage(secondPage);
        }
        
        const finalPdfBytes = await newPdfDoc.save();
        res.setHeader('Content-Disposition', 'attachment; filename=download.pdf');
        res.setHeader('Content-Type', 'application/pdf');
        res.send(Buffer.from(finalPdfBytes));
    } catch (err) {
        console.error('Error generating PDF, ' + err);
        res.status(500).send('Error generating PDF, ' + err);
    }
    console.timeEnd();
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
