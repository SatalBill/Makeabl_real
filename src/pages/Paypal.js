// import React, { Component } from 'react'
// import {
//   View,
//   ActivityIndicator,
//   BackHandler
// } from 'react-native'
// import { WebView } from 'react-native-webview'
// import config, { BASE_PATH } from "../api/config"
// import axios from 'axios'

// // from postman, --> https://medium.com/zestgeek/paypal-integration-in-react-native-9d447df4fce1
// const auth_val = "Bearer A21AALL9gZ4pCV_j2-a8VN4wdq0bXbUldQ3gPY20GLPyhDSUevu-MsHiK7d6cvo5yIpzbgoSrnoct_XgpmkmOZMoj1TnDyyJQ";

// export default class Paypal extends Component {

//   WEBVIEW_REF = React.createRef();

//   state = {
//     accessToken: '',
//     approvalUrl: null,
//     paymentId: null,
//     canGoBack: false,
//     packageID: '',
//     from_date: '',
//     validity: '',
//   }

//   componentDidMount() {
//     BackHandler.addEventListener("hardwareBackPress", this.handleBackButton);
//     let packageID = this.props.navigation.getParam('packageID')
//     let from_date = this.props.navigation.getParam('from_date')
//     let validity = this.props.navigation.getParam('validity')
//     this.setState({
//       packageID: packageID,
//       from_date: from_date,
//       validity: validity,
//     })
//   }

//   componentWillUnmount() {
//     BackHandler.removeEventListener("hardwareBackPress", this.handleBackButton);
//   }

//   handleBackButton = () => {
//     if (this.state.canGoBack) {
//       this.WEBVIEW_REF.current.goBack();
//       return true;
//     }
//   };

//   onNavigationStateChange = (navState) => {
//     this.setState({
//       canGoBack: navState.canGoBack,
//     });
//   };

//   // componentDidMount() {
//   //   let currency = '76 USD'
//   //   currency.replace(" USD", "")

//   //   const dataDetail = {
//   //     "intent": "sale",
//   //     "payer": {
//   //       "payment_method": "paypal"
//   //     },
//   //     "transactions": [{
//   //       "amount": {
//   //         "total": currency,
//   //         "currency": "THB",
//   //         "details": {
//   //           "subtotal": currency,
//   //           "tax": "0",
//   //           "shipping": "0",
//   //           "handling_fee": "0",
//   //           "shipping_discount": "0",
//   //           "insurance": "0"
//   //         }
//   //       }
//   //     }],
//   //     "redirect_urls": {
//   //       "return_url": "https://example.com",
//   //       "cancel_url": "https://example.com"
//   //     }
//   //   }

//   //   axios.post('https://api.sandbox.paypal.com/v1/oauth2/token', { "grant_type": "client_credentials" },
//   //     {
//   //       headers: {
//   //         'Content-Type': 'application/x-www-form-urlencoded',
//   //         'Authorization': 'Bearer A21AAJ-O_u9tFrmwwDHNOZ-DZI-ArZ6dz6_pDfgBvQjmuDoIt7rdlFbVyhSU4ITVUGOID8BxDuII4PUSgtxLjW190fn6a3-Dg' // Your authorization value
//   //       }
//   //     }
//   //   )
//   //     .then(async (response) => {
//   //       await this.setState({
//   //         accessToken: response.data.access_token
//   //       })
//   //       console.log('access_token=>', response.data.access_token);
//   //       alert(response)


//   //       axios.post('https://api.sandbox.paypal.com/v1/payments/payment', dataDetail,
//   //         {
//   //           headers: {
//   //             'Content-Type': 'application/json',
//   //             'Authorization': `Bearer ${this.state.accessToken}`
//   //           }
//   //         }
//   //       )
//   //         .then((response) => {
//   //           console.log('--res after payment---------', response)
//   //           const { id, links } = response.data
//   //           const approvalUrl = links.find(data => data.rel == "approval_url")

