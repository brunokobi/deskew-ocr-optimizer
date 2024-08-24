```markdown
# Deskew OCR Optimizer

Este projeto é uma aplicação React que utiliza OCR (Reconhecimento Óptico de Caracteres) para extrair texto de imagens e PDFs. Ele faz uso das bibliotecas `tesseract.js` e `opencv-js` para realizar o OCR e otimizar as imagens.

## Funcionalidades

- Carregar imagens e PDFs.
- Extrair texto de imagens usando OCR.
- Exibir o texto extraído e métricas de desempenho.
- Otimizar imagens para melhorar a precisão do OCR.

## Tecnologias Utilizadas

- React
- Tesseract.js
- OpenCV.js
- React Router

## Instalação

1. Clone o repositório:
   ```bash
   git clone https://github.com/seu-usuario/sendfatura.git
   ```
2. Navegue até o diretório do projeto:
   ```bash
   cd sendfatura
   ```
3. Instale as dependências:
   ```bash
   npm install
   ```

## Uso

1. Inicie a aplicação:
   ```bash
   npm start
   ```
2. Acesse a aplicação em seu navegador:
   ```
   http://localhost:3000
   ```

## Estrutura do Código

- `App.js`: Componente principal da aplicação.
- `SendFatura.js`: Componente que contém a lógica de OCR e manipulação de imagens.
- `App.css`: Estilos da aplicação.
- `loading.js`: Componente de carregamento.

## Exemplo de Código

```javascript
import { useCallback, useEffect, useState } from 'react';
import { createWorker } from 'tesseract.js';
import './App.css';
import { CardLoadingSolar } from '../../component/loading';
import { useNavigate } from 'react-router-dom';
import cv from "@techstark/opencv-js";

function SendFatura() {
  const navigate = useNavigate();  
  const [selectedImage, setSelectedImage] = useState(null);
  const [textResult, setTextResult] = useState("");
  const worker = createWorker();
  const [pdf, setPdf] = useState(""); 
  const [images, setImages] = useState([]);
  const [currentPage, setCurrentPage] = useState(1); 
  const [loading, setLoading] = useState(false);
  const [confidence, setConfidence] = useState(0);
  const [wordCount, setWordCount] = useState(0);
  const [processingTime, setProcessingTime] = useState(0);
  const [WER, setWER] = useState(0);
  const [CER, setCER] = useState(0);
  const [charCount, setCharCount] = useState(0);

  const convertImageToText = useCallback(async () => {
    if (!selectedImage) return;
    
    setLoading(true);
    await worker.load();
    await worker.loadLanguage("por");
    await worker.initialize("por");
    
    const startTime = performance.now();
    
    await worker.recognize(selectedImage)
      .then((result) => {
        const endTime = performance.now();
        const processingTime = endTime - startTime;
        
        const text = result.data.text;
        const confidence = result.data.confidence;
        const words = text.split(/\s+/).filter(word => word.length > 0);
        const wordCount = words.length;
        const charCount = text.length;
        setLoading(false);
        setTextResult(text);
        
        setConfidence(confidence);
        setWordCount(wordCount);
        setCharCount(charCount);
        setProcessingTime(processingTime);
      });
  }, [selectedImage]);

  useEffect(() => {
    convertImageToText();
  }, [selectedImage, convertImageToText]);

  const handleChangeImage = e => {   
    if(images) {
      setSelectedImage(images[0]);     
    } else {
      setSelectedImage(null);
      setTextResult("");
    }
  };

  const handleDeskewOCROptimize = async () => {
    if (images) {
        const imageElement = document.createElement('img');
        imageElement.src = images;
        
        imageElement.onload = async () => {
            const src = cv.imread(imageElement);
            const gray = new cv.Mat();
            cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY, 0);            
            const edges = new cv.Mat();
            cv.Canny(gray, edges, 50, 150);
            const lines = new cv.Mat();
            cv.HoughLines(edges, lines, 1, Math.PI / 180, 100);
            
            let angleSum = 0;
            let lineCount = 0;

            for (let i = 0; i < lines.rows; i++) {
                const line = lines.row(i);
                const rho = line.data32F[0];
                const theta = line.data32F[1];
                const angle = theta * 180 / Math.PI - 90;
                angleSum += angle;
                lineCount++;
            }

            let angle = 0;
            if (lineCount > 0) {
                angle = angleSum / lineCount;
            }
        };
    }
  };
}
```

## Contribuição

Sinta-se à vontade para contribuir com este projeto. Para isso, siga os passos abaixo:

1. Faça um fork do projeto.
2. Crie uma nova branch:
   ```bash
   git checkout -b minha-nova-funcionalidade
   ```
3. Faça suas alterações e commit:
   ```bash
   git commit -m 'Adiciona nova funcionalidade'
   ```
4. Envie para o repositório remoto:
   ```bash
   git push origin minha-nova-funcionalidade
   ```
5. Abra um Pull Request.

## Licença

Este projeto está licenciado sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.
```
