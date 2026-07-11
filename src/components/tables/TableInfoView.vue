<template>
	<div v-if="data" class="table-view">
		<table v-if="dataIsNotEmpty" class="table ex-table-striped">
			<tbody>
				<tr v-for="(item, itemKey) in formattedData" :key="'tiv_r'+itemKey">
					<td class="table-titles table-titles-ver table-title-item table-cell">
						{{getKeyName(itemKey)}}
					</td>
					<td
						class="max-item-width table-cell table-value-cell break-all"
						:title="getKeyName(itemKey) + (typeof item !== 'string' ? '' : ': ' +  item)"
					>
						<ArrayField v-if="isArrayField(itemKey)" :itemKey="itemKey" :value="item" />
						<MosaicsField v-else-if="itemKey === 'mosaics'" :value="item" />
						<Decimal v-else-if="isDecimal(itemKey)" :value="item" />
						<TransactionType v-else-if="isTransactionType(itemKey)" :value="item" />
						<BlockHeightWithFinalizedStatusField v-else-if="isBlockHeightWithFinalizedStatus(itemKey)" :value="item" />
						<Boolean v-else-if="isBoolean(itemKey)" :value="item" style="transform: scale(0.7, 0.7);"/>
						<Age v-else-if="isAge(itemKey)" :date="item" />
						<DateField v-else-if="isDateField(itemKey)" :timestamp="item" />
						<MessageField v-else-if="itemKey === 'message'" :value="item" />
						<Harvester v-else-if="itemKey === 'harvester'" :value="item" />

						<router-link
							v-else-if="isKeyClickable(itemKey) && getItemHref(itemKey, item)"
							:to="getItemHref(itemKey, item)"
						>{{ translateValue(itemKey, item) }}</router-link>

						<div v-else>{{ translateValue(itemKey, item) }}</div>
					</td>
				</tr>
			</tbody>
		</table>
		<div v-else class="empty-data">{{emptyDataMessageFormatted}}</div>
	</div>
</template>

<script>
import TableView from './TableView.vue';
import MosaicsField from '@/components/fields/MosaicsField.vue';
import ArrayField from '@/components/fields/ArrayField.vue';
import TransactionType from '@/components/fields/TransactionType.vue';
import BlockHeightWithFinalizedStatusField from '@/components/fields/BlockHeightWithFinalizedStatusField.vue';
import MessageField from '@/components/fields/MessageField.vue';
import DateField from '@/components/fields/DateField.vue';
import Harvester from '@/components/fields/Harvester.vue';

export default {
	extends: TableView,

	components: {
		MosaicsField,
		ArrayField,
		TransactionType,
		BlockHeightWithFinalizedStatusField,
		MessageField,
		DateField,
		Harvester
	},

	props: {
		data: {
			type: Object,
			required: true
		}
	},

	created () {
		this.componentType = 'info';
	},

	mounted () {
		// this.$store.dispatch(this.view + "/fetchInfo", this.infoId);
	},

	computed: {
		formattedData () {
			let formattedData = {};

			for (let key in this.data) {
				if (this.isItemShown(key, this.data[key]))
					formattedData[key] = this.data[key];
			}

			return formattedData;
		},

		header () {
			let header = ['', ''];

			return header;
		},

		dataIsNotEmpty () {
			return Object.keys(this.data).length;
		}
	}
};
</script>

<style lang="scss" scoped>
.table-view {
    overflow: auto;

    .table-left-header {
        font-weight: bold;
    }
}
</style>

<style lang="scss">
// Ensure dark mode styles for table title items are applied
[data-theme="darkMode"] .table-title-item {
    background-color: #2d3748 !important;
    border-right: 1px solid #4a5568 !important;
    color: #e2e8f0 !important;
}

// Dark mode styles for table value cells
[data-theme="darkMode"] .table-value-cell {
    background-color: #374151 !important;
    color: #cbd5e0 !important;
    border-left: 1px solid #4a5568 !important;
}
</style>