//   //           this.setState({
//   //             paymentId: id,
//   //             approvalUrl: approvalUrl.href
//   //           })
//   //         }).catch(err => {
//   //           alert(err)
//   //           console.log('payments err1=>', { ...err })
//   //         })


//   //     }).catch(err => {
//   //       alert(err)
//   //       console.log('Token err2=>', { ...err })
//   //     })

//   // }

//   _onNavigationStateChange = (webViewState) => {
//     // if (webViewState.url.includes('https://example.com')) {
//     //   this.setState({
//     //     approvalUrl: null
//     //   })
//     //   const { PayerID, paymentId } = webViewState.url
//     //   axios.post(`https://api.sandbox.paypal.com/v1/payments/payment/${paymentId}/execute`, { payer_id: PayerID },
//     //     {
//     //       headers: {
//     //         'Content-Type': 'application/json',
//     //         'Authorization': `Bearer ${this.state.accessToken}`
//     //       }
//     //     }
//     //   )
//     //     .then((response) => {
//     //       console.log('After_navigationChange_res=>', response)

//     //     }).catch(err => {
//     //       console.log('navigationChange_error=>', { ...err })
//     //     })
//     // } else {
//     //   console.log(webViewState);
//     // }
//     this.setState({
//       canGoBack: webViewState.canGoBack,
//     })
//   }

//   render() {
//     const { approvalUrl } = this.state
//     return (
//       <View style={{ flex: 1 }}>
//         {
//           <WebView
//             style={{ height: 400, width: 300 }}
//             source={{ uri: `${BASE_PATH}/PurchaseController/purchase?package_id=${this.state.packageID}&from_date=${this.state.from_date}&validity=${this.state.validity}` }}
//             onNavigationStateChange={this._onNavigationStateChange}
//             javaScriptEnabled={true}
//             domStorageEnabled={true}
//             startInLoadingState={false}
//             style={{ marginTop: 20 }}
//             injectedJavaScript={`document.f1.submit()`}
//             ref={this.WEBVIEW_REF}
//           />
//         }
//       </View>
//     )
//   }
// }


















import React, { Component } from 'react'
import {
  View,
  ActivityIndicator,
  Text
} from 'react-native'
import { WebView } from 'react-native-webview'
import axios from 'axios'

// from postman, --> https://medium.com/zestgeek/paypal-integration-in-react-native-9d447df4fce1
const auth_val = "Basic QWMzUjFuNDBNSTlKeWVtellJMlhXNURnY1VBNmd0c1BRVzdZNV9DRGtnal9nd1FhTm5pVUZhNHBHVVl0dWJWS1Vha0FFeGNDYUFPRDRUMEw6RURNZ0hHcnJ6TUpUejhlQ1RXSHVxa2FkajcxT083bXJCWl8xMkJHdk8weXBkamEwdnRCME9PaS1DdmVvR3RZcnZ1U0h3Z3poTHBwVjkxZGE=";
// const auth_val = "Bearer A21AAKwMPGDnYuOLpRng1jSNyaFH5n-p7GJhybq15o31g-_gwo5ZokauAcbKu8ETYdpNee6MyhcIFeg8w8GQ--8fzjBJkoLNw";

export default class Paypal extends Component {

  state = {
    accessToken: null,
    approvalUrl: null,
    paymentId: null
  }

