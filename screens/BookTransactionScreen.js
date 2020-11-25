import React from 'react';
import { Text, View, Image, KeyboardAvoidingView, Alert } from 'react-native';
import { TouchableOpacity, TextInput } from 'react-native-gesture-handler';
import * as Permissions from 'expo-permissions';
import {BarCodeScanner} from 'expo-barcode-scanner';
import db from '../config.js'
import firebase from 'firebase'
//import console = require('console');
export default class TransactionScreen extends React.Component {
  constructor(){
    super()
     this.state={
       hasCameraPermission: null,
       scaned:false,
       scanedBookId:'',
       scanedStudentId:'',
       buttonState:'normal',
       TransactionMessage:''
     }
    
  }
  getCameraPermission=async(Id)=>{
    const {status}=await Permissions.askAsync(Permissions.CAMERA);
    this.setState({
      hasCameraPermission:status==='granted',
      buttonState:'clicked',
      scaned:false,
buttonState:Id
    })
  }
  handleTransaction=async()=>{
     var TransactionMessage
     db.collection("books").doc(this.state.scannedBookId).get()
     .then ((doc)=>{
       var book=doc.data()
       console.log(book)
         if (book.bookAvailability){
           this.initiatebookIssue()
           TransactionMessage='bookIssued'
           Alert.alert(TransactionMessage)
         }
         else{
           this.initiatebookReturn()
           TransactionMessage='bookReturned'
           Alert.alert(TransactionMessage)
         }
     })
     this.setState({TransactionMessage:TransactionMessage})
  }

initiatebookIssue=async()=>{
  db.collection('transactions').add({
    'studentId':this.state.scanedStudentId,
    'bookId': this.state.scannedBookId,
    'date': firebase.firestore.TimeStamp.now().toDate(),
    'transactionType': 'issue'
  })
  db.collection('books').doc(this.state.scanedBookId).update({
    'bookAvailibility':false
  })
  db.collection('students').doc(this.state.scanedStudentId).update({
    'numberOfBookIssued':firebase.firestore.FieldValue.increment(1)
  })
}
initiatebookReturn =async()=>{
  db.collection('transactions').add({
    'studentId':this.state.scanedStudentId,
    'bookId': this.state.scannedBookId,
    'date': firebase.firestore.TimeStamp.now().toDate(),
    'transactionType': 'issue'
  })
  db.collection('books').doc(this.state.scanedBookId).update({
    'bookAvailibility':true
  })
  db.collection('students').doc(this.state.scanedStudentId).update({
    'numberOfBookIssued':firebase.firestore.FieldValue.increment(-1)
  })
}
  hasBarScan=async({type,data})=>{
    const {buttonState}=this.state
    if(buttonState==='BookId'){
    this.setState({
      scaned:true,
      scanedBookId:data,
      buttonState:'normal'
    })
  }
  else if(buttonState==='StudentId'){
    this.setState({
      scaned:true,
      scanedStudentId:data,
      buttonState:'normal'
    })
  }
}
    render() {
      const hasCameraPermission=this.state.hasCameraPermission;
      const scaned=this.state.scaned;
      const buttonState=this.state.buttonState;
      if (buttonState!=='normal' && hasCameraPermission){
        return(
          <BarCodeScanner
          onBarCodeScanned={scaned?undefined:this.hasBarScan}
          ></BarCodeScanner>
        )
      }
      else if(buttonState==='normal') {
      return (
        <KeyboardAvoidingView behavior = 'padding' enabled>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Image
          source={require('../assets/booklogo.jpg')}
          style={{width:200, height:200}}
          />
          <Text>{
            hasCameraPermission===true ? this.state.scanedData:'Request camera Permission'}
          </Text>
          <TextInput
          placeholder='book Id'
          onChangeText={text => this.setState({scanedBookId:text})}
          value={this.state.scanedBookId}
          />
          <TouchableOpacity
onPress={()=>{this.getCameraPermission('BookId')}}
          >
            <Text>Scan book Id</Text>
          </TouchableOpacity>
          <TextInput
          placeholder='Student Id'
          onChangeText={text => this.setState({scanedStudentId:text})}
          value={this.state.scanedStudentId}
          />
          <TouchableOpacity
onPress={()=>{this.getCameraPermission('StudentId')}}
          >
            <Text>Scan Student Id</Text>
          </TouchableOpacity>
          <TouchableOpacity
          onPress={()=>{this.handleTransaction()}}
          >
            <Text>Submit</Text>
          </TouchableOpacity>
        </View>
        </KeyboardAvoidingView>
      );
    }
  }
}