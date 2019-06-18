'use strict'

var fs = require('fs')
const path = require('path')
const config = require('./config')
const Jumio = require('../src/Jumio')

console.log('Calling Jumio constructor')
const jumio = new Jumio(config.jumio)

// const promise = jumio.getNetVerifyLink({
//     customerInternalReference: 'test123',
//     userReference: 'userTest123',
//     workflowId: '100',
//     locale: 'en-GB'
// })

// const promise = jumio.getAvailableImages('a9387365-61eb-4667-8b25-cd0bcc8bd9ed')

// const promise = jumio.getImage({ 
//     id: 'a9387365-61eb-4667-8b25-cd0bcc8bd9ed',
//     classifier: 'front'
// })

// const promise = jumio.getScanDetails('15298a1b-9e07-4277-9b61-bb17195b9e3e')

// const promise = jumio.getScanStatus('13fe76ff-7a14-40cc-84fb-1418bf1defb5')

// const promise = jumio.getDocumentVerificationLink({
//     type: 'BS',
//     country: 'CZE',
//     customerId: 'testUser123',
//     merchantScanReference: 'testTransaction123',
//     callbackUrl: 'https://www.yourcompany.com/callback'
// })

// const testFile = fs.createReadStream(path.join(__dirname, 'document.jpg'))
// const promise = jumio.performDocumentVerification({
//     type: 'BS',
//     country: 'CZE',
//     merchantScanReference: 'multipart_test123',
//     customerId: 'multipart_user123',
//     callbackUrl: 'https://mycustomdomain.xxxxxx'
// }, testFile)

// const promise = jumio.getSupportedDocumentTypes()

// const promise = jumio.getDocumentStatus('e4f703fe-9880-47a1-a15b-b652051d8ee6')

// const promise = jumio.getDocumentDetails('e4f703fe-9880-47a1-a15b-b652051d8ee6')

// const promise = jumio.getDocument('e4f703fe-9880-47a1-a15b-b652051d8ee6')

// const promise = jumio.getAvailableDocuments('e4f703fe-9880-47a1-a15b-b652051d8ee6')

// const testFile = fs.createReadStream(path.join(__dirname, 'document.jpg'))
// const promise = jumio.multiPageDocumentVerification({
//     action: 'start',
//     type: 'BS',
//     country: 'CZE',
//     merchantScanReference: 'multipart_test123',
//     customerId: 'multipart_user123',
//     callbackUrl: 'https://mycustomdomain.xxxxxx'
// }, testFile)

// const testFile = fs.createReadStream(path.join(__dirname, 'document.jpg'))
// const promise = jumio.multiPageDocumentVerification({
//     action: 'addPage',
//     id: '8e41eb91-bcb9-44e2-81f9-851140eccb55',
//     pageNum: '2'
// }, testFile)

// const testFile = fs.createReadStream(path.join(__dirname, 'sample.pdf'))
// const promise = jumio.multiPageDocumentVerification({
//     action: 'newDocument',
//     id: '8e41eb91-bcb9-44e2-81f9-851140eccb55'
// }, testFile)

// const testFile = fs.createReadStream(path.join(__dirname, 'sample.pdf'))
// const promise = jumio.multiPageDocumentVerification({
//     action: 'end',
//     id: '8e41eb91-bcb9-44e2-81f9-851140eccb55'
// }, testFile)


// promise.then(res => console.log('res= ', res)).catch(e => console.error(e))