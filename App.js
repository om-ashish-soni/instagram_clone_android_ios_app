import { StatusBar } from 'expo-status-bar';
import React,{useCallback,useEffect,useRef, useState} from 'react';
import { StyleSheet, Text, View ,Button, Image, TextInput, FlatList, ScrollView} from 'react-native';
import { LogBox } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { getStorage, ref ,uploadString,uploadBytes,getDownloadURL} from "firebase/storage";
import { collection, addDoc,query,where,getDocs } from "firebase/firestore"; 
import { StackActions } from '@react-navigation/native';
// import "@react-native-firebase/storage";
import db from "./firebase";
import {storage} from './firebase';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
// import Signin from './Signin';
export default function App() {
  const Stack = createNativeStackNavigator();
  const [userid,setUserid]=useState();
  const [dp,setDp]=useState();
  const [searchResult,setSearchResult]=useState([]);
  const [username,setUsername]=useState();
  const [password,setPassword]=useState();
  const [profileData,setProfileData]=useState();
  const [feed,setFeed]=useState([]);
  // const [isLogged,setIsLogged]=useState(false);
  // const [isNewUser,setIsNewUser]=useState(false);
  const handleLogin=async(navigation,Username,Password) => {
    // //alert("handle login called");
    setUsername(Username);
    setPassword(Password);
    console.log(Username,Password);
    console.log("going to Login");
    const collectionRef=collection(db,"users");
    const q = query(collectionRef, where("username", "==", Username));
    const querySnapshot = await getDocs(q);
    if(!querySnapshot){
      //alert("please enter valid username and password");
      navigation.dispatch(
        StackActions.replace('HomeLogin')
      )
    }
    querySnapshot.forEach((doc) => {
      // doc.data() is never undefined for query doc snapshots
      console.log(doc.id, " => ", doc.data());
      setDp(doc.data().dp);
      setUserid(doc.id);
      const objData={};
      objData.username=username;
      objData.id=doc.id;
      objData.dp=dp;
      setProfileData(objData);
      fetchFeed(navigation);
      
    });
  }
  const handleSignin=async (navigation,Username,Password,Dp) => {
    setUsername(Username);
    setPassword(Password);
    setDp(Dp);
    console.log(Username,Password,Dp);
    console.log("going to signin");
    const docRef = await addDoc(collection(db, "users"), {
      username:Username,
      password:Password,
      dp:Dp
    });
    console.log("Document written with ID: ", docRef.id);
    setUserid(docRef.id);
    const objData={};
    objData.username=username;
    objData.id=docRef.id;
    objData.dp=dp;
    setProfileData(objData);
    // fetchFeed(navigation);
    
    navigation.dispatch(
      StackActions.replace('Home')
    )
  }
  const handleSearch=async (navigation,searchKey)=>{
    //alert("going to search");
    const collectionRef=collection(db,"users");
    const querySnapshot = await getDocs(collectionRef);
    const sResult=[];
    console.log(querySnapshot.size);
    let index=0;
    querySnapshot.forEach((doc)=>{
      
      if(doc.data().username.includes(searchKey) || doc.data().username==searchKey){
        console.log(doc.data().username);
        sResult.push({
          "id":doc.id,
          "username":doc.data().username,
          "dp":doc.data().dp
        });
        
      }
      if(index>=querySnapshot.size-1){
        setSearchResult(sResult);
        console.log("now i will navigate",sResult.length);
        // navigation.dispatch(
        //   StackActions.replace('searchUserResults')
        // )
        navigation.navigate('searchUserResults')
      }
      index++;
    });
    
  }
  const fetchFeed=async(navigation)=>{
    console.log("fetchFeed called");
    const collectionRef=collection(db,`users/${userid}/followings`);
    const q = query(collectionRef);
    const querySnapshot = await getDocs(q);
    if(querySnapshot.size <= 0){
      navigation.dispatch(
        StackActions.replace('Home')
      )
    }
    let index=0;
    const collectedPosts=[];
    querySnapshot.forEach((doc)=>{
      console.log(doc.data().username)
      const collectFollowings=async()=>{
        const idCollectionRef=collection(db,'users');
        const idq=query(idCollectionRef,where("username", "==",doc.data().username));
        const idQuerySnapshot=await getDocs(idq);
        idQuerySnapshot.forEach((innerDoc)=>{
          console.log(innerDoc.data().username,innerDoc.id);
          const goIntoFollowings=async()=>{
            
            const postCollectionRef=collection(db,`users/${innerDoc.id}/posts`)
            const postq=query(postCollectionRef);
            const postQuerySnapshot=await getDocs(postq);
            postQuerySnapshot.forEach((postDoc)=>{
              collectedPosts.push(postDoc.data());
            })
          }
          goIntoFollowings();
          
        })
      }
      collectFollowings();
      setTimeout(()=>{
        if(index>=querySnapshot.size-1){
          setFeed(collectedPosts);
          console.log(collectedPosts);
          navigation.dispatch(
            StackActions.replace('Home')
          )
        }
      },2400)
      
      index++;
    })
  }
  const Home =({navigation})=>{
    const [search,setSearch]=useState();
    const comps=feed.map((post)=>{
      return(
        <View style={{width:'90%',backgroundColor:'#FFF',borderWidth:0.9,margin:4,padding:10,borderRadius:20}}>
          <View style={{flexDirection:'row',alignItems:'flex-start'}}>
            <Image style={{flexDirection:'row',width:'20%',height:60,marginLeft:'5%',marginRight:'15%',borderRadius:200}} source={{uri:post.dp}}/>
            <Text style={{flexDirection:'row',fontWeight:'bold',fontSize:24,marginLeft:'5%',marginTop:10}} >{post.username}</Text>
          </View>
          <View style={{margin:5,alignItems: 'center'}}><Text style={{fontSize:20}}>{post.caption}</Text></View>
          <Image style={{width:'90%',height:400,marginLeft:'5%',borderRadius:10}} source={{uri:post.media.uri}}/>
          
        </View>
      )
    })
    // useEffect(()=>{
    //   fetchFeed(navigation);
    // },[])
    return(
      <View>
        
        <Image style={{width:'100%',height:60}} source={{uri:"https://firebasestorage.googleapis.com/v0/b/instagram-clone-by-om-soni.appspot.com/o/logo.PNG?alt=media&token=79c9040c-cac3-46c7-8d7d-cc3e50928ece"}} resizeMode={'cover'}/>
        <ScrollView style={{height:'85%'}}>
          <View style={{height:'100%',padding:2,alignItems: 'center'}}>
            {comps}
          </View>
        </ScrollView>
        <View style={{flexDirection:'row'}}>
        <Button
        style={{flexDirection:'row'}}
          title="Home"
          onPress={() => {
            navigation.dispatch(
              StackActions.replace('Home')
            )
          }}
        />
        <Button
        style={{flexDirection:'row'}}
          title="Log out"
          onPress={() => {
            navigation.dispatch(
              StackActions.replace('HomeLogin')
            )
          }}
        />
        <Button
        style={{flexDirection:'row'}}
          title={`           +    `}
          onPress={() => {
            navigation.dispatch(
              StackActions.replace('uploadPost')
            )
          }}
        />
        <Button
        style={{flexDirection:'row'}}
          title="myProfile"
          onPress={() => {
            // navigation.dispatch(
            //   StackActions.replace('myProfile')
            // )
            navigation.navigate('myProfile')

          }}
        />
        <Button 
        style={{flexDirection:'row'}} 
        title="search" onPress={() =>{ 
          // navigation.dispatch(
          //   StackActions.replace('searchUser')
          // )
          navigation.navigate('searchUser')

        }} />
      </View>
      </View>
    )
  }
  const Signin=({navigation})=>{
    const [DP,SetDP]=useState();
    const [image,setImage]=useState("https://cdn.vox-cdn.com/thumbor/p01ezbiuDHgRFQ-htBCd7QxaYxo=/0x105:2012x1237/1600x900/cdn.vox-cdn.com/uploads/chorus_image/image/47070706/google2.0.0.jpg");
    const [Username,SetUsername]=useState();
    const [Password,SetPassword]=useState();
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
        //alert("Please choose file");
        return;
      }
      const d=new Date();
      const nowTime=d.getHours()+'_'+d.getMinutes()+'_'+d.getSeconds();
      const nowDate=d.getFullYear()+'_'+(d.getMonth()+1)+'_'+d.getDate()+'_'+nowTime;
      // //alert("going to upload");
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
          SetDP(url);
        })
      });
      
    }
    return(

      <View style={styles.container}>
        <Text>Shreepad Rajam Sharanam Prapadye</Text>
        <Image style={styles.logo} source={{uri:"https://firebasestorage.googleapis.com/v0/b/instagram-clone-by-om-soni.appspot.com/o/logo.PNG?alt=media&token=79c9040c-cac3-46c7-8d7d-cc3e50928ece"}} resizeMode={'cover'}/>
        <TextInput style={styles.input} placeholder="username" onChangeText={(text)=>SetUsername(text)} />
        <TextInput style={styles.input} placeholder="password" onChangeText={(text)=>SetPassword(text)} />
        <View style={styles.button}><Button title="Choose DP" onPress={pickDocument} /></View>
        <View style={styles.button}><Button title="upload" onPress={handleUpload} /></View>
        <View style={styles.button}><Button title="Sign in" onPress={()=>handleSignin(navigation,Username,Password,DP)} /></View>
        <Image style={styles.tinyLogo} source={{uri:image.uri}} resizeMode={'cover'}/>
        <View style={styles.button}><Button title="Already a user? Log in" onPress={()=>{
          navigation.dispatch(
            StackActions.replace('HomeLogin')
          );
        } }/></View>

        <StatusBar style="auto" />
      </View>
    )
  }
  const Login=({navigation})=>{
    const [Username,SetUsername]=useState();
    const [Password,SetPassword]=useState();
    return(

      <View style={styles.container}>
        <Text>Shreepad Rajam Sharanam Prapadye</Text>
        <Image style={styles.logo} source={{uri:"https://firebasestorage.googleapis.com/v0/b/instagram-clone-by-om-soni.appspot.com/o/logo.PNG?alt=media&token=79c9040c-cac3-46c7-8d7d-cc3e50928ece"}} resizeMode={'cover'}/>
        <TextInput style={styles.input} placeholder="username" onChangeText={(text)=>SetUsername(text)} />
        <TextInput style={styles.input} placeholder="password" onChangeText={(text)=>SetPassword(text)} />
        <View style={styles.button}><Button title="Log in" onPress={()=>handleLogin(navigation,Username,Password)} /></View>
        <View style={styles.button}><Button title="Not a user? Sign in" onPress={()=>{
          navigation.dispatch(
            StackActions.replace('HomeSignin')
          );
        } }/></View>
        <StatusBar style="auto" />
      </View>
    )
  }
  const uploadPost=({navigation})=>{
    const [caption,setCaption] = useState();
    const [media,setMedia]=useState("https://cdn.vox-cdn.com/thumbor/p01ezbiuDHgRFQ-htBCd7QxaYxo=/0x105:2012x1237/1600x900/cdn.vox-cdn.com/uploads/chorus_image/image/47070706/google2.0.0.jpg");
    const [uploadedMedia,setUploadedMedia] =useState("");
    const pickDocument = async () => {
      const result = await DocumentPicker.getDocumentAsync({});
      setMedia(result);
    }
    const handleUpload=async ()=>{
      //alert("handle upload post called");
      if(!media){
        //alert("Please choose file");
        return;
      }
      const d=new Date();
      const nowTime=d.getHours()+'_'+d.getMinutes()+'_'+d.getSeconds();
      const nowDate=d.getFullYear()+'_'+(d.getMonth()+1)+'_'+d.getDate()+'_'+nowTime;
      // //alert("going to upload");
      console.log("media : ",media.name,media.uri);
      const storageRef = ref(storage, `posts/${username}/${media.name}_${nowDate}`);
      const blob=await new Promise((resolve,reject)=>{
        const xhr=new XMLHttpRequest();
        xhr.onload=function(){
          resolve(xhr.response);
        }
        xhr.onerror=function(){
          reject(new TypeError('Netword request failed'));
        }
        xhr.responseType='blob';
        xhr.open('GET',media.uri,true);
        xhr.send(null);
      })
      console.log(blob);
      uploadBytes(storageRef, blob).then((snapshot) => {
        console.log('Uploaded an blob or file!');
        getDownloadURL(storageRef)
        .then((url)=>{
          console.log(url);
          setUploadedMedia(url);
        })
      });
      
    }
    const handleSubmitPost=async()=>{
      //alert("handle submit post called");
      const d=new Date();
      const nowTime=d.getHours()+'_'+d.getMinutes()+'_'+d.getSeconds();
      const nowDate=d.getFullYear()+'_'+(d.getMonth()+1)+'_'+d.getDate()+'_'+nowTime;
      const collectionRef=collection(db,`users/${userid}/posts`);
      const docRef=await addDoc(collectionRef,{
        "username":username,
        "dp":dp,
        "caption":caption,
        "media":media,
        "timestamp":nowDate
      });
      console.log("added document with id " + docRef.id);
      //alert("uploaded post successfully");
      navigation.dispatch(
        StackActions.replace('Home')
      );
    }
    return(
      <View>
        <Text style={{fontSize:24,fontWeight:'800',marginTop:10}}></Text>
          <View style={{alignItems: 'center',marginTop:10}}>
          <TextInput style={styles.input} placeholder="caption" onChangeText={(text)=>setCaption(text)} />
          <View style={styles.button}><Button title="Choose media" onPress={pickDocument} /></View>
          <View style={styles.button}><Button title="upload" onPress={handleUpload} /></View>
          <View style={styles.button}><Button title="submit" onPress={()=>handleSubmitPost()} /></View>
          <View style={styles.button}>
          <Button
            title="cancel"
            onPress={() => 
              navigation.dispatch(
                StackActions.replace('Home')
              )
            }
          />
          </View>
          <Image style={styles.tinyLogo} source={{uri:media.uri}} resizeMode={'cover'}/>
          
          <View style={{width:'70%',margin:5,marginTop:'50%'}}>
          </View>

        </View>
        <View style={{flexDirection:'row'}}>
        <Button
        style={{flexDirection:'row'}}
          title="Home"
          onPress={() => {
            navigation.dispatch(
              StackActions.replace('Home')
            )
          }}
        />
        <Button
        style={{flexDirection:'row'}}
          title="Log out"
          onPress={() => {
            navigation.dispatch(
              StackActions.replace('HomeLogin')
            )
          }}
        />
        <Button
        style={{flexDirection:'row'}}
          title={`           +    `}
          onPress={() => {
            navigation.dispatch(
              StackActions.replace('uploadPost')
            )
          }}
        />
        <Button
        style={{flexDirection:'row'}}
          title="myProfile"
          onPress={() => {
            // navigation.dispatch(
            //   StackActions.replace('myProfile')
            // )
            navigation.navigate('myProfile')

          }}
        />
        <Button 
        style={{flexDirection:'row'}} 
        title="search" onPress={() =>{ 
          // navigation.dispatch(
          //   StackActions.replace('searchUser')
          // )
          navigation.navigate('searchUser')

        }} />
      </View>
      </View>
    )
  }
  const myProfile=({navigation})=>{
    const fetchFollowers=async (doc)=>{
      console.log(doc);
      // profileData
      //alert("i am Going to fetch followers hihih..."+userid+username);
      console.log("Going to fetch followers...",userid,username);
      const followersCollectionRef=collection(db,`users/${userid}/followers`);
      const q=query(followersCollectionRef);
      const querySnapshot = await getDocs(q);
      const followers=[];
      let index=0;
      querySnapshot.forEach((doc)=>{
        followers.push({
          "id":doc.id,
          "username":doc.data().username,
          "dp":doc.data().dp
        });
        console.log(doc.id,doc.data());
        if(index>=querySnapshot.size - 1){
          profileData.followers=followers;
        }
        index++;
      })
      
      console.log("followers",profileData.followers);
      navigation.dispatch(
        StackActions.replace('followersList')
      );
    }
    const fetchFollowings=async (doc)=>{
      console.log(doc);
      // profileData
      
      //alert("i am Going to fetch followings hihih..."+userid+username);
      console.log("Going to fetch followings...",userid,username);
      const followingsCollectionRef=collection(db,`users/${userid}/followings`);
      const q=query(followingsCollectionRef);
      const querySnapshot = await getDocs(q);
      const followings=[];
      let index=0;
      querySnapshot.forEach((doc)=>{
        followings.push({
          "id":doc.id,
          "username":doc.data().username,
          "dp":doc.data().dp
        });
        console.log(doc.id,doc.data());
        if(index>=querySnapshot.size - 1){
          profileData.followings=followings;
        }
        index++;
      })
      
      console.log("followings",profileData.followings);
      navigation.dispatch(
        StackActions.replace('followingsList')
      );
    }
    const fetchPostsOfUser=async(doc)=>{
      //alert("going to fetch posts of user");
      console.log(doc);
      //alert("i am Going to fetch Posts hihih..."+doc.username);
      const idCollectionRef=collection(db,'users');
      const idq=query(idCollectionRef,where("username", "==",username));
      const idQuerySnapshot=await getDocs(idq);
      idQuerySnapshot.forEach(idDoc=>{
        const getPostsOfUser=async()=>{
          console.log("Going to fetch Posts...",idDoc.id,username);
          const followingsCollectionRef=collection(db,`users/${userid}/posts`);
          const q=query(followingsCollectionRef);
          const querySnapshot = await getDocs(q);
          const posts=[];
          let index=0;
          querySnapshot.forEach((doc)=>{
            posts.push({
              "id":doc.id,
              "media":doc.data().media,
              "caption":doc.data().caption,
              "username":doc.data().username,
              "dp":doc.data().dp
            });
            console.log(doc.id,doc.data(),doc.data().username,doc.data().dp);
            if(index>=querySnapshot.size - 1){
              profileData.posts=posts;
            }
            index++;
          })
          
          console.log("posts : ",profileData.posts);
          // navigation.dispatch(
          //   StackActions.replace('seeUserPosts')
          // );
          navigation.navigate('seeUserPosts')
        }
        getPostsOfUser();
      })
    }
    return(
      <View style={{alignItems: 'center'}}>
        <Text style={{fontSize:24,fontWeight:'800',marginTop:50}}>Profile name: {username}</Text>
        <Image style={{width:'70%',height:'50%',borderRadius:20}} source={{uri:dp}} />
        <View style={{width:'70%',margin:5}}><Button title="following" disabled={true}/></View>
        <View style={{width:'70%',margin:5}}><Button title="followers" onPress={()=>{
          profileData.username=username;  
          profileData.dp=dp;
          fetchFollowers(profileData)
        }} /></View>
        <View style={{width:'70%',margin:5}}><Button title="followings" onPress={()=>{
          profileData.username=username;  
          profileData.dp=dp;
          fetchFollowings(profileData)
        }}/></View>
        <View style={{width:'70%',margin:5}}><Button title="posts" onPress={()=>{
            profileData.username=username,
            profileData.dp=dp;
            profileData.id=userid;
            profileData.posts=[];
          fetchPostsOfUser(profileData)
        }} /></View>

      </View>
    )
  }
  const searchUser=({navigation})=>{
    const [searchKey,setSearchKey]=useState();
    
    
    return(
      <View>
      <View style={{alignItems: 'center',marginTop:50,marginBottom:'95%'}}>
        <TextInput style={styles.input} placeholder="search user" onChangeText={(text)=>setSearchKey(text)} />
        <View style={{marginTop:10,width:'70%'}}><Button title="Go" onPress={()=>handleSearch(navigation,searchKey)} /></View>
      </View>
      
        <View>
        <Button
          title="Home"
          onPress={() => {
            navigation.dispatch(
              StackActions.replace('Home')
            )
          }}
        />
        <Button
          title="Log out"
          onPress={() => {
            navigation.dispatch(
              StackActions.replace('HomeLogin')
            )
          }}
        />
        <Button
          title="new post"
          onPress={() => {
            navigation.dispatch(
              StackActions.replace('uploadPost')
            )
          }}
        />
        <Button
          title="myProfile"
          onPress={() => {
            // navigation.dispatch(
            //   StackActions.replace('myProfile')
            // )
            navigation.navigate('myProfile')
          }}
        />
        <Button title="search" onPress={() =>{ 
          // navigation.dispatch(
          //   StackActions.replace('searchUser')
          // )
          navigation.navigate('searchUser')
        }} />

      </View>
      </View>
    )
  }
  const searchUserResults=({navigation})=>{
    const switchToProfile=async(doc)=>{
      //alert(doc.username);
      console.log(userid,username,doc);
      const idCollectionRef=collection(db,'users');
      const idq=query(idCollectionRef,where("username", "==",doc.username));
      const idQuerySnapshot=await getDocs(idq);
      let docId="";
      idQuerySnapshot.forEach((innerDoc)=>{
        console.log(innerDoc.id,innerDoc.data().username);
        const collectionRef=collection(db,`users/${innerDoc.id}/followers`);
        const q = query(collectionRef,where("username", "==",username));

        const getQuerySnapshot=async()=>{
          const querySnapshot = await getDocs(q);
          if(username==doc.username || querySnapshot.size > 0){
            console.log("following profile is set for ",doc.username);
            profileData.username=doc.username;
            // profileData.id=fInnerDoc.id;
            profileData.dp=doc.dp;
            profileData.followers=[];
            profileData.followings=[];
            profileData.posts=[];
            navigation.dispatch(
              StackActions.replace('seeFollowingProfile')
            )
          }else{
            console.log("normal profile is set for ",doc.username);
            profileData.username=doc.username;
            // profileData.id=fInnerDoc.id;
            profileData.dp=doc.dp;
            profileData.followers=[];
            profileData.followings=[];
            profileData.posts=[];
            // navigation.dispatch(
            //   StackActions.replace('seeProfile')
            // )
            navigation.navigate('seeProfile')

          }
        }
        getQuerySnapshot();
        
      })                
      
      
    }
    const comps=searchResult.map((doc)=>{
      return(
        
        <View  style={{height:70,flexDirection:'row',width:'70%',margin:10,alignItems: 'center'}}>
          <Image style={{width:'25%',height:'100%',flexDirection:'row',marginLeft:'20%',borderRadius:50}} source={{uri:doc.dp}} resizeMode={'cover'}/>
          <View style={{flexDirection:'row',marginLeft:'10%'}} >
          <Button  title={`         ${doc.username}        `} onPress={()=>switchToProfile(doc)}/>
          </View>
        </View>
      )
    })
    return(
      <ScrollView>

      <View>
        <Text style={{marginTop:10}}></Text>
        {comps}
        <View>
        <Button
          title="Home"
          onPress={() => {
            navigation.dispatch(
              StackActions.replace('Home')
            )
          }}
        />
        <Button
          title="Log out"
          onPress={() => {
            navigation.dispatch(
              StackActions.replace('HomeLogin')
            )
          }}
        />
        <Button
          title="new post"
          onPress={() => {
            navigation.dispatch(
              StackActions.replace('uploadPost')
            )
          }}
        />
        <Button
          title="myProfile"
          onPress={() => {
            // navigation.dispatch(
            //   StackActions.replace('myProfile')
            // )
            navigation.navigate('myProfile')

          }}
        />
        <Button title="search" onPress={() =>{ 
          // navigation.dispatch(
          //   StackActions.replace('searchUser')
          // )
          navigation.navigate('searchUser')

        }} />

        </View>
      </View>
      </ScrollView>

    )
  }
  const seeProfile=({navigation})=>{
    console.log("reached to seeProfile");
    const followUser=async (doc)=>{
      const idCollectionRef=collection(db,'users');
      const idq=query(idCollectionRef,where("username", "==",doc.username));
      const idQuerySnapshot=await getDocs(idq);
        idQuerySnapshot.forEach((innerDoc)=>{
          const followersCollectionRef=collection(db,`users/${innerDoc.id}/followers`);
          const putIntoFollowers=async()=>{
            const followersDocRef = await addDoc(followersCollectionRef, {
            username:username,
            dp:dp
          });
          console.log("Follower: Document written with ID: ", followersDocRef.id);
          //alert("added to their followers");
        }
        putIntoFollowers();

        })
      const putIntoFollowings=async()=>{
        console.log(doc.username,username,userid);
        const followingsCollectionRef=collection(db,`users/${userid}/followings`);
        const followingsDocRef = await addDoc(followingsCollectionRef, {
          username:doc.username,
          dp:doc.dp
        });
        console.log("Following: Document written with ID: ", followingsDocRef.id);
        //alert("added to your followings");
        navigation.dispatch(
          StackActions.replace('seeFollowingProfile')
        );
      }
      putIntoFollowings();
    }
    return(
      <View style={styles.container} >
        <Text style={{fontSize:24,fontWeight:'900'}}>Profile name: {profileData.username}</Text>
        <Image style={{width:'70%',height:'50%',borderRadius:10,marginTop:10}} source={{uri:profileData.dp}} />
        <View style={{width:'70%',margin:5}}><Button title="follow" onPress={()=>followUser(profileData)}/></View>
        <View style={{width:'100%',marginTop:20}}>
        <Button
          title="Home"
          onPress={() => {
            navigation.dispatch(
              StackActions.replace('Home')
            )
          }}
        />
        <Button
          title="Log out"
          onPress={() => {
            navigation.dispatch(
              StackActions.replace('HomeLogin')
            )
          }}
        />
        <Button
          title="new post"
          onPress={() => {
            navigation.dispatch(
              StackActions.replace('uploadPost')
            )
          }}
        />
        <Button
          title="myProfile"
          onPress={() => {
            // navigation.dispatch(
            //   StackActions.replace('myProfile')
            // )
            navigation.navigate('myProfile')

          }}
        />
        <Button title="search" onPress={() =>{ 
          // navigation.dispatch(
          //   StackActions.replace('searchUser')
          // )
          navigation.navigate('searchUser')

        }} />

        </View>
      </View>
    )
  }
  const seeFollowingProfile=({navigation})=>{
    console.log("reached to seeFollowingProfile");
    const fetchFollowers=async (doc)=>{
      console.log(doc);
      //alert("i am Going to fetch followers hihih..."+doc.username);
      const idCollectionRef=collection(db,'users');
      const idq=query(idCollectionRef,where("username", "==",doc.username));
      const idQuerySnapshot=await getDocs(idq);
      idQuerySnapshot.forEach(idDoc=>{
        const getFollowers=async()=>{
          console.log("Going to fetch followers...",idDoc.id,doc.username);
          const followersCollectionRef=collection(db,`users/${idDoc.id}/followers`);
          const q=query(followersCollectionRef);
          const querySnapshot = await getDocs(q);
          const followers=[];
          let index=0;
          querySnapshot.forEach((doc)=>{
            followers.push({
              "id":doc.id,
              "username":doc.data().username,
              "dp":doc.data().dp
            });
            console.log(doc.id,doc.data());
            if(index>=querySnapshot.size - 1){
              profileData.followers=followers;
            }
            index++;
          })
          
          console.log("followers",profileData.followers);
          navigation.dispatch(
            StackActions.replace('followersList')
          );
        }
        getFollowers();
      })
      
    }
    const fetchFollowings=async(doc)=>{
      console.log(doc);
      //alert("i am Going to fetch followings hihih..."+doc.username);
      const idCollectionRef=collection(db,'users');
      const idq=query(idCollectionRef,where("username", "==",doc.username));
      const idQuerySnapshot=await getDocs(idq);
      idQuerySnapshot.forEach(idDoc=>{
        const getFollowings=async()=>{
          console.log("Going to fetch followings...",idDoc.id,doc.username);
          const followingsCollectionRef=collection(db,`users/${idDoc.id}/followings`);
          const q=query(followingsCollectionRef);
          const querySnapshot = await getDocs(q);
          const followings=[];
          let index=0;
          querySnapshot.forEach((doc)=>{
            followings.push({
              "id":doc.id,
              "username":doc.data().username,
              "dp":doc.data().dp
            });
            console.log(doc.id,doc.data());
            if(index>=querySnapshot.size - 1){
              profileData.followings=followings;
            }
            index++;
          })
          
          console.log("followings",profileData.followings);
          navigation.dispatch(
            StackActions.replace('followingsList')
          );
        }
        getFollowings();
      })
      
    }
    const fetchPostsOfUser=async(doc)=>{
      //alert("going to fetch posts of user");
      console.log(doc);
      //alert("i am Going to fetch followings hihih..."+doc.username);
      const idCollectionRef=collection(db,'users');
      const idq=query(idCollectionRef,where("username", "==",doc.username));
      const idQuerySnapshot=await getDocs(idq);
      idQuerySnapshot.forEach(idDoc=>{
        const getPostsOfUser=async()=>{
          console.log("Going to fetch followings...",idDoc.id,doc.username);
          const followingsCollectionRef=collection(db,`users/${idDoc.id}/posts`);
          const q=query(followingsCollectionRef);
          const querySnapshot = await getDocs(q);
          const posts=[];
          let index=0;
          querySnapshot.forEach((doc)=>{
            posts.push({
              "id":doc.id,
              "media":doc.data().media,
              "caption":doc.data().caption,
              "username":doc.data().username,
              "dp":doc.data().dp
            });
            console.log(doc.id,doc.data(),doc.data().username,doc.data().dp);
            if(index>=querySnapshot.size - 1){
              profileData.posts=posts;
            }
            index++;
          })
          
          console.log("posts : ",profileData.posts);
          // navigation.dispatch(
          //   StackActions.replace('seeUserPosts')
          // );
          navigation.navigate('seeUserPosts')
        }
        getPostsOfUser();
      })
    }
    return(
      <View style={styles.container} >
        <Text style={{fontSize:24,fontWeight:'800',marginTop:50}}>Profile name: {profileData.username}</Text>
        <Image style={{width:'70%',height:'50%',borderRadius:10}} source={{uri:profileData.dp}} />
        <View style={{width:'70%',margin:5}}><Button title="following" disabled={true}/></View>
        <View style={{width:'70%',margin:5}}><Button title="followers" onPress={()=>fetchFollowers(profileData)} /></View>
        <View style={{width:'70%',margin:5}}><Button title="followings" onPress={()=>fetchFollowings(profileData)} /></View>
        <View style={{width:'70%',margin:5}}><Button title="posts" onPress={()=>fetchPostsOfUser(profileData)} /></View>

        
      </View>
    )
  }
  const followersList=({navigation})=>{
    console.log("reached to followersList");
    const switchToProfile=async(doc)=>{
      //alert(doc.username);
      console.log(userid,username,doc);
      const idCollectionRef=collection(db,'users');
      const idq=query(idCollectionRef,where("username", "==",doc.username));
      const idQuerySnapshot=await getDocs(idq);
      let docId="";
      idQuerySnapshot.forEach((innerDoc)=>{
        console.log(innerDoc.id,innerDoc.data().username);
        const collectionRef=collection(db,`users/${innerDoc.id}/followers`);
        const q = query(collectionRef,where("username", "==",username));

        const getQuerySnapshot=async()=>{
          const querySnapshot = await getDocs(q);
          if(username==doc.username || querySnapshot.size > 0){
            console.log("following profile is set for ",doc.username);
            profileData.username=doc.username;
            // profileData.id=fInnerDoc.id;
            profileData.dp=doc.dp;
            profileData.followers=[];
            profileData.followings=[];
            profileData.posts=[];
            navigation.dispatch(
              StackActions.replace('seeFollowingProfile')
            )
          }else{
            console.log("normal profile is set for ",doc.username);
            profileData.username=doc.username;
            // profileData.id=fInnerDoc.id;
            profileData.dp=doc.dp;
            profileData.followers=[];
            profileData.followings=[];
            profileData.posts=[];
            // navigation.dispatch(
            //   StackActions.replace('seeProfile')
            // )
            navigation.navigate('seeProfile')

          }
        }
        getQuerySnapshot();
        
      })                
      
      
    }
    let comps="No followers ";
    let followers=[];
    followers=profileData.followers;
    comps=followers.map((doc)=>{
      return(
        
        <View  style={{height:70,flexDirection:'row',width:'70%',margin:10,alignItems: 'center'}}>
          <Image style={{width:'25%',height:'100%',flexDirection:'row',marginLeft:'30%',borderRadius:50}} source={{uri:doc.dp}} resizeMode={'cover'}/>
          <View style={{flexDirection:'row',marginLeft:'10%'}} >
          <Button  title={`         ${doc.username}        `} onPress={()=>switchToProfile(doc)}/>
          </View>
        </View>
      )
    })
    
    return(
      <View>
      <View style={{alignItems: 'center'}}>
      <Text style={{fontSize:24,fontWeight:'800',marginTop:50}}>Followers of {profileData.username}</Text>
      </View>
      <ScrollView style={{height:'60%'}}>
      {comps}
      </ScrollView>
      <View>
      <Button
          title="Home"
          onPress={() => {
            navigation.dispatch(
              StackActions.replace('Home')
            )
          }}
        />
        <Button
          title="Log out"
          onPress={() => {
            navigation.dispatch(
              StackActions.replace('HomeLogin')
            )
          }}
        />
        <Button
          title="new post"
          onPress={() => {
            navigation.dispatch(
              StackActions.replace('uploadPost')
            )
          }}
        />
        <Button
          title="myProfile"
          onPress={() => {
            // navigation.dispatch(
            //   StackActions.replace('myProfile')
            // )
            navigation.navigate('myProfile')

          }}
        />
        <Button title="search" onPress={() =>{ 
          // navigation.dispatch(
          //   StackActions.replace('searchUser')
          // )
          navigation.navigate('searchUser')

        }} />

      </View>
      </View>
    )
  }
  const followingsList=({navigation})=>{
    console.log("reached to followingsList");
    const switchToProfile=async(doc)=>{
      //alert(doc.username);
      console.log(userid,username,doc);
      const idCollectionRef=collection(db,'users');
      const idq=query(idCollectionRef,where("username", "==",doc.username));
      const idQuerySnapshot=await getDocs(idq);
      let docId="";
      idQuerySnapshot.forEach((innerDoc)=>{
        console.log(innerDoc.id,innerDoc.data().username);
        const collectionRef=collection(db,`users/${innerDoc.id}/followers`);
        const q = query(collectionRef, where("username", "==",username));
        const getQuerySnapshot=async()=>{
          const querySnapshot = await getDocs(q);
          console.log(username,doc.username,querySnapshot.size);
          if(username===doc.username ||  querySnapshot.size > 0){
            console.log("following profile is set for ",doc.username);
            profileData.username=doc.username;
            // profileData.id=doc.id;
            profileData.dp=doc.dp;
            profileData.followers=[];
            profileData.followings=[];
            profileData.posts=[];
            navigation.dispatch(
              StackActions.replace('seeFollowingProfile')
            )
          }else{
            console.log("normal profile is set for ",doc.username);
            profileData.username=doc.username;
            // profileData.id=doc.id;
            profileData.dp=doc.dp;
            profileData.followers=[];
            profileData.followings=[];
            profileData.posts=[];
            // navigation.dispatch(
            //   StackActions.replace('seeProfile')
            // )
            navigation.navigate('seeProfile')
          }
        }
        getQuerySnapshot();
        
      })                
      
      
    }
    let comps="No followings ";
    let followings=[];
    followings=profileData.followings;
    comps=followings.map((doc)=>{
      return(
        
        <View  style={{height:70,flexDirection:'row',width:'70%',margin:10,alignItems: 'center'}}>
          <Image style={{width:'25%',height:'100%',flexDirection:'row',marginLeft:'30%',borderRadius:50}} source={{uri:doc.dp}} resizeMode={'cover'}/>
          <View style={{flexDirection:'row',marginLeft:'10%'}} >
          <Button  title={`         ${doc.username}        `} onPress={()=>switchToProfile(doc)}/>
          </View>
        </View>
      )
    })
    
    return(
      <View>
      <View style={{alignItems: 'center'}}>
      <Text style={{fontSize:20}}>Followings of {profileData.username}</Text>
      </View>
      <ScrollView style={{height:'70%'}}>
      {comps}
      </ScrollView>
      <View>
      <Button
          title="Home"
          onPress={() => {
            navigation.dispatch(
              StackActions.replace('Home')
            )
          }}
        />
        <Button
          title="Log out"
          onPress={() => {
            navigation.dispatch(
              StackActions.replace('HomeLogin')
            )
          }}
        />
        <Button
          title="new post"
          onPress={() => {
            navigation.dispatch(
              StackActions.replace('uploadPost')
            )
          }}
        />
        <Button
          title="myProfile"
          onPress={() => {
            // navigation.dispatch(
            //   StackActions.replace('myProfile')
            // )
            navigation.navigate('myProfile')

          }}
        />
        <Button title="search" onPress={() =>{ 
          // navigation.dispatch(
          //   StackActions.replace('searchUser')
          // )
          navigation.navigate('searchUser')

        }} />

      </View>
      </View>
    )
  }
  const seeUserPosts=({navigation})=>{
    const comps=profileData.posts.map((post)=>{
      return(
        <View style={{width:'90%',backgroundColor:'#FFF',borderWidth:0.9,margin:4,padding:10,borderRadius:20}}>
          <View style={{flexDirection:'row',alignItems:'flex-start'}}>
            <Image style={{flexDirection:'row',width:'20%',height:60,marginLeft:'5%',marginRight:'15%',borderRadius:200}} source={{uri:post.dp}}/>
            <Text style={{flexDirection:'row',fontWeight:'bold',fontSize:24,marginLeft:'5%',marginTop:10}} >{post.username}</Text>
          </View>
          <View style={{margin:5,alignItems: 'center'}}><Text style={{fontSize:20}}>{post.caption}</Text></View>
          <Image style={{width:'90%',height:400,marginLeft:'5%',borderRadius:10}} source={{uri:post.media.uri}}/>
          
        </View>
      )
    })
    return(
      <>
        
        <ScrollView style={{height:'100%'}}>
          <View style={{height:'100%',padding:2,alignItems: 'center'}}>
            {comps}
          </View>
        </ScrollView>
      </>
      
    )
  }
  return (
    <NavigationContainer>
        {LogBox.ignoreLogs(['Setting a timer'])}
      
        <Stack.Navigator>
          <Stack.Screen
            name="HomeSignin"
            component={Signin}
            options={{ title: 'Welcome to instagram' }}
          />
          <Stack.Screen
            name="HomeLogin"
            component={Login}
            options={{ title: 'Welcome to instagram' }}
          />
          <Stack.Screen
            name="Home"
            component={Home}
            options={{ title: 'instagram' }}
          />
          <Stack.Screen
            name="uploadPost"
            component={uploadPost}
            options={{ title: 'upload post' }}
          />
          <Stack.Screen
            name="myProfile"
            component={myProfile}
            options={{ title: `${username}'s Profile` }}
          />
          <Stack.Screen
            name="searchUser"
            component={searchUser}
            options={{ title: `search user` }}
          />
          <Stack.Screen
            name="searchUserResults"
            component={searchUserResults}
            options={{ title: `search Result` }}
          />
          <Stack.Screen
            name="seeProfile"
            component={seeProfile}
            options={{ title: ` profile ` }}
          />
          <Stack.Screen
            name="seeFollowingProfile"
            component={seeFollowingProfile}
            options={{ title: ` profile ` }}
          />
          <Stack.Screen
            name="followersList"
            component={followersList}
            options={{ title: ` followers ` }}
          />
          <Stack.Screen
            name="followingsList"
            component={followingsList}
            options={{ title: ` followings ` }}
          />
          <Stack.Screen
            name="seeUserPosts"
            component={seeUserPosts}
            options={{ title: ` Posts :  ` }}
          />
          
          {/* <Stack.Screen
            name="Signin"
            component={
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
            }
            options={{ title: 'Welcome' }}
          />
           */}
        </Stack.Navigator>
        
    </NavigationContainer>
    
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
  },
  logo1:{
    height:'12%',
    width:'50%'
  }
});
