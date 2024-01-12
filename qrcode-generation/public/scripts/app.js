var jsonInput;
var secondJsonInput;
var pdfInput;

document.getElementById('generateButton').addEventListener('click', async () => {
    const text = document.getElementById('textInput').value;
    const logUrl = document.getElementById('urlCheckbox').checked;
    if (text.trim() === '') {
        alert('Please enter some text to generate a QR code.');
        return;
    }
    try {
        const response = await fetch('/generate-qrcode', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ text, logUrl })
        });
        const qrCodeHTML = await response.text();
        document.getElementById('qrCodeContainer').innerHTML = qrCodeHTML;
    } catch (error) {
        console.error('Error fetching QR code:', error);
    }
});


const fileInput = document.getElementById('fileInput');
const uploadButton = document.getElementById('uploadButton');

uploadButton.addEventListener('click', () => {
    fileInput.click();
});

fileInput.addEventListener('change', (event) => {
    const file = event.target.files[0];
    


   if (file && file.name.endsWith('.json')) {
    console.log('JSON file selected:', file.name);
    console.log('File selected:', file.name);
    document.getElementById('fileName').innerHTML = file.name;

    const reader = new FileReader();
    reader.onload = (e) => {
        jsonInput = JSON.parse(e.target.result);
        console.log(jsonInput);
        console.log("Type: " + typeof jsonInput);
    };
    reader.readAsText(file);
    
} else {
    alert('Please select a JSON file.');
}

});

document.getElementById('bulkQrCodes').addEventListener('click', async () => {
    if(jsonInput == null){
        alert('Please select a JSON file first.');
        return;
    }
    for(keys of jsonInput.keys){
        try {

            const response = await fetch('/generate-qrcode', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ text: keys.url, logUrl: false, size: 400 })
            });
            const qrCodeHTML = await response.text();
            let div = document.createElement('div');
            let p = document.createElement('p');
            p.innerHTML = keys.url;
            p.classList.add('centerText');
            div.appendChild(p);
            div.innerHTML += qrCodeHTML;
            document.getElementById('qrCodesContainer').appendChild(div);
        } catch (error) {
            console.error('Error fetching QR code:', error);
        }
    }
});

document.getElementById('bulkQrCodesApi').addEventListener('click', async () => {
    if(jsonInput == null){
        alert('Please select a JSON file first.');
        return;
    }
    try {
        console.time();
        const jsonPayload = (typeof jsonInput === 'object') ? JSON.stringify(jsonInput) : jsonInput;

        const response = await fetch('http://localhost:3000/generate-qrcode-from-json-bulk', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ json: jsonPayload, logUrl: false, size: 400 })
        });
        const qrCodeHTML = await response.text();
        document.getElementById('qrCodesContainer').innerHTML = qrCodeHTML;
        console.timeEnd();
    } catch (error) {
        console.error('Error fetching QR code:', error);
    }
});

document.getElementById('uploadForm').addEventListener('submit', function(e) {
    e.preventDefault();

    var formData = new FormData();
    var fileField = document.getElementById('pdf');
    console.log(fileField.files[0]);
    formData.append('pdf', fileField.files[0]);

    fetch('http://localhost:3000/upload', {
        method: 'POST',
        body: formData
    })
    .then(response => response.text())
    .then(result => {
        console.log(result);
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Error uploading file');
    });
});

function fetchPdfThenDownload() {
    fetch('http://localhost:3000/return-pdf-without-json', {
        method: 'POST',
    })
        .then(response => response.blob())
        .then(blob => {
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'download.pdf';
            document.body.appendChild(a);
            a.click();
            a.remove();
        });
}