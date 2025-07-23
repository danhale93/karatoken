import * as Facebook from 'expo-auth-session/providers/facebook';
import * as Google from 'expo-auth-session/providers/google';
import { useRouter } from 'expo-router';
import { createUserWithEmailAndPassword, FacebookAuthProvider, GoogleAuthProvider, signInWithCredential, updateProfile } from 'firebase/auth';
import React, { useEffect } from 'react';
import { Button, StyleSheet, Text, TextInput, View } from 'react-native';
import { auth } from '../firebaseConfig';


export default function RegisterScreen() {
  const router = useRouter();
  const [username, setUsername] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [userType, setUserType] = React.useState('singer');
  const [error, setError] = React.useState('');
  const [success, setSuccess] = React.useState('');

  const handleRegister = async () => {
    setError('');
    setSuccess('');
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      // Optionally set display name
      if (userCredential.user) {
        await updateProfile(userCredential.user, { displayName: username });
      }
      setSuccess('Registration successful!');
      // Optionally redirect to login
      // router.push('/login');
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    }
  };

  const [, googleResponse, googlePromptAsync] = Google.useIdTokenAuthRequest({
    clientId: '116553890071877164974',
  });
  const [, fbResponse, fbPromptAsync] = Facebook.useAuthRequest({
    clientId: 'YOUR_ACTUAL_FACEBOOK_APP_ID', // Obtain from Firebase console
  });

  useEffect(() => {
    if (googleResponse?.type === 'success') {
      const credential = GoogleAuthProvider.credential(googleResponse.params.id_token);
      signInWithCredential(auth, credential);
    }
  }, [googleResponse]);

  useEffect(() => {
    if (fbResponse?.type === 'success') {
      const credential = FacebookAuthProvider.credential(fbResponse.params.access_token);
      signInWithCredential(auth, credential);
    }
  }, [fbResponse]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Register</Text>
      <TextInput
        style={styles.input}
        placeholder="Username"
        placeholderTextColor="#9CA3AF"
        value={username}
        onChangeText={setUsername}
      />
      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor="#9CA3AF"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor="#9CA3AF"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <Button title="Register" onPress={handleRegister} />
      {error ? <Text style={{ color: 'red', marginTop: 10 }}>{error}</Text> : null}
      {success ? <Text style={{ color: 'green', marginTop: 10 }}>{success}</Text> : null}
      <Button title="Continue" onPress={() => router.push('/profile-setup')} />
      <View style={{ height: 16 }} />
      <Button title="Try Live Pitch Scoring" onPress={() => router.push('/(tabs)/live-pitch-scoring')} />
      <Button title="Register with Google" onPress={() => googlePromptAsync()} />
      <Button title="Register with Facebook" onPress={() => fbPromptAsync()} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111827',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 24,
  },
  input: {
    width: '80%',
    backgroundColor: '#232946',
    color: '#FFFFFF',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
  },
});
