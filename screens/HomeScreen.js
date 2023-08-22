
import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';

const HomeScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loggedIn, setLoggedIn] = useState(false);
  
  
  const URL_AUTH_SIGNUP = 'https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=AIzaSyDfbCpoY1zb9kbbgezSc0mQuwapH-pGQNg';

  const handleLogin = async () => {
    try {
      const response = await fetch(URL_AUTH_SIGNUP, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
          returnSecureToken: true,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Autenticación exitosa
        setLoggedIn(true);
        navigation.navigate('Disponibles'); // Navegar a LoggedInScreen después de autenticar
      } else {
        // Autenticación fallida
        console.error('Error de autenticación:', data.error.message);
      }
    } catch (error) {
      console.error('Error de autenticación:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Home Screen</Text>
      {loggedIn ? (
        <Text>Bienvenido, {email}!</Text>
      ) : (
        <>
          <TextInput
            placeholder="Correo Electrónico"
            value={email}
            onChangeText={setEmail}
            style={styles.input}
          />
          <TextInput
            placeholder="Contraseña"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            style={styles.input}
          />
          <Button title="Iniciar Sesión" onPress={handleLogin} />
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    marginBottom: 20,
  },
  input: {
    width: 200,
    height: 40,
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 8,
  },
});

export default HomeScreen;
