import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Button, Alert } from 'react-native';

const URL_API = 'https://appstock-2b338-default-rtdb.firebaseio.com/';

const SoldCalculateScreen = () => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [totalSold, setTotalSold] = useState(0);
  const [totalProfit, setTotalProfit] = useState(0);

  const handleCalculate = async () => {
    try {
      console.log('Calculating...');

      if (!startDate || !endDate) {
        Alert.alert('Error', 'Please enter valid start and end dates.');
        return;
      }
      
      const response = await fetch(`${URL_API}products.json`);
      const data = await response.json();
      let soldCount = 0;
      let profitTotal = 0;

      if (data) {
        const productsArray = Object.keys(data).map(key => ({
          id: key,
          ...data[key],
        }));

        const filteredSales = productsArray.filter(product => {
          const saleDateFormatted = product.saleDate; // Assuming saleDate is in dd/mm/aa format
          if (!saleDateFormatted) {
            return false;
          }
          const [day, month, year] = saleDateFormatted.split('/').map(Number);
          const saleDate = new Date(year + 2000, month - 1, day); // Adjust year and month

          const [startDay, startMonth, startYear] = startDate.split('/').map(Number);
          const startDateObject = new Date(startYear + 2000, startMonth - 1, startDay);
          
          const [endDay, endMonth, endYear] = endDate.split('/').map(Number);
          const endDateObject = new Date(endYear + 2000, endMonth - 1, endDay);

          return product.sold && saleDate >= startDateObject && saleDate <= endDateObject;
        });

        soldCount = filteredSales.length;

        filteredSales.forEach(sale => {
          profitTotal += parseFloat(sale.salePrice) - parseFloat(sale.price);
        });

        console.log('Filtered Sales:', filteredSales);
        
        setTotalSold(soldCount);
        setTotalProfit(profitTotal);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Calcular Ventas y Ganancias</Text>
      <View style={styles.dateContainer}>
        <Text>Fecha de Inicio (dd/mm/aa):</Text>
        <TextInput
          style={styles.dateInput}
          value={startDate}
          onChangeText={text => setStartDate(text)}
          placeholder="dd/mm/aa"
        />
      </View>
      <View style={styles.dateContainer}>
        <Text>Fecha de Fin (dd/mm/aa):</Text>
        <TextInput
          style={styles.dateInput}
          value={endDate}
          onChangeText={text => setEndDate(text)}
          placeholder="dd/mm/aa"
        />
      </View>
      <Button title="Calcular" onPress={handleCalculate} />
      <Text>Cantidad de Productos Vendidos: {totalSold}</Text>
      <Text>Total Ganancias: {totalProfit}</Text>
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
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  dateInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 8,
    borderRadius: 5,
  },
});

export default SoldCalculateScreen;
