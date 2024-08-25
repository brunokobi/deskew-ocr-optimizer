import { useCallback, useEffect, useState } from 'react';
import { createWorker } from 'tesseract.js';
import './App.css';
import { CardLoadingSolar } from '../../component/loading';
import { useNavigate } from 'react-router-dom';
import cv from "@techstark/opencv-js";
const PDFJS = window.pdfjsLib;
function Deskew() {  
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
  const[angleStart,setAngleStart] = useState(90);
  



  const convertImageToText = useCallback(async () => {
    if (!selectedImage) return;
    const textoOriginal = 'O MENINO LEITOR MARCOS É UM MENINO INTELIGENTE, GOSTA DE ESTUDAR E CONHECER COISAS NOVAS. TODO DIA ELE VAI NA BIBLIOTECA DE SUA CIDADE PARA RETIRAR LIVROS DIFERENTES, GOSTA DE AVENTURAS, AÇÃO, LIVROS COM ANIMAIS E LIVROS CONTANDO NOVIDADES DE OUTROS PAÍSES. SEU SONHO É VIAJAR E CONHECER PARIS'
    
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
        // verificar quantas palavras do texto original estão no texto extraído
        const originalWords = textoOriginal.split(/\s+/).filter(word => word.length > 0);
        const correctWords = words.filter(word => originalWords.includes(word));
        console.log(originalWords);
        const WER = (originalWords.length - correctWords.length) / originalWords.length;
        const CER = (textoOriginal.length - correctWords.join('').length) / textoOriginal.length;

        
        // Defina as métricas para uso posterior
        setConfidence(confidence);
        setWordCount(wordCount);
        setCharCount(charCount);
        setProcessingTime(processingTime/1000);
        setWER(WER);
        setCER(CER);

       
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
            
            // Binarização da imagem para encontrar contornos
            const binary = new cv.Mat();
            cv.threshold(gray, binary, 0, 255, cv.THRESH_BINARY_INV + cv.THRESH_OTSU);
            
            // Encontrar contornos
            const contours = new cv.MatVector();
            const hierarchy = new cv.Mat();
            cv.findContours(binary, contours, hierarchy, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE);
            
            if (contours.size() > 0) {
                const contour = contours.get(0);
                const rotatedRect = cv.minAreaRect(contour);
                let angle = rotatedRect.angle;
                setAngleStart(angle);
                
                // Ajustar o ângulo conforme necessário
                if (rotatedRect.size.width < rotatedRect.size.height) {
                    angle += 90;
                }
                
                // Se a inclinação inicial for maior para a direita, rotaciona no sentido anti-horário
                if (angle > 0) {
                    angle = angle - 180;
                }
                // Se a inclinação inicial for maior para a esquerda, rotaciona no sentido horário
                else if (angle < 0) {
                    angle = angle + 180;
                }

                // Verificar se o ângulo está próximo de 0 ou 180 (imagem já está corretamente alinhada)
                if (Math.abs(angle - 180) < 1 || Math.abs(angle) < 1) { // Tolerância de 1 grau
                    // Manter a imagem original
                    setSelectedImage(images);
                } else {
                    // Corrigir a inclinação da imagem
                    const center = new cv.Point(src.cols / 2, src.rows / 2);
                    const M = cv.getRotationMatrix2D(center, angle, 1);
                    const dst = new cv.Mat();
                    cv.warpAffine(src, dst, M, new cv.Size(src.cols, src.rows), cv.INTER_LINEAR, cv.BORDER_REPLICATE, new cv.Scalar());
                    
                    // Exibir a imagem corrigida
                    const deskewedCanvas = document.createElement('canvas');
                    cv.cvtColor(dst, dst, cv.COLOR_RGBA2GRAY); // Convert to grayscale
                    cv.imshow(deskewedCanvas, dst);
                    setSelectedImage(deskewedCanvas.toDataURL());

                    // Limpar a memória
                    dst.delete();
                    M.delete();
                }
                
                // Limpar a memória
                contour.delete();
            } else {
                console.error('Nenhum contorno encontrado na imagem.');
            }
            
            // Limpar a memória
            src.delete();
            gray.delete();
            binary.delete();
            contours.delete();
            hierarchy.delete();
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
        Teste de OCR Tesseract.js
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
            <p>Tempo de processamento: {processingTime.toFixed(2)}s</p>
            <p>WED: {WER.toFixed(2)}</p>
            <p>CER: {CER.toFixed(2)}</p>
            <p>Ângulo de inclinação inicial : {angleStart.toFixed(2)}°</p>
           

            
          </div>
        )}
        {loading && <CardLoadingSolar />}
            </div>
          </div>
       
      </div> 
     
    </div>
  );
}

export default Deskew;
