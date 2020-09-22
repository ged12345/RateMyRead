/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import 'react-native-gesture-handler'; // required for correct initialization of the react-native-camera nlibrary
import React, {Component} from 'react';
import axios from 'axios';
import {
  SafeAreaView,
  StyleSheet,
  ScrollView,
  Alert,
  View,
  Text,
  Modal,
  TouchableHighlight,
  StatusBar,
  Image,
} from 'react-native';
import {RNCamera} from 'react-native-camera';
import goodreads, {baseParams} from './react/js/goodreads.js';

import {
  Header,
  LearnMoreLinks,
  Colors,
  DebugInstructions,
  ReloadInstructions,
} from 'react-native/Libraries/NewAppScreen';

class App extends React.Component {
  constructor() {
    super();
    this.state = {
      foundISBN: null,
      modalVisible: false,
      cameraVisible: true,
      title: '',
      author: '',
      isbn: '',
    };
  }

  // Do we need this? Move to modal variable?
  alert = {
    view: null,
    displayed: false,
  };

  goodreads = {
    response: null,
    requesting: false,
  };

  toggleModal(visible) {
    this.setState({modalVisible: visible});
    this.setState({cameraVisible: !visible});
    this.resetSearchAndDisplay();
  }

  resetSearchAndDisplay() {
    this.alert.displayed = false;
    this.alert.view = null;
    this.goodreads.requesting = false;
  }

  searchGoodreads = async (term) => {
    const response = await goodreads.get('', {
      params: {
        q: term,
        ...baseParams,
      },
    });

    return response;
  };

  barcodeRecognized = ({barcodes}) => {
    let validBarcode = null;
    barcodes.forEach((barcode) => {
      //console.log(barcode.data);
      // No errorCode field means the barcode is valid
      if (
        barcode['type'] !== undefined &&
        (barcode['type'] === 'EAN_13' || barcode['type'] === 'EAN_10')
      ) {
        //console.log(barcode);
        this.setState({foundISBN: barcode});

        if (
          this.alert.displayed === true &&
          this.goodreads.requesting === false
        ) {
          this.goodreads.requesting = true;
          this.searchGoodreads(barcode.data)
            .then((response) => {
              // handle success
              //console.log(response);
              //this.goodreads.response = response;
              var XMLParser = require('react-xml-parser');
              var xml = new XMLParser().parseFromString(response.data);

              // Move this to goodreads - we'll create a parser with checks, which defaults back to google books or world cat.
              var title = xml.getElementsByTagName('best_book')[0][
                'children'
              ][1]['value'];
              console.log(title);
              var author = xml.getElementsByTagName('best_book')[0][
                'children'
              ][2]['children'][1]['value'];
              this.setState({
                title: title,
                author: author,
                isbn: this.state.foundISBN.data,
              });
              this.toggleModal();
            })
            .catch((error) => {
              // handle error
              console.log(error);
            });
        }
      }
    });
  };

  renderCamera = () => {
    if (this.state.cameraVisible) {
      return (
        <RNCamera
          ref={(ref) => {
            this.camera = ref;
          }}
          style={styles.scanner}
          flashMode={RNCamera.Constants.FlashMode.on}
          onGoogleVisionBarcodesDetected={this.barcodeRecognized}></RNCamera>
      );
    } else {
      return null;
    }
  };

  componentDidUpdate() {
    if (this.state.foundISBN !== null && this.alert.displayed === false) {
      //this.alert.view = <View>{this.renderISBN(this.state.foundISBN)}</View>;
      this.alert.displayed = true;
    }
  }

  render() {
    return (
      <View style={styles.container}>
        <Modal
          animationType={'slide'}
          transparent={false}
          visible={this.state.modalVisible}
          onRequestClose={() => {
            console.log('Modal has been closed.');
          }}>
          <View style={styles.modal}>
            <Text style={styles.text}>Title: {this.state.title}</Text>
            <Text style={styles.text}>Author: {this.state.author}</Text>
            <Text style={styles.text}>ISBN: {this.state.isbn}</Text>

            <TouchableHighlight
              onPress={() => {
                this.toggleModal(!this.state.modalVisible);
              }}>
              <Text style={styles.closeText}>Close</Text>
            </TouchableHighlight>
          </View>
        </Modal>
        <Image
          style={styles.logo}
          source={require('./assets/img/rate-my-read-logo-low-res.jpg')}
        />
        {this.renderCamera()}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  scrollView: {
    backgroundColor: Colors.lighter,
  },
  container: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: 'black',
  },
  engine: {
    position: 'absolute',
    right: 0,
  },
  body: {
    backgroundColor: Colors.white,
  },
  sectionContainer: {
    marginTop: 32,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: Colors.black,
  },
  sectionDescription: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '400',
    color: Colors.dark,
  },
  highlight: {
    fontWeight: '700',
  },
  footer: {
    color: Colors.dark,
    fontSize: 12,
    fontWeight: '600',
    padding: 4,
    paddingRight: 12,
    textAlign: 'right',
  },
  logo: {
    width: 150,
    height: 150,
    marginLeft: 'auto',
    marginRight: 'auto',
  },
  scanner: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  modal: {
    flex: 1,
    alignItems: 'center',
    alignSelf: 'center',
    justifyContent: 'center',
    backgroundColor: 'black',
    padding: 50,
    width: '100%',
  },
  text: {
    color: 'white',
    marginTop: 10,
    fontSize: 24,
  },
  closeText: {
    color: 'white',
    marginTop: 40,
    borderColor: 'white',
    borderWidth: 1,
    borderRadius: 4,
    padding: 10,
  },
});

export default App;
