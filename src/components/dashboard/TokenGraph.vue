<template>
	<div class="token-graph">
		<div v-if="!summary.loading && hasEnoughData">
			<v-chart class="chart" :option="graphOptions"/>
		</div>

		<div v-if="!hasEnoughData" class="text-center">
			<i class="grey small">Not enough data</i>
		</div>

	</div>
</template>

<script>
import {use} from "echarts/core";
import {CanvasRenderer} from "echarts/renderers";
import {LineChart} from "echarts/charts";
import {DataZoomComponent, GridComponent, TitleComponent, TooltipComponent} from "echarts/components";
import VChart from "vue-echarts";


use([
	GridComponent,
	CanvasRenderer,
	LineChart,
	TitleComponent,
	TooltipComponent,
	DataZoomComponent
]);

export default {
	name: "TokenGraph",
	components: {VChart},
	props: {
		summary: {
			type: Object,
			required: true,
		},
		activeToken: {
			type: String,
			default: function () {
				return "11111111111111111111111111111111" //Sol Native
			}
		},
		tokenInfo: {
			type: Object,
			required: true,
		},
	},
	computed: {
		hasEnoughData() {
			if (!this.solData.data)
				return false;

			return this.solData.data.length > 2;
		},

		decimals() {
			if (!this.tokenInfo[this.activeToken])
				return 6;
			return this.tokenInfo[this.activeToken].decimals;
		},

		solData() {
			const solAmountArr = [];
			const gasAmountArr = [];
			const labelArr = [];
			const st = this.summary.tokens[this.activeToken];
			if (!st)
				return solAmountArr;


			let largestGainAmount = 0;
			let largestGainIdx = 0;
			let largestLossAmount = 0;
			let largestLossIdx = 0;

			let lastAmount = 0;
			let lastGas = 0;
			const sorted = st.trade_summary.sort((a, b) => {
				return a.slot - b.slot;
			});

			//If we start off negative this should be flipped as it indicates an in initial swap to create the account
			// let isFlipped = false;
			// if (sorted[0].diff < 0) {
				// solAmountArr.push(Math.abs(sorted[0].diff));
				// gasAmountArr.push(lastGas + sorted[0].gas);
				// labelArr.push(new Date(sorted[0].block_time * 1000).toLocaleString());
				// isFlipped = true;
			// }

			for (let i = 0; i < sorted.length; i++) {
				let humanDiff = sorted[i].diff;
				humanDiff /= Math.pow(10, this.decimals)
				solAmountArr.push(lastAmount + humanDiff);
				gasAmountArr.push(lastGas + sorted[i].gas);

				labelArr.push(new Date(sorted[i].block_time * 1000).toLocaleString());
				// labelArr.push(sorted[i].slot);
				lastAmount += humanDiff;
				lastGas += sorted[i].gas;

				if (humanDiff > largestGainAmount) {
					largestGainAmount = humanDiff;
					largestGainIdx = i;
				}

				if (humanDiff < largestLossAmount) {
					largestLossAmount = humanDiff;
					largestLossIdx = i;
				}
			}

			return {
				biggestGain: sorted[largestGainIdx],
				biggestLoss: sorted[largestLossIdx],
				labels: labelArr,
				data: solAmountArr,
				gasData: gasAmountArr,
			};
		},

		graphOptions() {
			const solData = this.solData;
			const offset = 0;
			const limit = solData.data.length
			console.log("solData", solData)

			return {
				id: "Block",
				grid: {
					show: false,
				},
				xAxis: {
					type: 'category',
					data: solData.labels.slice(offset, offset + limit),
					boundaryGap: false,
					splitLine: {
						show: false
					},
				},
				yAxis: {
					type: 'value',
					splitLine: {
						show: false
					},
					axisLine: { onZero: false },
					min: 'dataMin',
					max: 'dataMax',
				},
				dataZoom: [
					{
						xAxisIndex: 0,
					}
				],
				tooltip: {
					trigger: "axis",
					axisPointer: {
						type: 'cross',
						label: {
							backgroundColor: '#6a7985'
						},
					},
					formatter: (p) => {
						return `<strong>${p[0].name}</strong><br> <strong>Amount:</strong> ${p[0].value.toFixed(this.decimals)} ${this.tokenInfo[this.activeToken] ?
								this.tokenInfo[this.activeToken].symbol : ''}`;
					},
					color: "#fff",
					extraCssText: `background-color: rgba(0,0,0,0.6);color:#ffffff`,
				},
				series: [
					// {
					// 	name: "Gas Fees",
					// 	type: "line",
					// 	smooth: false,
					// 	data: solData.gasData.slice(offset, offset + limit),
					// 	areaStyle: {
					// 		opacity: 0.8,
					// 		color: '#46CE7C'
					// 	},
					// },
					{
						name: this.activeToken,
						type: "line",
						smooth: false,
						lineStyle: {
							// width: 0
							color: '#fff'
						},
						itemStyle: {
							color: '#fff'
						},
						data: solData.data.slice(offset, offset + limit),
						areaStyle: {
							opacity: 0.8,
							color: '#46CE7C'
						},
					},
				]
			}
		}
	}
}
</script>

<style scoped>
.chart {
	height: 300px;
}
</style>