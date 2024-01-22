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

const upload = multer({
    storage: storage,
    fileFilter: function (req, file, cb) {
        if (file.mimetype !== 'application/pdf') {
            return cb(new Error('Only PDF files are allowed!'), false);
        }
        cb(null, true);
    }
});

app.post('/return-pdf-with-json', upload.single('pdf'), async (req, res) => {
    try {
        const file = req.file;
        if (!file) {
            return res.status(400).send('No file uploaded.');
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
                body: JSON.stringify({ text: element.url, dotColor, backgroundColor, width, height, margin, dotType, cornerSquareType, cornerSquareColor, cornerDotType, cornerDotColor })
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
        deleteUploadedFile(file.path);
    } catch (err) {
        console.error('Error generating PDF, ' + err);
        res.status(500).send('Error generating PDF, ' + err);
        deleteUploadedFile(file.path);
    }
    console.timeEnd();
});

function deleteUploadedFile(path){
    return new Promise((resolve, reject) => {
        fs.unlink(path, (err) => {
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        });
    })
}

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