  async componentDidMount() {
    let currency = '76 USD'
    currency.replace(" USD", "")

    const dataDetail = {
      "intent": "sale",
      "payer": {
        "payment_method": "paypal"
      },
      "transactions": [{
        "amount": {
          "total": currency,
          "currency": "THB",
          "details": {
            "subtotal": currency,
            "tax": "0",
            "shipping": "0",
            "handling_fee": "0",
            "shipping_discount": "0",
            "insurance": "0"
          }
        }
      }],
      "redirect_urls": {
        "return_url": "https://freelancer.com",
        "cancel_url": "https://freelancer.com"
      }
    }

    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/x-www-form-urlencoded");
    myHeaders.append("Authorization", "Bearer A21AALL9gZ4pCV_j2-a8VN4wdq0bXbUldQ3gPY20GLPyhDSUevu-MsHiK7d6cvo5yIpzbgoSrnoct_XgpmkmOZMoj1TnDyyJQ");

    var data = 'grant_type=client_credentials'
    var requestOptions = {
      method: 'POST',
      headers: myHeaders,
      body: data,
      redirect: 'follow'
    };

    fetch("https://api.sandbox.paypal.com/v1/oauth2/token", requestOptions)
      .then(response => response.json())
      .then(async response => {
        // console.log('texted response => ', response.access_token),
        this.setState({ accessToken: response.access_token })
        console.log('access_token ==>', this.state.accessToken)
        fetch("https://api.sandbox.paypal.com/v1/payments/payment", { dataDetail },
          {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${this.state.accessToken}`
            }
          }
        )
          .then(response => {
            console.log('-----------', JSON.stringify(response))
            const { id, links } = response.data
            const approvalUrl = links.find(data => data.rel == "approval_url")

            this.setState({
              paymentId: id,
              approvalUrl: approvalUrl.href
            })
          }).catch(err => {
            alert(err)
            console.log('====err1', err)
          })
      })
      .catch(error => console.log('error=>', error));
  }

  _onNavigationStateChange = (webViewState) => {

    if (webViewState.url.includes('https://freelancer.com/')) {

      this.setState({
        approvalUrl: null
      })

      const { PayerID, paymentId } = webViewState.url

      axios.post(`https://api.sandbox.paypal.com/v1/payments/payment/${paymentId}/execute`, { payer_id: PayerID },
        {
          headers: {
            'Content-Type': 'application/json',
            'User-Authorization': `Bearer ${this.state.accessToken}`
          }
        }
      )
        .then(response => {
          console.log('====res', response)

        }).catch(err => {
          console.log('====err3', { ...err })
        })

    }
  }

  render() {

    const { approvalUrl } = this.state
    return (
      <View style={{ flex: 1 }}>
        {
          approvalUrl ? <WebView
            style={{ height: 400, width: 300 }}
            source={{ uri: approvalUrl }}
            onNavigationStateChange={this._onNavigationStateChange}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            startInLoadingState={false}
            style={{ marginTop: 20 }}
          /> : <ActivityIndicator color="red" />
          // approvalUrl
          //   ?
          //   <Text>Yes</Text>
          //   :
          //   <Text>Noasdas</Text>
        }
      </View>
    )
  }
}
























// import React, { Component } from 'react'
// import {
//   View,
//   ActivityIndicator,
//   Text
// } from 'react-native'
// import { WebView } from 'react-native-webview'
// import axios from 'axios'

// // from postman, --> https://medium.com/zestgeek/paypal-integration-in-react-native-9d447df4fce1
// const auth_val = "Basic QWMzUjFuNDBNSTlKeWVtellJMlhXNURnY1VBNmd0c1BRVzdZNV9DRGtnal9nd1FhTm5pVUZhNHBHVVl0dWJWS1Vha0FFeGNDYUFPRDRUMEw6RURNZ0hHcnJ6TUpUejhlQ1RXSHVxa2FkajcxT083bXJCWl8xMkJHdk8weXBkamEwdnRCME9PaS1DdmVvR3RZcnZ1U0h3Z3poTHBwVjkxZGE=";
// // const auth_val = "Bearer A21AAKwMPGDnYuOLpRng1jSNyaFH5n-p7GJhybq15o31g-_gwo5ZokauAcbKu8ETYdpNee6MyhcIFeg8w8GQ--8fzjBJkoLNw";

// const PAYPAL_API = 'https://api.sandbox.paypal.com'; // for product
// const CLIENT = 'AdJJayxVTVpbGsV9pEerKvd5J1poBInTG9RSWX157AhuN7DvjR3_xoj-yNFjAk0dHCgM4qT95-FznJsB';
// const SECRET = 'EIf6GY-y7bInpDTGKiBSPjXhS1CN8JSBbfNk27MkTR26AwlosTCSjH2Ef6zDSxweZD5YpQz7ZTxly_HB';

// export default class Paypal extends Component {

//   state = {
//     accessToken: null,
//     approvalUrl: null,
//     paymentId: null
//   }

//   async componentDidMount() {
//     let currency = '76 USD'
//     currency.replace(" USD", "")

//     const response = await axios({
//       url: '/v1/payments/payment',
//       method: 'post',
//       dataDetail: {
//         "intent": "sale",
//         "payer": {
//           "payment_method": "paypal"
//         },
//         "transactions": [{
//           "amount": {
//             "total": currency,
//             "currency": "USD",
//           }
//         }],
//         "redirect_urls": {
//           "return_url": "https://freelancer.com",
//           "cancel_url": "https://freelancer.com"
//         }
//       },
//       baseURL: PAYPAL_API,
//       auth: {
//         username: CLIENT,
//         password: SECRET
//       }
//     });
//     if (response.status === 200 || response.status === 201) {
//       console.log('response.data=>', response.data);
//       return response.data;
//     }
//     // return { errno: response.status, errmsg: '' };





//     // var myHeaders = new Headers();
//     // myHeaders.append("Content-Type", "application/x-www-form-urlencoded");
//     // myHeaders.append("Authorization", "Bearer A21AALL9gZ4pCV_j2-a8VN4wdq0bXbUldQ3gPY20GLPyhDSUevu-MsHiK7d6cvo5yIpzbgoSrnoct_XgpmkmOZMoj1TnDyyJQ");

//     // var data = 'grant_type=client_credentials'
//     // var requestOptions = {
//     //   method: 'POST',
//     //   headers: myHeaders,
//     //   body: data,
//     //   redirect: 'follow'
//     // };

//     // fetch("https://api.sandbox.paypal.com/v1/oauth2/token", requestOptions)
//     //   .then(response => response.json())
//     //   .then(async response => {
//     //     // console.log('texted response => ', response.access_token),
//     //     this.setState({ accessToken: response.access_token })
//     //     console.log('access_token ==>', this.state.accessToken)
//     //     fetch("https://api.sandbox.paypal.com/v1/payments/payment", { dataDetail },
//     //       {
//     //         headers: {
//     //           'Content-Type': 'application/json',
//     //           'Authorization': `Bearer ${this.state.accessToken}`
//     //         }
//     //       }
//     //     )
//     //       .then(response => {
//     //         console.log('-----------', JSON.stringify(response))
//     //         const { id, links } = response.data
//     //         const approvalUrl = links.find(data => data.rel == "approval_url")

//     //         this.setState({
//     //           paymentId: id,
//     //           approvalUrl: approvalUrl.href
//     //         })
//     //       }).catch(err => {
//     //         alert(err)
//     //         console.log('====err1', err)
//     //       })
//     //   })
//     //   .catch(error => console.log('error=>', error));
//   }

//   _onNavigationStateChange = (webViewState) => {

//     if (webViewState.url.includes('https://freelancer.com/')) {

//       this.setState({
//         approvalUrl: null
//       })

//       const { PayerID, paymentId } = webViewState.url

//       axios.post(`https://api.sandbox.paypal.com/v1/payments/payment/${paymentId}/execute`, { payer_id: PayerID },
//         {
//           headers: {
//             'Content-Type': 'application/json',
//             'User-Authorization': `Bearer ${this.state.accessToken}`
//           }
//         }
//       )
//         .then(response => {
//           console.log('====res', response)

//         }).catch(err => {
//           console.log('====err3', { ...err })
//         })

//     }
//   }

//   render() {

//     const { approvalUrl } = this.state
//     return (
//       <View style={{ flex: 1 }}>
//         {
//           approvalUrl ? <WebView
//             style={{ height: 400, width: 300 }}
//             source={{ uri: approvalUrl }}
//             onNavigationStateChange={this._onNavigationStateChange}
//             javaScriptEnabled={true}
//             domStorageEnabled={true}
//             startInLoadingState={false}
//             style={{ marginTop: 20 }}
//           /> : <ActivityIndicator color="red" />
//           // approvalUrl
//           //   ?
//           //   <Text>Yes</Text>
//           //   :
//           //   <Text>Noasdas</Text>
//         }
//       </View>
//     )
//   }
// }






















// import React, {useState} from 'react';
// import {
//   SafeAreaView,
//   StyleSheet,
//   View,
//   Text,
//   TextInput,
//   ScrollView,
//   TouchableOpacity,
// } from 'react-native';
// import {
//   requestOneTimePayment,
//   requestBillingAgreement,
//   PaypalResponse,
// } from 'react-native-paypal';

// const App = () => {
//   // Set token here to not have to paste every time (make sure not to commit!)
//   const [token, setToken] = useState('');
//   const [error, setError] = useState('');
//   const [success, setSuccess] = useState<PaypalResponse>({
//     nonce: '',
//     payerId: '',
//     email: '',
//     firstName: '',
//     lastName: '',
//     phone: '',
//   });
//   const [amount, setAmount] = useState('10');
//   const [
//     billingAgreementDescription,
//     setBillingAgreementDescription,
//   ] = useState('Billing Description');

//   const requestPayment = () =>
//     requestOneTimePayment(token, {amount})
//       .then(setSuccess)
//       .catch((err) => setError(err.message));

//   const requestBilling = () =>
//     requestBillingAgreement(token, {billingAgreementDescription})
//       .then(setSuccess)
//       .catch((err) => setError(err.message));

//   return (
//     <SafeAreaView>
//       <ScrollView>
//         <View style={styles.wrapper}>
//           <Text style={styles.headerStyle}>React-Native-Paypal</Text>

//           <Text style={styles.sectionTitle}>Token</Text>
//           <TextInput
//             onChangeText={setToken}
//             value={token}
//             style={styles.textInput}
//           />

//           <Text style={styles.sectionTitle}>Deposit Amount</Text>
//           <TextInput
//             onChangeText={setAmount}
//             value={amount}
//             style={styles.textInput}
//           />

//           <TouchableOpacity onPress={requestPayment} style={styles.button}>
//             <Text style={styles.buttonText}>Deposit one time payment</Text>
//           </TouchableOpacity>

//           <Text style={styles.sectionTitle}>Billing Description</Text>
//           <TextInput
//             onChangeText={setBillingAgreementDescription}
//             value={billingAgreementDescription}
//             style={styles.textInput}
//           />
//           <TouchableOpacity onPress={requestBilling} style={styles.button}>
//             <Text style={styles.buttonText}>Request Billing</Text>
//           </TouchableOpacity>

//           {!!error && <Text style={styles.errorText}>Error: {error}</Text>}

//           <Text style={styles.sectionTitle}>Response:</Text>
//           <Text>Nonce: {success.nonce}</Text>
//           <Text>Payer Id: {success.payerId}</Text>
//           <Text>Email: {success.email}</Text>
//           <Text>First Name: {success.firstName}</Text>
//           <Text>Last Name: {success.lastName}</Text>
//           <Text>Phone: {success.phone}</Text>
//         </View>
//       </ScrollView>
//     </SafeAreaView>
//   );
// };

// const styles = StyleSheet.create({
//   headerStyle: {
//     fontSize: 24,
//     fontWeight: '600',
//     color: 'black',
//   },
//   sectionTitle: {
//     paddingTop: 10,
//     fontSize: 20,
//     fontWeight: '600',
//     color: 'black',
//   },
//   wrapper: {
//     padding: 10,
//   },
//   errorText: {
//     color: 'red',
//   },
//   textInput: {
//     padding: 5,
//     backgroundColor: 'grey',
//     fontSize: 18,
//   },
//   button: {
//     margin: 10,
//     padding: 10,
//     backgroundColor: '#1E6738',
//     borderRadius: 10,
//     borderWidth: 1,
//     borderColor: '#fff',
//   },
//   buttonText: {
//     color: 'white',
//     alignSelf: 'center',
//     fontWeight: '600',
//   },
// });

// export default App;