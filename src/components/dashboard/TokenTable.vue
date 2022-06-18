<template>
	<table class="table table-hover table-sm">
		<thead>
		<tr>
			<td>Symbol</td>
			<td class="d-none d-lg-table-cell">Account</td>
			<td>Balance</td>
			<td class="d-none d-md-table-cell">Current Price</td>
			<td>Value</td>
		</tr>
		</thead>
		<tbody>
		<tr v-for="(token,key) in filteredTokens" :key="key">
			<td>
				<img style="height: 1rem" v-if="tokenInfo[token.mint]" class="token-logo"
						:src="tokenInfo[token.mint].logoURI" alt="">

				{{ tokenInfo[token.mint] ? tokenInfo[token.mint].name : 'Unknown Token' }}
			</td>
			<td class="d-none d-lg-table-cell"><a target="_blank"
					:href="`https://solscan.io/account/${token.mint}`" class="small">{{ token.mint }}</a></td>
			<td>{{ token.amount.uiAmountString }}</td>
			<td class="d-none d-md-table-cell">{{ prices[token.mint] ? numFormatter.format(prices[token.mint].value) : 0.0000 }}</td>
			<td>{{ prices[token.mint] ? numFormatter.format((prices[token.mint].value * token.amount.uiAmount)) : 0.00 }}</td>
		</tr>
		</tbody>
	</table>
</template>

<script>
import {UserTokens} from "../../util/user_tokens";
import {LAMPORTS_PER_SOL} from "@solana/web3.js";

export default {
	name: "TokenTable",
	components: {
		//
	},
	props: {
		hideDust: {
			type: Boolean,
			default: false,
		},
		hideEmpty: {
			type: Boolean,
			default: false,
		},
		tokenInfo: {
			type: Object,
			required: true,
		},
		ua: {
			type: UserTokens,
			required: true,
		},
		prices: {
			type: Object,
			required: true,
		}
	},
	data() {
		return {
			numFormatter: new Intl.NumberFormat('en-US', {
				style: 'currency',
				currency: 'USD',
			}),
			tokens: [],
		}
	},
	computed: {
		filteredTokens: function () {
			return this.tokens.filter(token => {
				if (this.hideDust && token.amount.amount < (Math.pow(10, token.amount.decimals)))
					return false;

				if (token.amount.amount > 0)
					return true


				return !this.hideEmpty;
			}).sort((a, b) => b.amount.amount -
					a.amount.amount);
		}
	},
	beforeMount() {
	},
	mounted() {
		this.ua.getParsedTokenAccountsByOwner(this.$route.params.id).then(r => {
			this.tokens = r;
			console.log(this.tokens)

			this.ua.getBalance(this.$route.params.id).then(r => {
				console.log("Balance: ", r)

				this.tokens.push({
					mint: this.$route.params.id,
					amount: {
						amount: r,
						uiAmountString: `${r / LAMPORTS_PER_SOL}`,
						uiAmount: r / LAMPORTS_PER_SOL,
					},
				})

			});
		})
	}
}
</script>

<style scoped>

</style>