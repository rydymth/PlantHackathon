import React, { useState } from 'react';
import { View, Text, Button, Image, StyleSheet, Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';
import mime from 'mime'
// import axios from 'axios';
import Config from 'react-native-config';
import * as tf from '@tensorflow/tfjs';

const modelR = await tf.loadLayersModel('./model/RudraModel/model.json');
const modelS = await tf.loadLayersModel('./model/ShubhamModel/model.json');

//
axios.interceptors.request.use(
    async config => {
        let request = config;
        request.headers = {
            'Content-Type': 'multipart/form-data',
            Accept: 'application/json',
        };
        request.url = configureUrl(config.url);
        return request;
    },
    error => error,
);

// export const { height, width } = Dimensions.get('window');

export const configureUrl = url => {
    let authUrl = url;
    if (url && url[url.length - 1] === '/') {
        authUrl = url.substring(0, url.length - 1);
    }
    return authUrl;
};

// Image properties before uploading to the server for ml
const options = {
    mediaType: 'photo',
    quality: 1,
    width: 256,
    height: 256,
    includeBase64: true,
    allowsEditing: true
};


// Image pick and crop and get the image input
const ImagePickerComponent = () => {
    // Classifying the plant??
    const [result, setResult] = useState('');
    // Label state --> whether the prediction has happened or not
    const [label, setLabel] = useState('');
    // image obtained or not state
    const [image, setImage] = useState('');

    // Get image using camera
    const openCamera = async () => {
        const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
        if (permissionResult.granted === false) {
            alert('Camera permission is required to take a photo.');
            return;
        }
        const result = await ImagePicker.launchCameraAsync(options);
        if (!result.canceled) {
            setImage(result.assets[0].uri);
            getResult(result);
        }
    };

    // Get image using library photo
    const openLibrary = async () => {
        const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (permissionResult.granted === false) {
            alert('Media Library permission is required to pick an image.');
            return;
        }
        const result = await ImagePicker.launchImageLibraryAsync(options);
        if (!result.canceled) {
            setImage(result.assets[0].uri);
            getResult(result);
        }
    };

    // Maybe we can make a reset button?
    const clearOutput = () => {
        setResult('');
        setImage('');
    };

    // uploads image, changes the text and runs prediction
    const getResult = async (image) => {
        setImage(image.uri);
        setLabel('Predicting...');
        setResult('');
        const params = {
            uri: image.uri,
            name: image.uri.split('/').pop(), // getting the text after the last slash which is the name of the image
            type: mime.getType(image.uri)
        };
        const res = await getPredication(params);
        if (res?.data?.class) {
            setLabel(res.data.class);
            setResult(res.data.confidence);
        } else {
            setLabel('Failed to predict');
        }
    };

    // changing to tensorflow js
    const getPredication = async (params) => {
        /*
        return new Promise((resolve, reject) => {
            var bodyFormData = new FormData();
            bodyFormData.append('file', params);
            const url = 'https://us-central1-trialapp-402019.cloudfunctions.net/predict';
            axios.post(url, bodyFormData)
                .then(response => {
                    resolve(response);
                })
                .catch(error => {
                    setLabel('Failed to predict.');
                    console.log('Error:', error);
                });
        }
        )
        */

        let img = tf.browser.fromPixels(params);
        modelR.print();
    };

const styles = StyleSheet.create({
  container: {
    paddingTop: 50,
  },
  tinyLogo: {
    width: 50,
    height: 50,
  },
});

    return (
        <View style={styles.container}>
            <Image
              style={styles.tinyLogo}
              source={require('./R.jpeg')}
              />
            <Text style={styles.header}>Image Picker Example</Text>
            <View style={styles.box}>
                {image && <Image source={{ uri: image }} style={styles.image} />}
                <View style={styles.button}>
                    <Button title="Pick an Image" onPress={openLibrary} />
                </View>
                <View style={styles.button}>
                    <Button title="Open Camera" onPress={openCamera} />
                </View>

                {(result && label && (
                    <View >
                        <Text >
                            {'Label: \n'}
                            <Text>{label}</Text>
                        </Text>
                        <Text>
                            {'Confidence: \n'}
                            <Text style={styles.resultText}>
                                {parseFloat(result).toFixed(2) + '%'}
                            </Text>
                        </Text>
                    </View>
                )) ||
                    (image && <Text style={styles.emptyText}>{label}</Text>) || (
                        <Text style={styles.emptyText}>
                            Use below buttons to select a picture of a potato plant leaf.
                        </Text>
                    )}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    header: {
        fontSize: 24,
        marginBottom: 20,
    },
    box: {
        borderWidth: 1,
        borderColor: 'red',
        padding: 20,
        alignItems: 'center',
    },
    image: {
        width: 300,
        height: 400,
        marginTop: 20,
        borderWidth: 2,
        borderColor: 'red',
    },
    button: {
        marginTop: 10,
        width: 250,
    },
    resultText: {
        fontSize: 16,
        marginTop: 10,
    },
    predictionText: {
        fontSize: 16,
        marginTop: 5,
    },
});

export default ImagePickerComponent;

