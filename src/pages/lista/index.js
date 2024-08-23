import * as React from 'react';
import { styled } from '@mui/material/styles';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemText from '@mui/material/ListItemText';
import Avatar from '@mui/material/Avatar';
import IconButton from '@mui/material/IconButton';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import DeleteIcon from '@mui/icons-material/Delete';
import TextSnippetIcon from '@mui/icons-material/TextSnippet';
import VisibilityIcon from '@mui/icons-material/Visibility';

import axios from 'axios';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';


const Demo = styled('div')(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
}));


function Lista() { 
  const [faturas, setFaturas] = React.useState([]);
  const [openModal, setOpenModal] = React.useState(false);
const [selectedFatura, setSelectedFatura] = React.useState(null);

  React.useEffect(() => {
    getFaturas();
  }, []);

  const getFaturas = () => {
        // URL do endpoint onde você quer enviar o objeto
      const url = 'http://localhost:3333/fatura';

      //Enviando o objeto usando o método POST do Axios
     axios.get(url)
        .then(response => {
          console.log('Resposta do servidor:', response.data);         
          setFaturas(response.data);
        }
        )
}

  



const deleteFatura = (id) => {
  const url = 'http://localhost:3333/fatura/' + id;
  axios.delete(url)
    .then(response => {
      console.log('Resposta do servidor:', response.data);
      alert("Fatura excluída com sucesso!");
      getFaturas();
    })
    .catch(error => {
      console.error('Ocorreu um erro:', error);
    });
}

const handleOpenModal = (fatura) => {
  setSelectedFatura(fatura);
  setOpenModal(true);
};

const handleCloseModal = () => {
  setOpenModal(false);
};





return (
  <div className="bg-light" style={{width: '100%',height:'1000px'}}>
  <h1 className='text-center text-primary'>Lista das Faturas</h1>
   
      <Grid item xs={12} md={6} mx={10}>
          <Typography sx={{ mt: 4, mx: 2 }} variant="h6" component="div">
           Faturas total {faturas.length}
          </Typography>
          <Demo>
            <List dense={false} style={{ borderRadius: '20px' }}>
              {faturas.map((fatura) =>
                <ListItem key={fatura.id}
                  secondaryAction={
                    <React.Fragment>
                  {/* Botão de Exibição */}
                  <IconButton edge="end" aria-label="view" title='Visualizar'
                      onClick={() => handleOpenModal(fatura)}
                    >
                      <VisibilityIcon                      
                      sx={{ color: 'blue' }}/>
                    </IconButton>


                    {/* Botão de Exclusão */}
                    <IconButton edge="end" aria-label="delete" title='Excluir'
                      onClick={() => deleteFatura(fatura.id)}
                    >
                      <DeleteIcon sx={{ color: 'red' }} />
                    </IconButton> 
                    
                  </React.Fragment>                 
                  }
                >
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: 'blue' }}>
                      <TextSnippetIcon 
                      onClick={() => handleOpenModal(fatura)}
                      title='Visualizar'
                      />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={fatura.numero_cliente}
                    secondary={fatura.mes_referencia + ' - ' + fatura.valor_total}
                  />
                </ListItem>,
              )}
            </List>
          </Demo>
        </Grid>
         {/* Dialog/Modal */}
    <Dialog open={openModal} onClose={handleCloseModal}>
      {selectedFatura && (
        <>
        <DialogTitle style={{ textAlign: 'center', color: '#007BFF', fontWeight: 'bold' }}>
  Detalhes da Fatura
</DialogTitle>
<DialogContent>
  <DialogContentText style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>
    <span style={{ color: '#007BFF' }}>Nº Cliente:</span> {selectedFatura.numero_cliente}
  </DialogContentText>
  <DialogContentText style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>
    <span style={{ color: '#007BFF' }}>Mês de Referência:</span> {selectedFatura.mes_referencia}
  </DialogContentText>
  <DialogContentText style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>
    <span style={{ color: '#007BFF' }}>Data de Vencimento:</span> {selectedFatura.data_vencimento}
  </DialogContentText>

  <DialogContentText style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>
    <span style={{ color: '#007BFF' }}>energia eletrica - consumo :</span> {selectedFatura.energia_eletrica_quantidade}    
  </DialogContentText>
  <DialogContentText style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>
    <span style={{ color: '#007BFF' }}>energia eletrica - valor :</span> {selectedFatura.energia_eletrica_preco_unitario}
  </DialogContentText>
  <DialogContentText style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>
    <span style={{ color: '#007BFF' }}>energia eletrica - valor :</span> {selectedFatura.energia_eletrica_valor}
  </DialogContentText>

  <DialogContentText style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>
    <span style={{ color: '#007BFF' }}>energia injetada - consumo :</span> {selectedFatura.energia_injetada_quantidade}
  </DialogContentText>
  <DialogContentText style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>
    <span style={{ color: '#007BFF' }}>energia injetada - valor :</span> {selectedFatura.energia_injetada_preco_unitario}
  </DialogContentText>
  <DialogContentText style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>
    <span style={{ color: '#007BFF' }}>energia injetada - valor :</span> {selectedFatura.energia_injetada_valor}
  </DialogContentText>


  <DialogContentText style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>
    <span style={{ color: '#007BFF' }}>energia sICMS - consumo :</span> {selectedFatura.energia_sICMS_quantidade}
  </DialogContentText>
  <DialogContentText style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>
    <span style={{ color: '#007BFF' }}>energia sICMS - valor :</span> {selectedFatura.energia_sICMS_preco_unitario}
  </DialogContentText>
  <DialogContentText style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>
    <span style={{ color: '#007BFF' }}>energia sICMS - valor :</span> {selectedFatura.energia_sICMS_valor}
  </DialogContentText>


  <DialogContentText style={{fontSize: '1.2rem', textAlign: 'center', color: '#007BFF', fontWeight: 'bold' }}>
    <span style={{ color: '#007BFF' }}>Valor Total:</span> {selectedFatura.valor_total}
  </DialogContentText>
  {/* Adicione outras informações da fatura aqui */}
</DialogContent>
<DialogActions style={{ justifyContent: 'center' }}>
  <Button variant="contained" color="primary" onClick={handleCloseModal}>
    Fechar
  </Button>
</DialogActions>

        </>
      )}
    </Dialog>
  </div>
);
}

export default Lista;


