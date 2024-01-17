const previewButton = document.getElementById('previewButton');
previewButton.addEventListener('click', async () => {
    const text = "Sample for demo";
    const width = document.getElementById('customQrCodeWidthPdf').value;
    const height = document.getElementById('customQrCodeHeightPdf').value;
    const margin = document.getElementById('customQrCodeMarginPdf').value;
    const dotColor = document.getElementById('customQrCodeDotColorPdf').value;
    const backgroundColor = document.getElementById('customQrCodeBackgroundColorPdf').value;
    const dotType = document.getElementById('customQrCodeDotTypePdf').value;
    const cornerSquareType = document.getElementById('customQrCodeCornersSquareStylePdf').value;
    const cornerSquareColor = document.getElementById('customQrCodeCornersColorPdf').value;
    const cornerDotType = document.getElementById('customQrCodeCornersDotStylePdf').value;
    const cornerDotColor = document.getElementById('customQrCodeCornersDotColorPdf').value;

    fetch('http://localhost:8000/generate-custom-qrcode-return-img', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({text, width, height, margin, dotColor, backgroundColor, dotType, cornerSquareType, cornerSquareColor, cornerDotType, cornerDotColor})
    })
        .then(response => response.text())
        .then(result => {
            document.getElementById('customQrCodePlaceholder').innerHTML = result;
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Error generating QR code');
        });
});

var jsonInput;
const customQrCodeJson = document.getElementById('customQrCodeJson');
customQrCodeJson.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (file && file.name.endsWith('.json')) {
        const reader = new FileReader();
        reader.onload = (e) => {
            jsonInput = JSON.parse(e.target.result);
        };
        reader.readAsText(file);
    } else {
        alert('Please select a JSON file.');
    }
});

document.getElementById('customQrCodeFormPdf').addEventListener('submit', async function (e) {
    e.preventDefault();

    const width = document.getElementById('customQrCodeWidthPdf').value;
    const height = document.getElementById('customQrCodeHeightPdf').value;
    const margin = document.getElementById('customQrCodeMarginPdf').value;
    const dotColor = document.getElementById('customQrCodeDotColorPdf').value;
    const backgroundColor = document.getElementById('customQrCodeBackgroundColorPdf').value;
    const dotType = document.getElementById('customQrCodeDotTypePdf').value;
    const cornerSquareType = document.getElementById('customQrCodeCornersSquareStylePdf').value;
    const cornerSquareColor = document.getElementById('customQrCodeCornersColorPdf').value;
    const cornerDotType = document.getElementById('customQrCodeCornersDotStylePdf').value;
    const cornerDotColor = document.getElementById('customQrCodeCornersDotColorPdf').value;

    const pdfFile = document.getElementById('customQrCodePdf').files[0];

    var formData = new FormData();

    if (!pdfFile) {
        alert('Please select a PDF file first.');
        return;
    }
    if (!jsonInput) {
        alert('Please select a JSON file first.');
        return;
    }

    formData.append('pdf', pdfFile);
    formData.append('json', JSON.stringify(jsonInput));
    formData.append('width', width);
    formData.append('height', height);
    formData.append('margin', margin);
    formData.append('dotColor', dotColor);
    formData.append('backgroundColor', backgroundColor);
    formData.append('dotType', dotType);
    formData.append('cornerSquareType', cornerSquareType);
    formData.append('cornerSquareColor', cornerSquareColor);
    formData.append('cornerDotType', cornerDotType);
    formData.append('cornerDotColor', cornerDotColor);


    fetch('http://localhost:3000/return-pdf-with-json', {
        method: 'POST',
        body: formData
    })
    .then(response => response.blob())
    .then(blob => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'downloadjson.pdf';
        document.body.appendChild(a);
        a.click();
        a.remove();
    });

});
