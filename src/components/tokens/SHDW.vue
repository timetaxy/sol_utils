<template>
	<img class="token-logo"
			:src="`https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/${addr}/logo.png`" alt="">
</template>

<script>
export default {
	name: "SHDW",
	props: {
		mintAddr: {
			type: String,
			default: () => {
				return "SHDWyBxihqiCj6YekG2GUr7wqKLeLAMK1gHZck9pL6y"
			}
		}
	},
	computed:{
		addr: function() {
			if (this.mintAddr === "11111111111111111111111111111111") {
				return "So11111111111111111111111111111111111111112"
			}

			return this.mintAddr
		}
	}
}
</script>

<style scoped>

</style>