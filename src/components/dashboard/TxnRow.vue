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
		<td :class="isAmountIncrease ? 'green' : 'red'">{{ amountSign }}{{ balanceChange.diff.toFixed(tokenInfo[tokenChange.mint] ? tokenInfo[tokenChange.mint].decimals : 9) }}</td>
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
				humanDiff: "0.0",
			},

			tokenChange: '',
			inputAmount: 0,
			outputAmount: 0,

			inputToken: {uiTokenAmount: {amount: 0, uiAmount: 0, uiAmountString: '0'}},
			outputToken: {uiTokenAmount: {amount: 0, uiAmount: 0, uiAmountString: '0'}}
		}
	},
	computed: {
		gasFee: function () {
			return this.txn.meta.fee / LAMPORTS_PER_SOL;
		},

		isAmountIncrease: function () {
			return this.balanceChange.diff > 0;
		},

		humanTime: function () {
			return moment.unix(this.txn.blockTime).fromNow();
		},

		amountSign: function () {
			if (this.balanceChange.diff > 0)
				return "+"

			if (this.balanceChange.diff < 0)
				return "-"

			return "";
		},
	},
	methods: {},
	mounted() {

		// let largestDiff = 0;
		// let largestDiffIndex = 0;
		// const diffs = {}


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

		// console.log("mintDiff", mintDiff)

		const ok = Object.keys(mintDiff)[0]
		const val = Object.values(mintDiff)[0]

		this.tokenChange = mintIdx[ok]
		this.balanceChange = {
			diff: val,
			// humanDiff: val.toFixed(this.tokenChange.uiTokenAmount.decimals),
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