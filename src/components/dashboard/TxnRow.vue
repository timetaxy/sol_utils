<template>
	<tr>
		<td>
			<a target="_blank" :href="`https://solscan.io/tx/${txn.signature}`">
				<i v-if="txn.err === null || !txn.error" class="fa fa-eye d-none d-md-inline-block"></i>
				<i v-else class="fa fa-eye-slash red d-none d-md-inline-block"></i>
				<span class="small ms-3">{{ txn.signature.substr(0, 12) }}...</span></a>
		</td>
		<td class="d-none d-md-table-cell"><a target="_blank" :href="`https://solscan.io/block/${txn.slot}`">#{{ txn.slot }}</a></td>
		<td class="d-none d-lg-table-cell">{{ humanTime }}</td>
		<td v-if="txn.err" colspan="2"></td>
		<td v-if="!txn.err" class="text-center text-lg-start">
			<img height="24px" v-if="isNFT" :src="nftInfo.data.image">
			<SHDW v-if="!isNFT" :mint-addr="tokenChange.mint" class="small"></SHDW>
			<a target="_blank" :href="`https://solscan.io/account/${tokenChange.mint}`" class="d-none d-md-inline-block ms-1">{{ tokenName }}</a>
		</td>
		<td class="d-none d-lg-table-cell text-end">{{ gasFee }}
			<SHDW v-show="gasFee !== '-'" class="small" mint-addr="So11111111111111111111111111111111111111112"></SHDW>
		</td>
		<td class="text-end" :class="colorStyle">{{ amountSign }}{{ txnBalanceChange }}</td>
		<td v-if="!txn.err" class="text-end">
			{{ this.prices[tokenChange.mint] ? numFormatter.format((balanceChange.diff * this.prices[tokenChange.mint].value)) : 0 }}
			<SHDW mint-addr="EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v" class="small d-none d-md-inline-block"></SHDW>
		</td>
	</tr>
</template>

<script>
import SHDW from "../tokens/SHDW";
import moment from "moment";
import {LAMPORTS_PER_SOL} from "@solana/web3.js";
import {TransactionManager} from "../../util/transaction_manager";
import axios from "axios";

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
		},
		mgr: {
			type: TransactionManager,
		},
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
			nftInfo: false,
			tokenChange: '',
			inputAmount: 0,
			outputAmount: 0,

			inputToken: {uiTokenAmount: {amount: 0, uiAmount: 0, uiAmountString: '0'}},
			outputToken: {uiTokenAmount: {amount: 0, uiAmount: 0, uiAmountString: '0'}}
		}
	},
	computed: {
		isNFT: function () {
			return this.nftInfo ? true : false;
		},

		tokenName: function () {
			if (this.tokenInfo[this.tokenChange.mint])
				return this.tokenInfo[this.tokenChange.mint].name

			if (this.nftInfo) {
				if (this.nftInfo.data.name !== '') {
					return this.nftInfo.data.name
				}
				if (this.nftInfo.data.symbol !== '') {
					return this.nftInfo.data.symbol
				}
			}

			// return this.tokenInfo[this.tokenChange.mint] ?
			// 		this.tokenInfo[this.tokenChange.mint].name : this.balanceChange.diff === 1 ? this.tokenChange.mint.substr(0, 16) : `Unknown Token`


			return `Unknown Token`
		},

		txnBalanceChange: function () {
			if (!this.balanceChange.diff)
				return 'None';

			if (Math.abs(this.balanceChange.diff) === 1)
				return this.balanceChange.diff;

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
	methods: {
		nftData: function (meta) {
			try {
				axios.get(meta.data.uri.replaceAll('\u0000', ''), {
					maxRedirects: 3,
				}).then((r) => {
					console.log("nftData", r.data);
					if (meta.data.name === "")
						meta.data.name = r.data.name;

					meta.data.image = r.data.image;
				}).finally(() => {
					this.nftInfo = meta;
				});
			} catch (e) {
				console.log(e);
			}
		}
	},
	mounted() {
		this.tokenChange = this.txn

		//NFT
		if (Math.abs(this.txn.diff) === 1) {
			console.log("NFT Detected!", this.txn)
			this.balanceChange.diff = this.txn.diff;

			if (this.mgr) {
				this.mgr.getAccountInfo(this.txn.mint).then(meta => {
					console.log("meta", meta);
					meta.data.name = meta.data.name.replaceAll('\u0000', '')
					meta.data.symbol = meta.data.symbol.replaceAll('\u0000', '')
					meta.data.uri = meta.data.uri.replaceAll('\u0000', '')
					this.nftData(meta);
				});
			}

			return
		}

		this.balanceChange = {
			diff: this.txn.diff / Math.pow(10, this.tokenInfo[this.txn.mint] ? this.tokenInfo[this.txn.mint].decimals : 9),
		}
	}
}
</script>

<style scoped>

a {
	text-decoration: none;
}
</style>