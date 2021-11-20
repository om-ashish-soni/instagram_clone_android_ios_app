import { StatusBar } from 'expo-status-bar';
import React,{useCallback,useRef, useState} from 'react';
import { StyleSheet, Text, View ,Button, Image, TextInput} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { getStorage, ref ,uploadString,uploadBytes,getDownloadURL} from "firebase/storage";
import { collection, addDoc } from "firebase/firestore"; 
// import "@react-native-firebase/storage";
import db from "./firebase";
import {storage} from './firebase';
export default function App() {
  const [image,setImage]=useState("https://cdn.vox-cdn.com/thumbor/p01ezbiuDHgRFQ-htBCd7QxaYxo=/0x105:2012x1237/1600x900/cdn.vox-cdn.com/uploads/chorus_image/image/47070706/google2.0.0.jpg");
  const [dp,setDp]=useState();
  const [username,setUsername]=useState();
  const [password,setPassword]=useState();
  const [isLogged,setIsLogged]=useState(false);
  const [isNewUser,setIsNewUser]=useState(false);
  const pickDocument = async () => {
    const result = await DocumentPicker.getDocumentAsync({});
    setImage(result);
  }
  const handleChangeUsername=(text)=>{
    console.log(text);
    setUsername(text);
  }
  const handleChangePassword=(text)=>{
    console.log(text);
    setPassword(text);
  }
  const handleUpload=async ()=>{
    if(!image){
      alert("Please choose file");
      return;
    }
    const d=new Date();
		const nowTime=d.getHours()+'_'+d.getMinutes()+'_'+d.getSeconds();
		const nowDate=d.getFullYear()+'_'+(d.getMonth()+1)+'_'+d.getDate()+'_'+nowTime;
    alert("going to upload");
    console.log("image : ",image.name,image.uri);
    const storageRef = ref(storage, `images/${image.name}_${nowDate}`);
    const blob=await new Promise((resolve,reject)=>{
      const xhr=new XMLHttpRequest();
      xhr.onload=function(){
        resolve(xhr.response);
      }
      xhr.onerror=function(){
        reject(new TypeError('Netword request failed'));
      }
      xhr.responseType='blob';
      xhr.open('GET',image.uri,true);
      xhr.send(null);
    })
    console.log(blob);
    uploadBytes(storageRef, blob).then((snapshot) => {
      console.log('Uploaded an blob or file!');
      getDownloadURL(storageRef)
      .then((url)=>{
        console.log(url);
        setDp(url);
      })
    });
    
  }
  const handleSignin=async ()=>{
    console.log("going to signin");
    const docRef = await addDoc(collection(db, "users"), {
      username:username,
      password:password,
      dp:dp
    });
    console.log("Document written with ID: ", docRef.id);
  }
  return (
    <View style={styles.container}>
      <Text>Shreepad Shree Vallabh no jay jay kar ho</Text>
      <Image style={styles.logo} source={{uri:"https://firebasestorage.googleapis.com/v0/b/instagram-clone-by-om-soni.appspot.com/o/logo.PNG?alt=media&token=79c9040c-cac3-46c7-8d7d-cc3e50928ece"}} resizeMode={'cover'}/>
      <TextInput style={styles.input} placeholder="username" onChangeText={handleChangeUsername} />
      <TextInput style={styles.input} placeholder="password" onChangeText={handleChangePassword} />
      <View style={styles.button}><Button title="Choose DP" onPress={pickDocument} /></View>
      <View style={styles.button}><Button title="upload" onPress={handleUpload} /></View>
      <View style={styles.button}><Button title="Sign in" onPress={handleSignin} /></View>
      <Image style={styles.tinyLogo} source={{uri:image.uri}} resizeMode={'cover'}/>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tinyLogo:{
    maxHeight:'40%',
    maxWidth:'70%',
    width:'70%',
    margin:1,
    height:'30%'
  },
  input: {
    minWidth:'70%',
    maxWidth:'70%',
    borderBottomWidth:1,
    margin:1,
    padding:2,
    fontSize:20
  },
  button:{
    maxWidth:'70%',
    minWidth:'70%',
    padding:1,
    margin:1,
    fontSize:20
  },
  logo:{
    height:'10%',
    width:'70%'
  }
});
