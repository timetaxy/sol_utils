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
	},
	computed: {
		hasEnoughData() {
			if (!this.solData.data)
				return false;

			return this.solData.data.length > 2;
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

			for (let i = 0; i < sorted.length; i++) {
				solAmountArr.push(lastAmount + sorted[i].diff);
				gasAmountArr.push(lastGas + sorted[i].gas);

				// labelArr.push(new Date(sorted[i].block_time * 1000).toLocaleDateString());
				labelArr.push(sorted[i].slot);
				lastAmount += sorted[i].diff;
				lastGas += sorted[i].gas;

				if (sorted[i].diff > largestGainAmount) {
					largestGainAmount = sorted[i].diff;
					largestGainIdx = i;
				}

				if (sorted[i].diff < largestLossAmount) {
					largestLossAmount = sorted[i].diff;
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
					extraCssText: `background-color: rgba(0,0,0,0.2);color:#fff`,
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