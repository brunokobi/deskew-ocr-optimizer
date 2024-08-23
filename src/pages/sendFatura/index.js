import { useCallback, useEffect, useState } from 'react';
import { createWorker } from 'tesseract.js';
import './App.css';
import { CardLoadingSolar } from '../../component/loading';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
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
        const wordCount = text.split(/\s+/).filter(word => word.length > 0).length; // Contagem de palavras
        
        setLoading(false);
        setTextResult(text);
        console.log(text);
        console.log(confidence);
        console.log(wordCount);
  
        // Defina as métricas para uso posterior
        // setMetrics({
        //   confidence: confidence,
        //   wordCount: wordCount,
        //   processingTime: processingTime,
        // });
      });
    // eslint-disable-next-line
  }, [selectedImage]);
  
  useEffect(() => {
    convertImageToText();
  }, [selectedImage, convertImageToText])

  const handleChangeImage = e => {   
    if(images) {
      setSelectedImage(images[0]);
      //setTextResult("teste")
    } else {
      setSelectedImage(null);
      setTextResult("")
    }
  }

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
      canvas.height = viewport.height*0.38;
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
        Enviar Fatura de Energia
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
       <button onClick={handleChangeImage}
       className="btn btn-primary mx-2"
       >Scanear</button>      
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
