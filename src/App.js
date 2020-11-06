import React, {useState, useRef} from 'react'
import './App.css';

import firebase from 'firebase/app';
import 'firebase/firestore';
import 'firebase/auth';
import 'firebase/analytics';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useCollectionData } from 'react-firebase-hooks/firestore';


firebase.initializeApp({
  apiKey: "AIzaSyA_2aYIMzr7QJMJ_hQCeEok7wnHPA2I3AY",
  authDomain: "superchat-a980c.firebaseapp.com",
  databaseURL: "https://superchat-a980c.firebaseio.com",
  projectId: "superchat-a980c",
  storageBucket: "superchat-a980c.appspot.com",
  messagingSenderId: "449723142251",
  appId: "1:449723142251:web:d40fca69c4133506ae612e",
  measurementId: "G-9SXX9WJV5L"
})

const auth = firebase.auth();
const firestore = firebase.firestore();
const analytics = firebase.analytics();

function App() {
  const [user] = useAuthState(auth);

  return (
    <div className="App">
      <header>
        <h1>⚛️🔥💬 Welcome to SuperChat</h1>
        <SignOut />
      </header>

      <section>
        {user ? <ChatRoom /> : <SignIn />}
      </section>

    </div>
  );
}

function SignOut() {
  return auth.currentUser && (
    <button className="sign-out" onClick={() => auth.signOut()}>Sign Out</button>
  )
}

function SignIn() {
  const signInWithGoogle = () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider);
  }

  return (
    <div>  
      <div className="g-signin2 sign-in" onClick={signInWithGoogle} data-longtitle="true"
      data-width="250" data-height="60" data-onsuccess="onSignIn"></div>
    </div>
  )
}

function ChatRoom() {
  const dummy = useRef();
  const messageRef = firestore.collection('messages');
  const query = messageRef.orderBy('createdAt').limit(30);

  const [messages] = useCollectionData(query, {idField: 'id'});
  const [formValue, setFormValue] = useState('');

  const sendMessage = async (e) => {
    e.preventDefault();
    const {uid, photoURL} = auth.currentUser;
    await messageRef.add({
      text: formValue,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      uid,
      photoURL
    })

    setFormValue('');
    dummy.current.scrollIntoView({behavior: 'smooth'});
  }
  return (
    <div>
      <main>
        {messages && messages.map(msg => <ChatMessage key={msg.id} message={msg} />)}
        <span ref={dummy}></span>
      </main>

    <form onSubmit={sendMessage}>
      <input value={formValue} onChange={(e) => setFormValue(e.target.value)} placeholder="say something nice" />
      <button type="submit" disabled={!formValue}>🕊️</button>
    </form>
    </div>
  )
}

function ChatMessage(props) {
  const { text, uid, photoURL } = props.message;

  const messageClass = uid === auth.currentUser.uid ? 'sent' : 'received';

  return (<div>
    <div className={`message ${messageClass}`}>
      <img src={photoURL || 'https://api.adorable.io/avatars/23/abott@adorable.png'} />
      <p>{text}</p>
    </div>
  </div>)
}

export default App;
