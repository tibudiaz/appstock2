import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, TextInput } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { FontAwesome } from '@expo/vector-icons';

const URL_API = 'https://appstock-2b338-default-rtdb.firebaseio.com/';

const SoldScreen = () => {
  const [soldProducts, setSoldProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const navigation = useNavigation();
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchSoldProducts();
  }, []);

  const fetchSoldProducts = async () => {
    try {
      const response = await fetch(`${URL_API}products.json`);
      const data = await response.json();
      if (data) {
        const soldProductsArray = Object.keys(data)
          .map(key => ({
            id: key,
            ...data[key],
          }))
          .filter(product => product.sold === true);
        setSoldProducts(soldProductsArray);
      }
    } catch (error) {
      console.error('Error fetching sold products:', error);
    }
    setRefreshing(false);
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchSoldProducts();
  };
  const handleSearch = () => {
    if (searchQuery.length >= 4 || filterDate) {
      const filteredProducts = soldProducts.filter(product => {
        const matchesIMEI = product.imei.includes(searchQuery);
        const matchesDate = filterDate ? product.saleDate.includes(filterDate) : true;
        return matchesIMEI && matchesDate;
      });
      setSoldProducts(filteredProducts);
    } else {
      fetchSoldProducts();
    }
  };

  const navigateToSoldCalculateScreen = () => {
    navigation.navigate('Calculadora de Ventas', { soldProducts });
  };

  const getDaysRemaining = (saleDate) => {
    const today = new Date();
    const [day, month, year] = saleDate.split('/').map(Number);
    const purchase = new Date(year + 2000, month - 1, day); // Adjust year to be 4 digits and month to be 0-based
    const timeDifference = today - purchase;
    const daysDifference = Math.floor(timeDifference / (1000 * 60 * 60 * 24));
    const daysRemaining = Math.max(30 - daysDifference, 0); 
    return daysRemaining;
  };

  const renderItem = ({ item }) => {
    const daysRemaining = getDaysRemaining(item.saleDate);

    return (
      <View style={styles.productContainer}>
        <Text style={styles.productName}>{item.name}</Text>
        <Text>IMEI: {item.imei}</Text>
        <Text>Comprador: {item.saleClient}</Text>
        <Text>Fecha de Venta: {item.saleDate}</Text>
        <Text>Precio de Venta: {item.salePrice}</Text>
        <Text>Días restantes de garantía: {daysRemaining <= 30 ? daysRemaining : '30+'}</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Productos Vendidos</Text>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar por IMEI"
          value={searchQuery}
          onChangeText={text => setSearchQuery(text)}
        />
        <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
          <FontAwesome name="search" size={20} color="white" />
        </TouchableOpacity>
      </View>
      <View style={styles.dateFilterContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Filtrar por Fecha (DD/MM/AA)"
          value={filterDate}
          onChangeText={text => setFilterDate(text)}
        />
        <TouchableOpacity
          style={styles.searchButton}
          onPress={() => {
            setFilterDate('');
            setSearchQuery('');
            fetchSoldProducts();
          }}
        >
          <FontAwesome name="times" size={20} color="white" />
        </TouchableOpacity>
      </View>
      <FlatList
        data={soldProducts}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        refreshing={refreshing}
        onRefresh={handleRefresh}
      />
      <TouchableOpacity style={styles.calculateButton} onPress={navigateToSoldCalculateScreen}>
        <Text style={styles.calculateButtonText}>Calcular Ganancias</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
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
  },
  productName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  dateFilterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  searchInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 5,
  },
  searchButton: {
    backgroundColor: '#007bff',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 5,
  },
  calculateButton: {
    backgroundColor: '#28a745',
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 10,
  },
  calculateButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default SoldScreen;
