import { useState, useEffect } from "react";
import { FlatList, Text, View, StyleSheet, Image, TouchableOpacity, TextInput, KeyboardAvoidingView, Keyboard } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from '@expo/vector-icons';
import { Checkbox } from 'expo-checkbox';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Index() {
  // Controls the search bar input
  // Used in: <TextInput> inside the search bar
  const [searchQuery, setSearchQuery] = useState('');

  // Stores the list of todos currently displayed on the screen
  // Used in: <FlatList> to render the todo items
  // Also updated when you add, delete, mark done/undone, or search
  const [todos, setToDo] = useState([]);

  // Stores the original full list of todos before any search filtering
  // Used in: the search feature to restore the full list when searchQuery is empty
  const [oldTodos, setOldTodos] = useState([]);

  // Controls the input field where new todos are typed
  // Used in: <TextInput> at the bottom of the screen where user adds a new task
  const [todoText, setToDoText] = useState('');

  useEffect(() => {
    const getTodos = async () => {
      try {
        const todos = await AsyncStorage.getItem('my-todo');
        if (todos !== null) {
          const parsedTodos = JSON.parse(todos);
          setToDo(parsedTodos);
          setOldTodos(parsedTodos);
        }
      } catch (error) {
        console.log("Error loading todos");
      }
    };
    getTodos();
  }, []);

  // To add any Todo when we click on add icon
  const addToDo = async () => {
    try {
      const newToDo = {
        id: Math.random(),
        title: todoText,
        isDone: false,
      };
      const updatedTodos = [...todos, newToDo];
      setToDo(updatedTodos);
      setOldTodos(updatedTodos);
      await AsyncStorage.setItem("my-todo", JSON.stringify(updatedTodos));
      setToDoText('');
      Keyboard.dismiss();
    } catch (error) {
      console.log(error);
    }
  };

  // To delete any Todo when we click on the trash icon
  const deleteToDo = async (id) => {
    try {
      const updatedTodos = todos.filter(todo => todo.id !== id); //For each todo item, check if its id is not equal to the id we want to delete.
      setToDo(updatedTodos);
      setOldTodos(updatedTodos);
      await AsyncStorage.setItem("my-todo", JSON.stringify(updatedTodos)); //AsyncStorage only stores text, so we convert the array to a string using JSON.stringify().
    } catch (error) {
      console.log(error);
    }
  };

  // This function toggles the “done” status of a specific todo item when you check or uncheck the checkbox.
  const handleDone = async (id) => {
    try {
      //.map() -> returns a new array, where you modify some items based on a condition.
      const updatedTodos = todos.map(todo =>
        todo.id === id ? { ...todo, isDone: !todo.isDone } : todo
      );     
      setToDo(updatedTodos);
      setOldTodos(updatedTodos);
      await AsyncStorage.setItem("my-todo", JSON.stringify(updatedTodos));
      // Saves the updated todo list in AsyncStorage, so that your changes are persistent (won’t be lost after refresh
    } catch (error) {
      console.log('Error updating todo status');
    }
  };

  const onSearch = (query) => {
    if (query === '') {
      setToDo(oldTodos);
    } else {
      const filteredTodos = oldTodos.filter(todo =>
        todo.title.toLowerCase().includes(query.toLowerCase())
      );
      setToDo(filteredTodos);
    }
  };

  useEffect(() => {
    onSearch(searchQuery);
  }, [searchQuery]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => alert('clicked icon')}>
          <Ionicons name="menu" size={24} color={'#333'} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => alert('pfp clicked')}>
          <Image
            source={{ uri: 'https://cdn.prod.website-files.com/62bdc93e9cccfb43e155104c/66c9beca445b37b90d7a4696_Luffy%20pfp%20400x400%20(6).png' }}
            style={{ width: 40, height: 40, borderRadius: 20 }}
          />
        </TouchableOpacity>
      </View>

      <View style={styles.searchBar}>
        <Ionicons name="search" size={24} color={'#333'} />
        <TextInput
          placeholder="Search"
          style={styles.searchInput}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={20} color={'#999'} />
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={[...todos].reverse()}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <ToDoItem todo={item} deleteToDo={deleteToDo} handleDone={handleDone} />
        )}
      />

      <KeyboardAvoidingView style={styles.footer} behavior="padding" keyboardVerticalOffset={10}>
        <TextInput
          style={styles.newToDoInput}
          onChangeText={setToDoText}
          value={todoText}
          autoCorrect={false}
          placeholder="Add new Task"
        />
        <TouchableOpacity style={styles.addButton} onPress={addToDo}>
          <Ionicons name="add" size={34} color={'#fff'} />
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ToDoItem component in JS
const ToDoItem = ({ todo, deleteToDo, handleDone }) => {
  return (
    <View style={styles.toDoContainer}>
      <View style={styles.toDoInfoContainer}>
        <Checkbox
          value={todo.isDone}
          onValueChange={() => handleDone(todo.id)}
          color={todo.isDone ? 'blue' : undefined}
        />
        <Text style={[
          styles.toDoText,
          todo.isDone && { textDecorationLine: 'line-through' }
        ]}>
          {todo.title}
        </Text>
      </View>
      <TouchableOpacity onPress={() => deleteToDo(todo.id)}>
        <Ionicons name="trash" color={'red'} size={20} />
      </TouchableOpacity>
    </View>
  );
};

// Styles stay the same
const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20
  },
  searchBar: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    padding: 12,
    borderRadius: 14,
    gap: 10,
    alignItems: 'center',
    marginBottom: 30
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333'
  },
  toDoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 20,
    borderRadius: 12,
  },
  toDoInfoContainer: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
  },
  toDoText: {
    fontSize: 16,
    color: '#333'
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  newToDoInput: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 10,
    fontSize: 16,
    color: '#333',
    height: 50
  },
  addButton: {
    backgroundColor: 'blue',
    padding: 8,
    borderRadius: 10,
    marginLeft: 15
  }
});