import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, TouchableOpacity, StyleSheet, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { BarCodeScanner } from 'expo-barcode-scanner';
import { useNavigation } from '@react-navigation/native';

const URL_API = 'https://appstock-2b338-default-rtdb.firebaseio.com/';

const AddProductScreen = () => {
  const [name, setName] = useState('');
  const [purchaseDate, setPurchaseDate] = useState('');
  const [price, setPrice] = useState('');
  const [imei, setImei] = useState('');
  const [supplier, setSupplier] = useState('');
  const [hasPermission, setHasPermission] = useState(null);
  const [showScanner, setShowScanner] = useState(false);
  const [manualImeiInputVisible, setManualImeiInputVisible] = useState(false);
  const navigation = useNavigation();

  useEffect(() => {
    (async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const handleBarcodeScanned = ({ data }) => {
    setImei(data);
  };

  const handleAddProduct = async () => {
    try {
      const response = await fetch(`${URL_API}products.json`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          purchaseDate,
          price,
          imei,
          supplier,
          sold: false,
        }),
      });

      if (response.ok) {
        navigation.goBack();
      } else {
        console.error('Error al agregar el producto');
      }
    } catch (error) {
      console.error('Error al agregar el producto:', error);
    }
  };

  const handleOpenScanner = () => {
    setShowScanner(true);
    setManualImeiInputVisible(true);
  };

  const handleCloseScanner = () => {
    setShowScanner(false);
    setManualImeiInputVisible(false);
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        <TextInput
          placeholder="Nombre del Producto"
          value={name}
          onChangeText={setName}
          style={styles.input}
        />
        <TextInput
          placeholder="Proveedor"
          value={supplier}
          onChangeText={setSupplier}
          style={styles.input}
        />
        <TextInput
          placeholder="Fecha de Compra"
          value={purchaseDate}
          onChangeText={setPurchaseDate}
          style={styles.input}
        />
        <TextInput
          placeholder="Precio"
          value={price}
          onChangeText={setPrice}
          keyboardType="numeric"
          style={styles.input}
        />
        <TouchableOpacity
          style={styles.scanButton}
          onPress={handleOpenScanner}
        >
          <Text style={styles.scanButtonText}>Abrir Escáner</Text>
        </TouchableOpacity>
        {manualImeiInputVisible && (
          <TextInput
            placeholder="Código IMEI"
            value={imei}
            onChangeText={setImei}
            keyboardType="numeric"
            style={styles.input}
          />
        )}
        <Text style={styles.imeiText}>IMEI: {imei}</Text>
        <Button title="Agregar Producto" onPress={handleAddProduct} />

        {showScanner && (
          <View style={styles.scannerContainer}>
            <BarCodeScanner
              onBarCodeScanned={handleBarcodeScanned}
              style={StyleSheet.absoluteFillObject}
            />
            <TouchableOpacity
              style={styles.acceptButton}
              onPress={handleCloseScanner}
            >
              <Text style={styles.acceptButtonText}>Aceptar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.manualInputButton}
              onPress={() => {
                setShowScanner(false);
                setManualImeiInputVisible(true);
              }}
            >
              <Text style={styles.manualInputButtonText}>Ingresar Manualmente</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  input: {
    width: '100%',
    height: 40,
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 8,
  },
  scanButton: {
    backgroundColor: '#4caf50',
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
  scanButtonText: {
    color: 'white',
    textAlign: 'center',
  },
  imeiText: {
    fontSize: 16,
    marginBottom: 10,
  },
  scannerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  acceptButton: {
    backgroundColor: '#4caf50',
    padding: 10,
    borderRadius: 5,
    alignSelf: 'center',
    position: 'absolute',
    bottom: 20,
  },
  manualInputButton: {
    backgroundColor: '#2196F3',
    padding: 10,
    borderRadius: 5,
    alignSelf: 'center',
    position: 'absolute',
    bottom: 70,
  },
  manualInputButtonText: {
    color: 'white',
    textAlign: 'center',
  },
});

export default AddProductScreen;
