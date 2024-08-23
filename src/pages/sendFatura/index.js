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
    if(!selectedImage) return;
    setLoading(true);
    await worker.load();
    await worker.loadLanguage("por");
    await worker.initialize("por");
    await worker.recognize(selectedImage)
    .then((result) => {
      setLoading(false);
      setTextResult(result.data.text);     
     }
    )
    //eslint-disable-next-line
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


 
const handleChangeText = () => {
 const texto = textResult.toString();


 let  numeroCliente = texto.match(/Nº DA INSTALAÇÃO[\s\S]*?\b(\d{10})\b/);
 if (numeroCliente !== null) {
  numeroCliente = numeroCliente[1];
 } 

 let mesReferencia = texto.match(/\b[A-Za-z]{3}120\d{2}\b/g);

 if (mesReferencia === null) {
   mesReferencia = texto.match(/\b[A-Za-z]{3}\/20\d{2}\b/g)[0]
 } else {
   mesReferencia = mesReferencia[0].replace("120", "/20");
 }

 let dataVencimento = texto.match(/(\d{2})l(\d{2})l(\d{4})/);
  if (dataVencimento === null) {
    dataVencimento = texto.match(/(\d{2})\/(\d{2})\/(\d{4})/);
    dataVencimento = dataVencimento[0];
  } else {
    dataVencimento = dataVencimento[0].replace("l", "/").replace("l", "/");
  }
 
  let valorTotal = texto.match(/TOTAL (\d+,\d{2})/);
  if (valorTotal !== null) {    
    valorTotal = valorTotal[1];
  } 

  let energiaEletrica = texto.match(/Energia Elétrica (\S+)\s+(\S+)\s+(\S+)\s+(\S+)/)
  if (energiaEletrica === null) {
    energiaEletrica = ['','','','']
  }

   let energiaInjetada = texto.match(/Energia injetada HFP. (\S+)\s+(\S+)\s+(\S+)\s+(\S+)/)
  if (energiaInjetada === null) {
    energiaInjetada = texto.match(/Energia compensada GD \| (\S+)\s+(\S+)\s+(\S+)\s+(\S+)/)
  }else if (energiaInjetada === null) {
    energiaInjetada = ['','','','']
  }
  console.log('texto', texto)
  console.log(energiaInjetada)
  // const energiaCompensada = texto.match(/Energia SCEE s\/ ICMS (\S+)\s+(\S+)\s+(\S+)\s+(\S+)/) 
  let energiaCompensada = texto.match(/s\/ ICMS (\S+)\s+(\S+)\s+(\S+)\s+(\S+)/)
  if (energiaCompensada === null) {   
    energiaCompensada = ['','','','']
  } 
  console.log(energiaCompensada)
 
  let contribIlumPublicaMunicipal = texto.match(/Contrib Ilum Publica Municipal (\d+,\d{2})/);
  if (contribIlumPublicaMunicipal !== null) {
    contribIlumPublicaMunicipal = contribIlumPublicaMunicipal[1];
  } 

  const fatura = {
    numero_cliente: numeroCliente,
    mes_referencia: mesReferencia,
    data_vencimento: dataVencimento,
    energia_eletrica_quantidade: energiaEletrica[2] || '',
    energia_eletrica_preco_unitario: energiaEletrica[3] || '' ,
    energia_eletrica_valor: energiaEletrica[4] || '',
    energia_injetada_quantidade: energiaInjetada[2] || '',
    energia_injetada_preco_unitario: energiaInjetada[3] || '',
    energia_injetada_valor: energiaInjetada[4] || '',
    energia_sICMS_quantidade: energiaCompensada[2]  || '',
    energia_sICMS_preco_unitario: energiaCompensada[3] || '',
    energia_sICMS_valor: energiaCompensada[4] || '',
    contrib_ilum_publica_municipal: contribIlumPublicaMunicipal,
    valor_total: valorTotal
  }

// URL do endpoint onde você quer enviar o objeto
const url = 'http://localhost:3333/fatura';

//Enviando o objeto usando o método POST do Axios
axios.post(url, fatura)
  .then(response => {
    console.log('Resposta do servidor:', response.data);
    alert("Dados enviados com sucesso!"); 
    navigate('/')

  })
  .catch(error => {
    //alert erro 409
    alert("Erro ao enviar os dados \n Verifique se a fatura já foi enviada!");
    

    console.error('Ocorreu um erro:', error);
  });

}

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
       <button onClick={handleChangeText}
       className="btn btn-primary mx-2"
       >Dados enviar</button>
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
