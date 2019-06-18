'use strict'

const axios = require('axios')
const FormData = require('form-data')
const util = require('util')
const toArray = require('stream-to-array')

class JumioClient {
  constructor(jumio) {
    this.baseUrl = jumio.baseUrl
    this.instance = axios.create({
      baseURL: jumio.baseUrl,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'User-Agent': jumio.userAgent
      },
      auth: {
        username: jumio.auth.username,
        password: jumio.auth.password
      }
    })
  }

  getWorkflowId({ identity = false, camera = false, upload = true }) {
    if (!identity) {
      if (camera && upload) {
        return '100'
      } else if (camera) {
        return '101'
      } else if (upload) {
        return '102'
      }
    }
    if (camera && upload) {
      return '200'
    } else if (camera) {
      return '201'
    } else if (upload) {
      return '202'
    }
    return '102'
  }

  // https://github.com/Jumio/implementation-guides/blob/master/netverify/netverify-web-v4.md
  async getNetVerifyLink(options) {
    const payload = {
      customerInternalReference: options.customerInternalReference,
      userReference: options.userReference,
      workflowId: options.workflowId
    }

    options.callbackUrl ? payload.callbackUrl = options.callbackUrl : null
    options.successUrl ? payload.successUrl = options.successUrl : null
    options.errorUrl ? payload.errorUrl = options.errorUrl : null
    options.locale ? payload.locale = options.locale : null

    if (options.presets) {
      payload.presets = []
      options.presets.index = 1
      payload.presets.push(options.presets)
    }

    const axiosConfig = {
      method: 'post',
      url: 'v4/initiate',
      headers: {
        'Content-Length': JSON.stringify(payload).length.toString()
      },
      data: payload
    }

    const res = await this.instance.request(axiosConfig)
    
    return res.data
  }

  // https://github.com/Jumio/implementation-guides/blob/master/netverify/performNetverify.md
  async performNetVerify(options, image) {
    const payload = {
      merchantIdScanReference: options.id,
      frontsideImage: image.toString('base64'),
      country: options.country,
      idType: options.idType,
      callbackUrl: options.callbackUrl
    }

    options.backsideImage ? payload.backsideImage = options.backsideImage : null
    options.firstName ? payload.firstName = options.firstName : null
    options.lastName ? payload.lastName = options.lastName : null
    options.expiry ? payload.expiry = options.expiry : null
    options.number ? payload.number = options.number : null
    options.dob ? payload.dob = options.dob : null

    const axiosConfig = {
      method: 'post',
      url: 'netverify/v2/performNetverify',
      headers: {
        'Content-Length': JSON.stringify(payload).length.toString()
      },
      data: payload
    }

    const { data } = await this.instance.request(axiosConfig)

    return data
  }

  // https://github.com/Jumio/implementation-guides/blob/master/netverify/netverify-retrieval-api.md#retrieving-available-images
  async getAvailableScans(id) {
    const url = `netverify/v2/scans/${id}/images`
    let { data } = await this.instance.request({ url })
    // force it to be array
    data.images = [].concat(data.images)

    return data
  }

  // https://github.com/Jumio/implementation-guides/blob/master/netverify/netverify-retrieval-api.md#retrieving-specific-image
  async getScan({ id, classifier, href }) {
    let url = `netverify/v2/scans/${id}/images/${classifier}`
    href ? url = href : null

    const responseType = 'stream'
    const headers = { Accept: 'image/jpeg' }

    const { data } = await this.instance.request({ url, responseType, headers })

    const parts =  await toArray(data)
    const buffers = parts.map(part => util.isBuffer(part) ? part : Buffer.from(part))
    
    return Buffer.concat(buffers)
  }

  // https://github.com/Jumio/implementation-guides/blob/master/netverify/netverify-retrieval-api.md#retrieving-scan-details
  async getScanDetails(id) {
    const url = `netverify/v2/scans/${id}/data`

    const { data } = await this.instance.request({ url })

    return data
  }

  // https://github.com/Jumio/implementation-guides/blob/master/netverify/netverify-retrieval-api.md#retrieving-scan-status
  async getScanStatus(id) {
    const url = `netverify/v2/scans/${id}`

    const { data } = await this.instance.request({ url })

    return data
  }

  // https://github.com/Jumio/implementation-guides/blob/master/netverify/netverify-delete-api.md#deleting-a-netverify-scan
  async deleteNetverifyScans(id) {
    const url = `netverify/v2/scans/${id}`
    const method = 'delete'

    const { data } = await this.instance.request({ url, method })

    return data
  }

  // https://github.com/Jumio/implementation-guides/blob/master/netverify/document-verification.md
  async getDocumentVerificationLink(options) {
    const url = `${this.baseUrl.slice(0, 8)}upload.${this.baseUrl.slice(8)}`
    const payload = {
      type: options.type,
      country: options.country,
      customerId: options.customerId,
      callbackUrl: options.callbackUrl,
      merchantScanReference: options.merchantScanReference
    }

    options.successUrl ? payload.successUrl = options.successUrl : null
    options.errorUrl ? payload.errorUrl = options.errorUrl : null
    options.locale ? payload.locale = options.locale : null
    options.baseColor ? payload.baseColor = options.baseColor : null
    options.bgColor ? payload.bgColor = options.bgColor : null

    const axiosConfig = {
      method: 'post',
      url: url + 'netverify/v2/acquisitions',
      headers: {
        'Content-Length': JSON.stringify(payload).length.toString()
      },
      data: payload
    }

    const { data } = await this.instance.request(axiosConfig)

    return data
  }

  // https://github.com/Jumio/implementation-guides/blob/master/netverify/document-verification.md#single-page-upload
  // Jumio supports only JPG, PNG and PDF - max size 10Mb
  async performDocumentVerification(options, file) {
    options.fileName ? null : options.fileName = 'image.jpg'
    const url = `${this.baseUrl.slice(0, 8)}acquisition.${this.baseUrl.slice(8)}`

    const form = new FormData()
    form.append('metadata', JSON.stringify(options))
    form.append('image', file, { filename: options.fileName })
    
    const axiosConfig = {
      method: 'post',
      url: url + 'netverify/v2/acquisitions/complete',
      headers: form.getHeaders(),
      data: form
    }

    const { data } = await this.instance.request(axiosConfig)

    return data
  }

  // https://github.com/Jumio/implementation-guides/blob/master/netverify/netverify-retrieval-api.md#retrieving-scan-status-1
  async getDocumentStatus(id) {
    let url = `${this.baseUrl.slice(0, 8)}retrieval.${this.baseUrl.slice(8)}`
    url += `netverify/v2/documents/${id}`

    const { data } = await this.instance.request({ url })

    return data
  }

  // https://github.com/Jumio/implementation-guides/blob/master/netverify/netverify-retrieval-api.md#retrieving-scan-details-1
  async getDocumentDetails(id) {
    let url = `${this.baseUrl.slice(0, 8)}retrieval.${this.baseUrl.slice(8)}`
    url += `netverify/v2/documents/${id}/data`

    const { data } = await this.instance.request({ url })

    return data
  }

  // https://github.com/Jumio/implementation-guides/blob/master/netverify/netverify-retrieval-api.md#retrieving-available-images-1
  async getAvailableDocuments(id) {
    let url = `${this.baseUrl.slice(0, 8)}retrieval.${this.baseUrl.slice(8)}`
    url += `netverify/v2/documents/${id}/pages`

    const { data } = await this.instance.request({ url })

    return data
  }

  // https://github.com/Jumio/implementation-guides/blob/master/netverify/netverify-retrieval-api.md#retrieving-specific-image-1
  async getDocument(id) {
    let url = `${this.baseUrl.slice(0, 8)}retrieval.${this.baseUrl.slice(8)}`
    url += `netverify/v2/documents/${id}/pages/1`

    const responseType = 'stream'
    const headers = { Accept: 'image/jpeg' }

    const { data } = await this.instance.request({ url, responseType, headers })

    const parts =  await toArray(data)
    const buffers = parts.map(part => util.isBuffer(part) ? part : Buffer.from(part))
    // require('fs').writeFileSync(require('path').join(__dirname, 'testImage.jpg'), Buffer.concat(buffers))
    return Buffer.concat(buffers)
  }

  //get document by classifier
  async getDocumentByClassifier({ id, classifier, href }) {
    let url = `${this.baseUrl.slice(0, 8)}retrieval.${this.baseUrl.slice(8)}`
    url += `netverify/v2/documents/${id}/pages/${classifier}`

    href ? url = href : null

    const responseType = 'stream'
    const headers = { Accept: 'image/jpeg' }

    const { data } = await this.instance.request({ url, responseType, headers })

    const parts =  await toArray(data)
    const buffers = parts.map(part => util.isBuffer(part) ? part : Buffer.from(part))
    
    return Buffer.concat(buffers)
  }

  // https://github.com/Jumio/implementation-guides/blob/master/netverify/document-verification.md#single-page-upload
  async getSupportedDocumentTypes() {
    const url = 'netverify/v2/supportedDocumentTypes'
    const { data } = await this.instance.request({ url })

    return data
  }

  // https://github.com/Jumio/implementation-guides/blob/master/netverify/netverify-delete-api.md#deleting-a-document-verification-scan
  async deleteDocumentVerification(id) {
    let url = `${this.baseUrl.slice(0, 8)}retrieval.${this.baseUrl.slice(8)}`
    url += `netverify/v2/documents/${id}`
    const method = 'delete'

    const { data } = await this.instance.request({ url, method })

    return data
  }

  // https://github.com/Jumio/implementation-guides/blob/master/netverify/document-verification.md#multi-page-upload-initiating-the-transaction
  async multiPageDocumentVerification(options, file) {
    options.url = `${this.baseUrl.slice(0, 8)}acquisition.${this.baseUrl.slice(8)}`
    options.fileName ? null : options.fileName = 'image.jpg'

    switch(options.action) {
      case 'start':
        return this._start(options)
      case 'addPage':
        return this._addPage(options, file)
      case 'newDocument':
        return this._newDocument(options, file)
      case 'end':
        return this._end(options)
    }
  }

  async _start(options) {
    const payload = {
      type: options.type,
      country: options.country,
      customerId: options.customerId,
      callbackUrl: options.callbackUrl,
      merchantScanReference: options.merchantScanReference
    }

    const axiosConfig = {
      method: 'post',
      url: options.url + 'netverify/v2/acquisitions',
      headers: {
        'Content-Length': JSON.stringify(payload).length.toString()
      },
      data: payload
    }

    const { data } = await this.instance.request(axiosConfig)

    return data
  }

  async _end(options) {
    const url = `${options.url}netverify/v2/acquisitions/${options.id}`
    const method = 'put'

    const { data } = await this.instance.request({ url, method })

    return data
  }

  async _addPage(options, file) {
    const form = new FormData()
    form.append('image', file, { fileName: options.fileName })
    
    const axiosConfig = {
      method: 'post',
      url: `${options.url}netverify/v2/acquisitions/${options.id}/document/pages/${options.pageNum}`,
      headers: form.getHeaders(),
      data: form
    }

    const { data } = await this.instance.request(axiosConfig)

    return data
  }

  async _newDocument(options, file) {
    const form = new FormData()
    form.append('image', file, { fileName: options.fileName })
    
    const axiosConfig = {
      method: 'post',
      url: `${options.url}netverify/v2/acquisitions/${options.id}/document`,
      headers: form.getHeaders(),
      data: form
    }

    const { data } = await this.instance.request(axiosConfig)

    return data
  }
}

module.exports = JumioClient
