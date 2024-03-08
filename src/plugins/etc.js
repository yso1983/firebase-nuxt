import Vue from 'vue'
import moment from 'moment'
import firebase from 'firebase/app'
import 'firebase/firestore'
import 'firebase/auth'

Vue.prototype.$moment = moment;

if (!firebase.apps.length) {
  
  //console.log('process.env.FIREBASE_PROJECTID - ', process.env.FIREBASE_PROJECTID);

  const config = {
    apiKey: process.env.FIREBASE_APIKEY,
    authDomain: process.env.FIREBASE_AUTHDOMAIN,
    projectId: process.env.FIREBASE_PROJECTID
  };
  firebase.initializeApp(config);
  Vue.prototype.$db = firebase.firestore();
  Vue.prototype.$db.settings({
    timestampsInSnapshots: true
  });
  Vue.prototype.$auth = firebase.auth;
}