import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Button, TouchableOpacity, StyleSheet, Modal, TextInput, TouchableWithoutFeedback } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const URL_API = 'https://appstock-2b338-default-rtdb.firebaseio.com/';

const calculateRemainingWarrantyDays = (purchaseDate) => {
  const today = new Date();
  const [day, month, year] = purchaseDate.split('/').map(Number);
  const purchase = new Date(year + 2000, month - 1, day); // Adjust year to be 4 digits and month to be 0-based
  const timeDifference = today - purchase;
  const daysDifference = Math.floor(timeDifference / (1000 * 60 * 60 * 24));
  const remainingWarrantyDays = Math.max(30 - daysDifference, 0); // Maximum warranty is 30 days
  return remainingWarrantyDays;
};

const LoggedInScreen = () => {
  const [products, setProducts] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [saleDate, setSaleDate] = useState('');
  const [salePrice, setSalePrice] = useState('');
  const [saleClient, setClient] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const navigation = useNavigation();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch(`${URL_API}products.json`);
      const data = await response.json();
      if (data) {
        const productsArray = Object.keys(data).map(key => ({
          id: key,
          ...data[key],
        }));
        setProducts(productsArray);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    }
    setRefreshing(false);
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchProducts();
  };

  const handleOpenModal = (productId) => {
    setSelectedProductId(productId);
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    setSaleDate('');
    setSalePrice('');
    setClient('');
  };

  const handleMarkSoldWithDate = async () => {
    try {
      const response = await fetch(`${URL_API}products/${selectedProductId}.json`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sold: true, saleDate, salePrice, saleClient }),
      });
      if (response.ok) {
        const updatedProducts = products.map(product =>
          product.id === selectedProductId ? { ...product, sold: true } : product
        );
        setProducts(updatedProducts);
        handleCloseModal();
      }
    } catch (error) {
      console.error('Error marking product as sold:', error);
    }
  };

  const filteredProducts = products.filter(product => product.imei.endsWith(searchTerm));

  const sortedProducts = filteredProducts.sort((a, b) => {
    const remainingDaysA = calculateRemainingWarrantyDays(a.purchaseDate);
    const remainingDaysB = calculateRemainingWarrantyDays(b.purchaseDate);
    return remainingDaysA - remainingDaysB;
  });

  const renderItem = ({ item }) => (
    <View style={styles.productContainer}>
      <View style={styles.productInfo}>
        <Text style={styles.productName}>{item.name}</Text>
        <Text>IMEI: {item.imei}</Text>
        <Text>Precio de Compra: {item.price}</Text>
        <Text>Proveedor: {item.supplier}</Text>
        <Text>Fecha de Compra: {item.purchaseDate}</Text>
        <Text>Días de Garantía Restantes: {calculateRemainingWarrantyDays(item.purchaseDate)}</Text>
      </View>
      <View style={styles.buttonContainer}>
        {!item.sold && (
          <Button
            title="Vendido"
            onPress={() => handleOpenModal(item.id)}
          />
        )}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar por últimos 4 dígitos de IMEI"
          value={searchTerm}
          onChangeText={text => setSearchTerm(text)}
        />
      </View>
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate('Agregar Nuevo')}
        >
          <Text style={styles.addButtonText}>Agregar Producto</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.viewSoldButton}
          onPress={() => navigation.navigate('Vendidos')}
        >
          <Text style={styles.viewSoldButtonText}>Ver Productos Vendidos</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.title}>Productos</Text>
      <View style={styles.productCountContainer}>
        <Text style={styles.productCountText}>
          Cantidad de productos disponibles: {sortedProducts.filter(product => !product.sold).length}
        </Text>
      </View>
      <FlatList
        data={sortedProducts.filter(product => !product.sold)}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        refreshing={refreshing}
        onRefresh={handleRefresh}
      />
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={handleCloseModal}
      >
        <TouchableWithoutFeedback onPress={handleCloseModal}>
          <View style={styles.modalContainer}>
            <TouchableWithoutFeedback>
              <View style={styles.modalContent}>
                <TextInput
                  style={styles.input}
                  placeholder="Fecha de Venta"
                  value={saleDate}
                  onChangeText={text => setSaleDate(text)}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Precio de Venta"
                  value={salePrice}
                  onChangeText={text => setSalePrice(text)}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Comprador"
                  value={saleClient}
                  onChangeText={text => setClient(text)}
                />
                <Button
                  title="Marcar como Vendido"
                  onPress={handleMarkSoldWithDate}
                />
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  searchContainer: {
    marginBottom: 10,
  },
  searchInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 5,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  title: {
    fontSize: 20,
    marginBottom: 20,
  },
  productContainer: {
    marginBottom: 15,
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    flexDirection: 'row',
    alignItems: 'center',
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  addButton: {
    backgroundColor: '#4caf50',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 5,
  },
  addButtonText: {
    color: 'white',
    fontSize: 16,
  },
  viewSoldButton: {
    backgroundColor: '#007bff',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 5,
  },
  viewSoldButtonText: {
    color: 'white',
    fontSize: 16,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    elevation: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
  },
  productCountContainer: {
    alignItems: 'center',
    marginBottom: 10,
  },
  productCountText: {
    fontSize: 16,
  },
});

export default LoggedInScreen;
