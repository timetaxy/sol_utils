import axios from 'axios';

export class Arberling {

	base = 'http://localhost:9093';

	constructor() {
		//
	}


	state(publicKey) {
		const uri = `${this.base}/accounts/${publicKey}/state`
		return axios.get(uri)
	}


	summary(publicKey) {
		const uri = `${this.base}/accounts/${publicKey}/summary`
		return axios.get(uri)
	}

	signatures(publicKey, opts) {
		let uri = `${this.base}/accounts/${publicKey}/signatures`
		if (opts.before) {
			uri += `?before=${opts.before}`
		}
		if (opts.until) {
			uri += `&until=${opts.until}`
		}

		return axios.get(uri)
	}

	successfulSignatures(publicKey) {
		const uri = `${this.base}/accounts/${publicKey}/signatures/successful`
		return axios.get(uri)
	}

	transaction(signature) {
		const uri = `${this.base}/transactions/${signature}`
		return axios.get(uri)
	}
}

export default new Arberling()