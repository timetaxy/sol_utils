import * as web3 from "@solana/web3.js"
// import "@solana/web3.js/src/index"

// importScripts('../util/transaction_manager.js')


class Work {

	connection = null;

	parseTransaction(txn) {
		if (txn.err !== null) { //Only parse successful transactions
			postMessage(Object.assign({}, txn));
			return
		}

		const lsItem = localStorage.getItem("txn_" + txn.signature)
		if (lsItem !== null) {
			return lsItem
		}

		this.connection.getTransaction(txn.signature, {encoding: "jsonParsed"}).then((sigStatus) => {

			const tx = Object.assign({}, txn, sigStatus);

			postMessage(tx);
			localStorage.setItem("txn_" + txn.signature, tx)
		})
	}



	getTxns(tokenAddr, before = null) {
		console.log("Getting TXNS", tokenAddr, before)
		const opts = {
			limit: 1000,
		};

		if (before !== null)
			opts.before = before;

		if (this.connection === null) {
			this.connection = new web3.Connection(
				"https://ssc-dao.genesysgo.net",
				'confirmed',
			);
		}


		this.connection.getSignaturesForAddress(new web3.PublicKey(tokenAddr), opts).then((signatures) => {
			for (let i = 0; i < signatures.length; i++) {
				this.parseTransaction(signatures[i])
			}

			if (signatures.length === 1000) {
				this.getTxns(tokenAddr, signatures[signatures.length - 1].signature)
			}
		})
	}
}

const work = new Work();

self.onmessage = function (e) {
	console.log('Worker: Message received from main script', e.data);
	// this.getTxns(e.data[0])

	work.getTxns(e.data[0])

	// console.log('Worker: Message received from main script');
	// const result = e.data[0] * e.data[1];
	// if (isNaN(result)) {
	// 	postMessage('Please write two numbers');
	// } else {
	// 	const workerResult = 'Result: ' + result;
	// 	console.log('Worker: Posting message back to main script');
	// 	postMessage(workerResult);
	// }
}