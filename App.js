import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from './screens/HomeScreen';
import LoggedInScreen from './screens/LoggedInScreen';
import AddProductScreen from './screens/AddProductScreen';
import SoldScreen from './screens/SoldScreen';
import SoldCalculateScreen from './screens/SoldCalculateScreen';

const Stack = createStackNavigator();

const App = () => {
  const [loggedIn, setLoggedIn] = useState(true); // Agrega el estado de autenticación

  return (
    <NavigationContainer>
      <Stack.Navigator>
        {/* Pantalla de Inicio */}
        <Stack.Screen name="Home">
          {props => <HomeScreen {...props} setLoggedIn={setLoggedIn} loggedIn={loggedIn} />}
        </Stack.Screen>
        
        {/* Pantalla para usuarios autenticados */}
        {loggedIn && (
          <Stack.Screen name="Disponibles" component={LoggedInScreen} />
          )}
          <Stack.Screen name="Agregar Nuevo" component={AddProductScreen} />
          <Stack.Screen name="Vendidos" component={SoldScreen} />
          <Stack.Screen name="Calculadora de Ventas" component={SoldCalculateScreen} />
        {/* Agrega más pantallas aquí si es necesario */}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
