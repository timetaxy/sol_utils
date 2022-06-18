<template>
	<tr>
		<td>
			<a target="_blank" :href="`https://solscan.io/tx/${txn.signature}`">
				<i v-if="txn.err === null" class="fa fa-eye d-none d-md-inline-block"></i>
				<i v-else class="fa fa-eye-slash red d-none d-md-inline-block"></i>
				<span class="small ms-3">{{ txn.signature.substr(0, 12) }}...</span></a>
		</td>
		<td class="d-none d-md-table-cell"><a target="_blank" :href="`https://solscan.io/block/${txn.slot}`">#{{ txn.slot }}</a></td>
		<td class="d-none d-lg-table-cell">{{ humanTime }}</td>
		<td class="d-none d-lg-table-cell">{{ gasFee }}
			<SHDW v-show="gasFee !== '-'" class="small" mint-addr="So11111111111111111111111111111111111111112"></SHDW>
		</td>
		<td :class="colorStyle">{{ amountSign }}{{ txnBalanceChange }}</td>
		<td class="text-center text-lg-start">
			<SHDW :mint-addr="tokenChange.mint" class="small"></SHDW>
			<span class="d-none d-md-inline-block"> {{ tokenInfo[tokenChange.mint] ? tokenInfo[tokenChange.mint].name : 'Unknown Token' }}</span>
		</td>
		<td class="text-end">
			<SHDW mint-addr="EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v" class="small d-none d-md-inline-block"></SHDW>
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
			numFormatter: new Intl.NumberFormat('en-US', {
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
		txnBalanceChange: function () {
			if (!this.balanceChange.diff)
				return 'None';

			return this.balanceChange.diff.toFixed(this.tokenInfo[this.tokenChange.mint] ? this.tokenInfo[this.tokenChange.mint].decimals : 9)
		},

		gasFee: function () {
			if (this.txn.meta.fee === 0)
				return '-';

			return this.txn.meta.fee / LAMPORTS_PER_SOL;
		},

		isAmountIncrease: function () {
			return this.balanceChange.diff > 0;
		},

		colorStyle: function () {
			if (this.balanceChange.diff > 0) {
				return 'green';
			} else if (this.balanceChange.diff < 0) {
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
	methods: {},
	mounted() {

		this.tokenChange = this.txn
		this.balanceChange = {
			diff: this.txn.diff / Math.pow(10, this.tokenInfo[this.txn.mint].decimals),
		}
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