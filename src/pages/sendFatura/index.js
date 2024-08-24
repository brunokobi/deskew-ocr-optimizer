import { useCallback, useEffect, useState } from 'react';
import { createWorker } from 'tesseract.js';
import './App.css';
import { CardLoadingSolar } from '../../component/loading';
import { useNavigate } from 'react-router-dom';
import cv from "@techstark/opencv-js";
const PDFJS = window.pdfjsLib;
function SendFatura() {
  const navigate = useNavigate();  
  const [selectedImage, setSelectedImage] = useState(null);
  const [textResult, setTextResult] = useState("");
  const worker = createWorker();
  /// PDF
  const [pdf, setPdf] = useState(""); 
  const [images, setImages] = useState([]);
  const [currentPage, setCurrentPage] = useState(1); 
  const [loading, setLoading] = useState(false);
  
  const[confidence,setConfidence] = useState(0);
  const[wordCount,setWordCount] = useState(0);
  const[processingTime,setProcessingTime] = useState(0);
  const[WER,setWER] = useState(0);
  const[CER,setCER] = useState(0);
  const[charCount,setCharCount] = useState(0);
  



  const convertImageToText = useCallback(async () => {
    if (!selectedImage) return;
    
    setLoading(true);
    await worker.load();
    await worker.loadLanguage("por");
    await worker.initialize("por");
    
    const startTime = performance.now(); // Inicia o cronômetro
    
    await worker.recognize(selectedImage)
      .then((result) => {
        const endTime = performance.now(); // Finaliza o cronômetro
        const processingTime = endTime - startTime; // Calcula o tempo de processamento
        
        const text = result.data.text;
        const confidence = result.data.confidence;
        const words = text.split(/\s+/).filter(word => word.length > 0); // Lista de palavras
        const wordCount = words.length; // Contagem de palavras
        const charCount = text.length; // Contagem de caracteres
        setLoading(false);
        setTextResult(text);
        
        // Defina as métricas para uso posterior
        setConfidence(confidence);
        setWordCount(wordCount);
        setCharCount(charCount);
        setProcessingTime(processingTime);
       
      });
    // eslint-disable-next-line
  }, [selectedImage]);

  
  useEffect(() => {
    convertImageToText();
  }, [selectedImage, convertImageToText])

  const handleChangeImage = e => {   
    if(images) {
      setSelectedImage(images[0]);     
    } else {
      setSelectedImage(null);
      setTextResult("")
    }
  }


  
  const handleDeskewOCROptimize = async () => {
    if (images) {
        const imageElement = document.createElement('img');
        imageElement.src = images;
        
        imageElement.onload = async () => {
            // Carregar a imagem com OpenCV.js
            const src = cv.imread(imageElement);
            
            // Converter para escala de cinza
            const gray = new cv.Mat();
            cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY, 0);            
            
            // Aplicar detecção de bordas
            const edges = new cv.Mat();
            cv.Canny(gray, edges, 50, 150);
            
            // Aplicar a Transformação de Hough para detectar linhas
            const lines = new cv.Mat();
            cv.HoughLines(edges, lines, 1, Math.PI / 180, 100); // Ajuste o parâmetro de detecção conforme necessário
            
            let angleSum = 0;
            let lineCount = 0;

            // Calcular o ângulo médio das linhas detectadas
            for (let i = 0; i < lines.rows; i++) {
                const line = lines.row(i);
                const rho = line.data32F[0];
                const theta = line.data32F[1];

                // Calcular o ângulo da linha
                const angle = theta * 180 / Math.PI - 90;
                angleSum += angle;
                lineCount++;
            }

            let angle = 0;
            if (lineCount > 0) {
                angle = angleSum / lineCount;
            }

            // Corrigir a inclinação da imagem
            let rotationAngle = -angle;

            // Garantir que o eixo Y não seja invertido
            if (rotationAngle > 90) {
                rotationAngle -= 180;
            } else if (rotationAngle < -90) {
                rotationAngle += 180;
            }

            if (Math.abs(rotationAngle) > 0) {
                const center = new cv.Point(src.cols / 2, src.rows / 2);
                const M = cv.getRotationMatrix2D(center, rotationAngle, 1);
                const dst = new cv.Mat();
                cv.warpAffine(src, dst, M, new cv.Size(src.cols, src.rows), cv.INTER_LINEAR, cv.BORDER_REPLICATE, new cv.Scalar());
                
                // Exibir a imagem corrigida
                const deskewedCanvas = document.createElement('canvas');
                cv.imshow(deskewedCanvas, dst);               
                setSelectedImage(deskewedCanvas.toDataURL());

                // Limpar a memória
                dst.delete();
                M.delete();
            } else {
                // Manter a imagem original se o ângulo estiver dentro da tolerância
                setSelectedImage(images);
            }
            
            // Limpar a memória
            edges.delete();
            lines.delete();
            src.delete();
            gray.delete();            
        };
        
        imageElement.onerror = (e) => {
            console.error('Erro ao carregar a imagem:', e);
        };
    } else {
        setSelectedImage(null);
        setTextResult("");
    }
};






  
  

  //const  async function showPdf(event) {
  const showPdf = async (event) => {
    try {      
      const file = event.target.files[0];
      const uri = URL.createObjectURL(file);
      var _PDF_DOC = await PDFJS.getDocument({ url: uri });
      setPdf(_PDF_DOC);      
      document.getElementById("file-to-upload").value = "";
      handleChangeImage();
    } catch (error) {
      alert(error.message);
    }
  }

  //async function renderPage() {
  const renderPage = async () => {   
    const imagesList = [];
    const canvas = document.createElement("canvas");
    canvas.setAttribute("className", "canv");   

    for (let i = 1; i <= pdf.numPages; i++) {
      var page = await pdf.getPage(i);
      var viewport = page.getViewport({ scale: 3 });
      canvas.height = viewport.height;
      canvas.width = viewport.width;
      var render_context = {
        canvasContext: canvas.getContext("2d"),
        viewport: viewport
      };
      await page.render(render_context).promise;
      let img = canvas.toDataURL("image/jpg",1.0);     
      imagesList.push(img);
    }
    setImages(imagesList);  
  }

  useEffect(() => {
    pdf && renderPage();
    // eslint-disable-next-line
  }, [pdf, currentPage]);


  const styles = {
    wrapper: {
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      gap: "5px"
    },
    imageWrapper: {
      // width: "300px",
      // height: "350px",
      border: "1px solid rgba(0,0,0,0.15)",
      borderRadius: "3px",
      boxShadow: "0 2px 5px 0 rgba(0,0,0,0.25)",
      padding: "0"
    }
  };

  const clearAll = () => {
    setPdf("");
    setImages([]);
    setCurrentPage(1);  
    setSelectedImage(null);
    setTextResult("");
    setLoading(false);

  }



  return (
    <div className="bg-light">
      <h2 className='text-center text-primary mb-4' >
        Teste de OCR Tessaract.js
      </h2>
      <div className="containe text-center text-primary">       
      <button
        id="upload-button"
        className="btn btn-primary mx-2"
        onClick={() => document.getElementById("file-to-upload").click()}
      >
        Selecione o PDF
      </button>
     
      <input
        type="file"
        id="file-to-upload"
        accept="application/pdf"
        hidden
        onChange={showPdf}
      />
      <button onClick={handleDeskewOCROptimize}
       className="btn btn-primary mx-2"
       >Deskew</button>          
       <button onClick={handleChangeImage}
       className="btn btn-primary mx-2"
       >Tesseract</button>      
        <button onClick={clearAll}
        className="btn btn-danger mx-2"
        >Limpar</button>
      </div>      

      <div className="result">
      <div id="image-convas-row">           
            <div style={styles.wrapper}>
            {!selectedImage && (
              images.map((image, idx) => (
                <div key={idx} style={styles.imageWrapper}>
                  <img
                    id="image-generated"
                    src={image}
                    alt="pdfImage"
                    style={{
                      width: "50%",
                      height: "50%",
                      margin: "0",
                      border: "none"
                    }}
                  />
                </div>
              ))
            )}

             {selectedImage && (
          <div className="box-image">
            <img src={selectedImage} alt="thumb" 
            style={{width: "100%", height: "100%"}}
            />
          </div>
        )}

        {textResult && (
          <div className="box-p">
            <p>{textResult}</p>
            <p>Confiança: {confidence}%</p>
            <p>Palavras: {wordCount}</p>
            <p>Caracteres: {charCount}</p>
            <p>Tempo de processamento: {processingTime.toFixed(2)} ms</p>
            <p>Taxa de Erro de Palavra: {WER.toFixed(2)}</p>
            <p>Taxa de Erro de Caractere: {CER.toFixed(2)}</p>

            
          </div>
        )}
        {loading && <CardLoadingSolar />}
            </div>
          </div>
       
      </div> 
     
    </div>
  );
}

export default SendFatura;
