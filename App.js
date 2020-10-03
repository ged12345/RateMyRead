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
import {Button, Icon} from 'semantic-ui-react';
import {RNCamera} from 'react-native-camera';
import goodreadsAPI, {
  searchGoodreads,
  baseAPIParams,
} from './react/js/goodreadsAPI.js';
import GoodreadsParser from './react/js/goodreadsParser.js';

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
      foundText: null,
      pictureTaken: true,
      modalVisible: false,
      cameraVisible: true,
      title: '',
      author: '',
      isbn: '',
      goodreads: {
        response: null,
        requesting: false,
      },
      modalDisplayed: false,
    };
  }

  // Do we need this? Move to modal variable?

  goodreadsParser = new GoodreadsParser();

  toggleModal(visible) {
    this.setState({modalVisible: visible, cameraVisible: !visible});
    this.resetSearchAndDisplay();
  }

  resetSearchAndDisplay() {
    this.setState((prevState) => ({
      goodreads: {
        ...prevState.goodreads,
        requesting: false,
      },
      modalDisplayed: false,
    }));
  }
  togglePicture = () => {
    // Only take one picture at a time
    this.setState({pictureTaken: !this.state.pictureTaken});
  };

  onBarcodeRecognized = ({barcodes}) => {
    let validBarcode = null;

    if (this.state.pictureTaken !== true) return;

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
          this.state.modalDisplayed === true &&
          this.state.goodreads.requesting === false
        ) {
          this.setState((prevState) => ({
            goodreads: {
              ...prevState.goodreads,
              requesting: true,
            },
          }));
          this.requestBarcodeData(barcode.data);
        }
      }
    });
  };

  requestBarcodeData = (data) => {
    searchGoodreads(data)
      .then((response) => {
        // handle success
        var goodreadsData = this.goodreadsParser.parseXML(response);

        this.setState({
          title: goodreadsData['title'],
          author: goodreadsData['author'],
          isbn: this.state.foundISBN.data,
        });
        this.toggleModal();
        this.togglePicture();
      })
      .catch((error) => {
        // handle error
        console.log(error);
        this.togglePicture();
      });
  };

  onTextRecognized = ({textBlocks}) => {
    //this.setState({ detectedTexts: textBlocks.map((b) => b.value) });
    //console.log('HERE');
    textBlocks.forEach((textBlock) => {
      this.setState({foundText: textBlock});
      this.togglePicture();
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
          onGoogleVisionBarcodesDetected={this.onBarcodeRecognized}
          r
          onTextRecognized={this.onTextRecognized}></RNCamera>
      );
    } else {
      return null;
    }
  };

  componentDidUpdate() {
    if (this.state.foundISBN !== null && this.state.modalDisplayed === false) {
      this.setState({modalDisplayed: true});
    }
  }

  /* We need an take picture icon so we're not always scanning for ISBNs and text blocks. Then we do our magic.*/

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
        <Button icon>
          <Icon name="camera retro" />
        </Button>
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
