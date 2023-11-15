import { useNavigation } from '@react-navigation/core'
import React, { useEffect, useState } from 'react'
import { StyleSheet, Text, TouchableOpacity, View ,Button, FlatList} from 'react-native'
import { auth, storage, database } from '../firebase'
import axios from 'axios';
import * as ImagePicker from  'expo-image-picker'
import 'firebase/auth';
import { ref as ref_db, set, push, limitToLast, once, get, onValue } from 'firebase/database';
import { ref as ref_s, uploadBytes, getDownloadURL, SeValue  } from'firebase/storage';
import Ionicons from '@expo/vector-icons/Ionicons';
import Loading from './Loading';

const HomeScreen = () => {

const [isLoading, setIsLoading] = useState(false);

const options = {
  mediaType: 'photo',
  quality: 1,
  width: 256,
  height: 256,
  includeBase64: true,
};

useEffect(() => {
  (async () => { 

    let statusPM  = await ImagePicker.requestMediaLibraryPermissionsAsync();
    let statusPP  = await ImagePicker.requestCameraPermissionsAsync();

    if (statusPM.granted !== true) {
      alert('Desculpe, precisamos de permissões de acesso à galeria para fazer isso funcionar!');
    }
    if ( statusPP.granted !== true ) {
      alert('Desculpe, precisamos de permissões de acesso à camera para fazer isso funcionar!');
    }

  })();
}, []);

const openLibrary = async () => {
  const  result =  await ImagePicker.launchCameraAsync();  
  if(  !result.canceled ){
    setIsLoading(true);
    const fetchReponse =  await fetch(result.assets[0].uri);
    const theBlob = await fetchReponse.blob();

    var bodyFormData = new FormData();

    bodyFormData.append('file', {
      uri: result.assets[0].uri,
      name: 'image.jpg', 
      type: 'image/jpg',
    });

    const url = 'https://us-central1-pd26s-cch.cloudfunctions.net/predict';

      try {
        const response = await axios.post(url, bodyFormData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });

        carregarDadosDesc(response.data.class);
        console.log("dados DESC" + dadosDesc);

        enviarImagem(auth.currentUser.uid, result.assets[0].uri, response.data) 
        setIsLoading(false);
        navigation.navigate('Result', { classe: dadosDesc.nome, precisao:response.data.confidence, uri:  result.assets[0].uri, texto: dadosDesc.desc })
      } catch (error) {
        console.error('Error uploading image:', error);
        setIsLoading(false);
        alert("Erro ao enviar a imagem");
      }
  }

};

