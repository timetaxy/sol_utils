<template>
	<tr>
		<td>
			<a target="_blank" :href="`https://solscan.io/tx/${txn.signature}`">
				<i v-if="txn.err === null" class="fa fa-eye"></i>
				<i v-else class="fa fa-eye-slash red"></i>
				<span class="small ms-3">{{ txn.signature.substr(0, 20) }}...</span></a>
		</td>
		<td><a :href="`https://solscan.io/block/${txn.blockTime}`">#{{ txn.blockTime }}</a></td>
		<td>{{ humanTime }}</td>
		<td>{{ gasFee }}
			<SHDW class="small" mint-addr="So11111111111111111111111111111111111111112"></SHDW>
		</td>
		<td :class="colorStyle">{{ amountSign }}{{ txnBalanceChange }}</td>
		<td>
			<SHDW :mint-addr="tokenChange.mint" class="small"></SHDW>
			{{ tokenInfo[tokenChange.mint] ? tokenInfo[tokenChange.mint].name : 'Unknown Token' }}
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
				return -1;

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
			return moment.unix(this.txn.blockTime).fromNow();
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

			if (Object.keys(mintDiff).length === 0) {
				return
			}

			return {
				diff: mintDiff,
				idx: mintIdx
			}
		}

	},
	mounted() {
		if (this.diff !== -1) {
			this.tokenChange = {
				mint: this.txn.mint,
			}
			this.balanceChange = {
				diff: this.diff/Math.pow(10, this.tokenInfo[this.txn.mint].decimals),
			};
			return
		}

		const r = this.calculateTxnProfit()
		const ok = Object.keys(r.diff)[0]
		const val = Object.values(r.diff)[0]

		this.tokenChange = r.idx[ok]
		this.balanceChange = {
			diff: val,
		};
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