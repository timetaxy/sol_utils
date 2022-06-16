import * as web3 from "@solana/web3.js";
import axios from "axios";

export class UserTokens {
	TOKEN_PROGRAM = 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA';

	constructor() {
		this.connection = new web3.Connection(
			"https://ssc-dao.genesysgo.net",
			'confirmed',
		);
	}

	getTokenPrices() {
		return axios.get("https://api.sonar.watch/latest/prices")
	}

	getBalance(tokenAddr) {
		return this.connection.getBalance(new web3.PublicKey(tokenAddr), "finalized")
	}

	async getParsedTokenAccountsByOwner(publicAddress) {
		const accounts = await this.connection.getParsedTokenAccountsByOwner(
			new web3.PublicKey(publicAddress),
			{
				programId: new web3.PublicKey(this.TOKEN_PROGRAM),
			}
		)

		console.log(`getParsedTokenAccountsByOwner ${publicAddress}`, accounts)

		const simple = [];

		for (const a of accounts.value) {
			const acc = a.account.data.parsed

			simple.push({
				rentEpoch: a.account.rentEpoch,
				amount: acc.info.tokenAmount,
				program: a.account.data.program,
				type: acc.type,

				mint: acc.info.mint,
				owner: acc.info.owner,
			})
		}
		return simple;
	}

	getTokenInfo() {
		return axios.get("https://cache.jup.ag/tokens")
	}
}