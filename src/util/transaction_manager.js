import * as web3 from "@solana/web3.js";
import Arberling from "../api/arberling";

export class TransactionManager {
	transactions = [];

	summary = {
		failed: 0,
		success: 0,
		amountMade: 0,
		gas: 0,
	}

	tradeSummary = {
		"So11111111111111111111111111111111111111112": {
			success: 0,
			failed: 0,
			amountMade: 0,
			gas: 0,
		}
	}

	initSummary(mintAddr) {
		if (this.tradeSummary[mintAddr])
			return

		this.tradeSummary[mintAddr] = {
			success: 0,
			failed: 0,
			amountMade: 0,
			gas: 0,
		}
	}

	addFailed() {
		this.summary.failed++;
		this.addGas()
	}

	addSuccess(amountMade) {
		this.summary.success++;
		this.summary.amountMade += amountMade
	}

	addGas(gas = 5000) {
		this.summary.gas += gas
	}

	totalTrades() {
		return this.summary.failed + this.summary.success
	}

	addSummary(tokenAddr, txn) {
		// console.log("addSummary", tokenAddr, txn)

		const profit = this.calculateProfit(tokenAddr, txn)
		if (profit.token === '') {
			this.addGas(txn.meta.fee)
			return
		}

		this.initSummary(profit.token.mint)
		const existing = this.tradeSummary[profit.token.mint]

		// console.log("Summary: " + profit.token.mint, txn, profit)

		this.addSuccess(profit.diff)
		this.addGas(txn.meta.fee)

		this.tradeSummary[profit.token.mint] = {
			success: existing.success + (txn.err === null ? 1 : 0),
			failed: existing.failed + (txn.err !== null ? 1 : 0),
			amount: profit.diff,
			gas: existing.gas + txn.meta.fee,
		}

	}


	constructor() {
		this.connection = new web3.Connection(
			"https://ssc-dao.genesysgo.net",
			'confirmed',
		);
	}

	async get(id) {
		let signatures = await this.getTxns(id);

		while (signatures.length === 1000 && this.transactions.length < 1000) {
			signatures = await this.getTxns(id, signatures[signatures.length - 1].signature)
			// console.log(`Txns`, this.transactions.length, signatures[signatures.length - 1].signature)
		}

		console.log("Summary", this.summary)
		console.log("Trade Summary", this.tradeSummary)
	}

	async getTxns(tokenAddr, before = null) {
		const opts = {
			limit: 1000,
		};

		if (before !== null) {
			console.debug("setting before", before)
			opts.before = before;
		}

		console.debug("getSignaturesForAddress", tokenAddr, opts)
		const signatures = await this.getSignatures(tokenAddr, opts);
		// console.log("signatures", signatures.length)

		for (let i = 0; i < signatures.length && i < 100; i++) {
			const parsed = await this.parseTransaction(signatures[i])
			this.transactions.push(parsed)

			if (parsed.err === null)
				this.addSummary(tokenAddr, parsed)
			else
				this.addFailed()
		}

		return signatures
	}

	async parseTransaction(txn) {
		if (txn.err !== null) { //Only parse successful transactions
			return Object.assign({}, txn)
		}

		const lsItem = localStorage.getItem("txn_" + txn.signature)
		if (lsItem !== null) {
			return JSON.parse(window.atob(lsItem))
		}

		console.debug("Cache Miss", txn.signature)
		const sigStatus = await this.getTransaction(txn.signature);
		const tx = Object.assign({}, txn, sigStatus);

		if (!this.isLocalStorageFull())
			localStorage.setItem("txn_" + txn.signature, window.btoa(JSON.stringify(tx)))

		return tx;
	}

	calculateProfit(tokenAddr, txn) {
		const mintDiff = {};
		const mintIdx = {};

		// console.log("Calculating profit", txn)
		for (let i = 0; i < txn.meta.postTokenBalances.length; i++) {
			if (txn.meta.postTokenBalances[i].owner !== tokenAddr)
				continue

			const b = txn.meta.postTokenBalances[i]
			mintDiff[b.mint] = parseInt(b.uiTokenAmount.amount)
			// mintDiff[b.mint] = b.uiTokenAmount.uiAmount
			mintIdx[b.mint] = b
		}

		for (let i = 0; i < txn.meta.preTokenBalances.length; i++) {
			if (txn.meta.preTokenBalances[i].owner !== tokenAddr)
				continue

			const b = txn.meta.preTokenBalances[i]
			mintIdx[b.mint] = b
			mintDiff[b.mint] -= parseInt(b.uiTokenAmount.amount)
			// mintDiff[b.mint] -= b.uiTokenAmount.uiAmount
			if (mintDiff[b.mint] === 0)
				delete mintDiff[b.mint]
		}

		// console.log("mintDiff", mintDiff)
		if (Object.keys(mintDiff).length === 0) {
			return {
				token: '',
				diff: 0,
				humanDiff: 0.00,
			}
		}


		const ok = Object.keys(mintDiff)[0]
		const val = Object.values(mintDiff)[0]

		// this.tokenChange = mintIdx[ok]
		// this.balanceChange = {
		// 	diff: val,
		// 	humanDiff: val.toFixed(this.tokenChange.uiTokenAmount.decimals),
		// };

		return {
			token: mintIdx[ok],
			diff: parseInt(val),
		}
	}

	isLocalStorageFull() {
		return 1024 * 1024 * 5 - unescape(encodeURIComponent(JSON.stringify(localStorage))).length < 0
	}

	//RPC


	async getSignatures(tokenAddr, opts) {
		return this.connection.getSignaturesForAddress(new web3.PublicKey(tokenAddr), opts)
	}

	// async getSignatures(tokenAddr, opts) {
	// 	const resp = await Arberling.signatures(tokenAddr, opts)
	// 	return resp.data
	// }

	async getTransaction(signature) {
		const resp = await Arberling.transaction(signature)
		return resp.data
		// return this.connection.getTransaction(signature, {encoding: "jsonParsed"})
	}
}