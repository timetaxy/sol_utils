<template>
	<tr>
		<td class="d-none d-md-table-cell">
			<a target="_blank" :href="`https://solscan.io/tx/${txn.signature}`">
				<i v-if="txn.err === null" class="fa fa-eye"></i>
				<i v-else class="fa fa-eye-slash red"></i>
				<span class="small ms-3">{{ txn.signature.substr(0, 20) }}...</span></a>
		</td>
		<td><a target="_blank" :href="`https://solscan.io/block/${txn.slot}`">#{{ txn.slot }}</a></td>
		<td class="d-none d-lg-table-cell">{{ humanTime }}</td>
		<td class="d-none d-lg-table-cell">{{ gasFee }}
			<SHDW class="small" mint-addr="So11111111111111111111111111111111111111112"></SHDW>
		</td>
		<td :class="colorStyle">{{ amountSign }}{{ txnBalanceChange }}</td>
		<td>
			<SHDW :mint-addr="tokenChange.mint" class="small"></SHDW>
			<span class="d-none d-inline-block">{{ tokenInfo[tokenChange.mint] ? tokenInfo[tokenChange.mint].name : 'Unknown Token' }}</span>
		</td>
		<td class="text-center">
			<SHDW mint-addr="EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v" class="small"></SHDW>
			{{ this.prices[tokenChange.mint] ? numFormatter.format((balanceChange.diff * this.prices[tokenChange.mint].value)) : 0 }}
		</td>
	</tr>
</template>

<script>
import SHDW from "../tokens/SHDW";
import moment from "moment";
import {LAMPORTS_PER_SOL} from "@solana/web3.js";

export default {
	name: "TxnRow",
	components: {SHDW},
	props: {
		tokenInfo: {
			type: Object,
			required: true,
		},
		prices: {
			type: Object,
			required: true,
		},
		txn: {
			type: Object,
			required: true,
		},
		diff: {
			type: Number,
			default() {
				return -1;
			},
		}
	},
	data() {
		return {
			numFormatter:new Intl.NumberFormat('en-US', {
				style: 'currency',
				currency: 'USD',
				minimumFractionDigits: 3,
			}),
			balanceChange: {
				diff: 0,
			},

			tokenChange: '',
			inputAmount: 0,
			outputAmount: 0,

			inputToken: {uiTokenAmount: {amount: 0, uiAmount: 0, uiAmountString: '0'}},
			outputToken: {uiTokenAmount: {amount: 0, uiAmount: 0, uiAmountString: '0'}}
		}
	},
	computed: {
		txnBalanceChange: function() {
			if (!this.balanceChange.diff)
				return 'None';

			return this.balanceChange.diff.toFixed(this.tokenInfo[this.tokenChange.mint] ? this.tokenInfo[this.tokenChange.mint].decimals : 9)
		},

		gasFee: function () {
			return this.txn.meta.fee / LAMPORTS_PER_SOL;
		},

		isAmountIncrease: function () {
			return this.balanceChange.diff > 0;
		},

		colorStyle: function() {
			if (this.balanceChange.diff > 0) {
				return 'green';
			} else if(this.balanceChange.diff < 0) {
				return 'red';
			}

			return 'grey'
		},

		humanTime: function () {
			return moment.unix((this.txn.block_time || this.txn.blockTime)).fromNow();
		},

		amountSign: function () {
			if (this.balanceChange.diff > 0)
				return "+"

			return "";
		},
	},
	methods: {

		calculateTxnProfit: function () {
			const mintDiff = {};
			const mintIdx = {};

			for (let i = 0; i < this.txn.meta.postTokenBalances.length; i++) {
				if (this.txn.meta.postTokenBalances[i].owner !== this.$route.params.id)
					continue

				const b = this.txn.meta.postTokenBalances[i]
				mintDiff[b.mint] = b.uiTokenAmount.uiAmount
				mintIdx[b.mint] = b
			}

			for (let i = 0; i < this.txn.meta.preTokenBalances.length; i++) {
				if (this.txn.meta.preTokenBalances[i].owner !== this.$route.params.id)
					continue

				const b = this.txn.meta.preTokenBalances[i]
				mintIdx[b.mint] = b
				mintDiff[b.mint] -= b.uiTokenAmount.uiAmount
				if (mintDiff[b.mint] === 0)
					delete mintDiff[b.mint]
			}


			const tokenAddr = this.$route.params.id;
			let ownerIdx = -1;
			for(let i = 0; i < this.txn.transaction.message.accountKeys; i++) {
				console.log("ACC",this.txn.transaction.message.accountKeys[i])
				if (tokenAddr === this.txn.transaction.message.accountKeys[i]) {
					ownerIdx = i;
					console.log("OwnerIdx", ownerIdx)
					break
				}
			}

			if (ownerIdx > -1) {
				console.log("ownerIdx", ownerIdx)
				const preSol = this.txn.meta.preBalances[ownerIdx]
				const postSol = this.txn.meta.postBalances[ownerIdx]
				const diff = postSol - preSol
				if (diff !== -this.txn.meta.fee) {
					mintDiff["11111111111111111111111111111111"] = diff
					mintIdx["11111111111111111111111111111111"] = {
						Owner: tokenAddr,
						Mint: "11111111111111111111111111111111",
					}
				}

			}

			if (Object.keys(mintDiff).length === 0) {
				return {
					mint: "",
					diff: 0,
					idx: -1,
				}
			}

			return {
				diff: mintDiff,
				idx: mintIdx
			}
		}

	},
	mounted() {

		this.tokenChange = this.txn
		this.balanceChange = {
			diff: this.txn.diff/Math.pow(10, this.tokenInfo[this.txn.mint].decimals),
		}
		// if (this.diff !== -1) {
		// 	this.tokenChange = {
		// 		mint: this.txn.mint,
		// 	}
		// 	this.balanceChange = {
		// 		diff: this.diff/Math.pow(10, this.tokenInfo[this.txn.mint].decimals),
		// 	};
		// 	return
		// }
		//
		// const r = this.calculateTxnProfit()
		// const ok = Object.keys(r.diff)[0]
		// const val = Object.values(r.diff)[0]
		//
		// this.tokenChange = r.idx[ok]
		// this.balanceChange = {
		// 	diff: val,
		// };
	}
}
</script>

<style scoped>

.red {
	color: red !important;
	fill: red !important;
}

a {
	text-decoration: none;
}
</style>