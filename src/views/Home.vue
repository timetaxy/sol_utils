<template>
	<div>
		<div class="row">

			<div class="col-6 offset-3 mt25">
				<form @submit="searchAddress">
					<input v-model="form.search" class="form-control" type="text" placeholder="Address">

					<div class="row">
						<button type="submit" class="btn btn-outline-light btn-lg mt-3">SEARCH</button>
					</div>
				</form>

			</div>

		</div>
	</div>
</template>

<script>
export default {
	name: "Home",
	data() {
		return {
			form: {
				search: '',
			}
		}
	},
	methods: {
		searchAddress: function (e) {
			e.preventDefault()

			this.$router.push(`/account/${this.form.search}`)


		}
	}
}
</script>

<style scoped>
.mt25 {
	margin-top: 20%;
}
</style>