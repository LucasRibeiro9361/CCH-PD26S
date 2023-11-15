import { useNavigation } from '@react-navigation/core'
import React from 'react'
import { StyleSheet, Text, TouchableOpacity, View ,Button, Image, TextComponent} from 'react-native'
import { auth } from '../firebase'



const ResultScreen = ({route}) => {
  const classe = route.params?.classe || 'No data received';
  const precisao = route.params?.precisao || 'No data received';
  const texto = route.params?.texto || 'No data received';
  const uriReceived = route.params?.uri || 'No data received';
  const navigation = useNavigation()
  
  const handleSignOut = () => {
    auth
      .signOut()
      .then(() => {
        navigation.replace("Login")
      })
      .catch(error => alert(error.message))
  }

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

      <Image source={{ uri: uriReceived }} style={styles.image} />
      <View style={styles.containerClasse}>
        <Text style={{fontSize: 18}}>{classe} Precisão: {precisao} </Text>
      </View>
      <View style={styles.containerContent}>
        <Text> {texto} </Text>
      </View>
    </View>
  )
}

export default ResultScreen

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center'
  },
  containerClasse: {
    alignItems: 'center',
    backgroundColor: 'white',
    borderColor: 'black',
    margin: 10,
    padding: 10,
    borderWidth:1,
    borderRadius: 10,
  },
  containerContent: {
    alignItems: 'center',
    backgroundColor: 'white',
    borderColor: 'black',
    padding: 10,
    margin: 10,
    borderWidth:1,
    borderRadius: 10,
    height: 330
  },
   button: {
    backgroundColor: '#0782F9',
    width: '20%',
    padding: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  image: {
    width: 200,
    height: 200,
    marginTop: 20,
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