const openGalery= async () => {
  const  result =  await ImagePicker.launchImageLibraryAsync();  
  if(  !result.canceled ){
    setIsLoading(true);
    const fetchReponse =  await fetch(result.assets[0].uri);
    const theBlob = await fetchReponse.blob();

    var bodyFormData = new FormData();

    bodyFormData.append('file', {
      uri: result.assets[0].uri,
      name: 'image.jpg', 
      type: 'image/jpg',
    });

    const url = 'https://us-central1-pd26s-cch.cloudfunctions.net/predict';

      try {
        const response = await axios.post(url, bodyFormData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });

        enviarImagem(auth.currentUser.uid, result.assets[0].uri, response.data) 
        carregarDadosDesc(response.data.class);
        setIsLoading(false);
        navigation.navigate('Result', { classe: dadosDesc.nome, precisao:response.data.confidence, uri:  result.assets[0].uri, texto: dadosDesc.desc })
      } catch (error) {
        setIsLoading(false);
        console.error('Error uploading image:', error);
        alert("Erro ao enviar a imagem");
        
      }
  }

};

  const navigation = useNavigation()
  
  const handleSignOut = () => {
    auth
      .signOut()
      .then(() => {
        navigation.replace("Login")
      })
      .catch(error => alert(error.message))
  }
  // ROTINA DE ENVIAR IMAGEM
  const enviarImagem = async (usuarioId, imagemURI, data) => {
    try {
      const classe = data.class;
      const precisao = data.confidence;
      const storageRef = ref_s( storage ,`imagens/${usuarioId}/${Date.now()}.jpg`);
  
      const response = await fetch(imagemURI);
      const blob = await response.blob();
      await uploadBytes(storageRef, blob).then((snapshot) => {
        console.log('Upload ok');
      });
  
      const imageUrl = await getDownloadURL(storageRef);
  
      const databaseRef = ref_db(database,`historico/${usuarioId}`);
      
      const novoRegistro = {
        imageUrl,
        classe,
        precisao,
        timestamp : new Date().getTime(),
      };
  
      await push(databaseRef, novoRegistro);
  
    } catch (error) {
      console.error('Erro ao enviar imagem:', error);
    }
  };
  // FIM ROTINA ENVIAR IMAGEM 

  // ROTINA DE BUSCAR DESCRICAO
  const [dadosDesc, setDadosDesc] = useState([]);

  const carregarDadosDesc = async ( doenca ) => {
    try {
      console.log("aq");
      console.log(doenca);
      const refDesc = await ref_db( database, `doencas/${doenca}`);

      onValue(refDesc, (snapshot) => {
        setDadosDesc(snapshot.val());
      });

    } catch (error) {
      console.error('Erro ao carregar dados da doença:', error);
    }
  };

  const carregarRedirecionar = ( item ) => {
    setIsLoading(true);
    carregarDadosDesc(item.classe);
    setIsLoading(false);
    navigation.navigate('Result', { classe: dadosDesc.nome, precisao: item.precisao, uri: item.imageUrl, texto: dadosDesc.desc })
  };
  // FIM ROTINA DE BUSCAR DESCRICAO

  // ROTINA DE HISTORICO
  const [dados, setDados] = useState([]);
  const idUsuario = auth.currentUser.uid;
  
  useEffect(() => {
    const carregarDados = async () => {
      try {
        const refHistorico = await ref_db( database, `historico/${idUsuario}`);
        
        onValue(refHistorico, (snapshot) => {
          if(snapshot && snapshot.val()){
            const dadosArray = Object.keys(snapshot.val()).map((key) => ({ key, ...snapshot.val()[key] }));
            const arraySliced = dadosArray; //.slice(-5);
            setDados(arraySliced.reverse());
          }
        });
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
      }
    };

    carregarDados();
  }, []);

  const renderItem = ({ item }) => (
    <TouchableOpacity onPress={() => carregarRedirecionar(item) }>
      <View style={{ padding: 16, borderBottomWidth: 1, borderTopWidth: 1,borderColor: 'black', flexDirection: 'row', }}>
        <Text>Classe: {item.classe} </Text>
        <Text>Precisão: {item.precisao}</Text>
      </View>
    </TouchableOpacity>
  );

  // FIM ROTINA DE HISTORICO
  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <Text style={{ padding: 10 }}>{auth.currentUser?.email}</Text>
        <TouchableOpacity
          onPress={handleSignOut}
          style={styles.button}
        >
          <Text style={styles.buttonText}>Sign out</Text>
        </TouchableOpacity>
      </View>
      {dados.length > 0 &&
      <View style={styles.containerHistorico}>
        <Text style={{fontSize: 22}}>Historico</Text>
        <FlatList
          data={dados}
          renderItem={renderItem}
          keyExtractor={(item) => item.key}
        />
      </View>
      }
      <View style={styles.row}>
        <TouchableOpacity
          onPress={ () => openLibrary() }
          style={styles.buttonSelect}
          
        >
        <Ionicons name="camera" size={32} color="white" />  
        </TouchableOpacity> 
        <TouchableOpacity
          onPress={ () => openGalery() }
          style={styles.buttonSelect}
        >
        <Ionicons name="folder-open-outline" size={32} color="white" />
        </TouchableOpacity>
      </View>
      <Loading isLoading={isLoading} /> 
    </View>
  )
}

export default HomeScreen

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  containerHistorico: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    borderWidth: 1,
    borderColor: 'black',
    backgroundColor: 'white',
    borderRadius: 20,
  },
   button: {
    backgroundColor: '#0782F9',
    width: '20%',
    padding: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonSelect: {
    backgroundColor: '#0782F9',
    width: '30%',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    margin: 16
  },
  buttonText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 12,
  },  
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
})