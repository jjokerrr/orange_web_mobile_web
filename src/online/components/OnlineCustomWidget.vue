<template>
  <component :ref="widget.variableName" :is="getComponent" v-bind="getWidgetProps" :style="getWidgetStyle"
    :disabled="getDisabledStatus()" :value="bindValue" @input="onValueInput" @change="onValueChange"
    @widgetClick="onWidgetClick" :class="{ 'number-center': SysCustomWidgetType.NumberInput === widget.widgetType }">
    <template v-if="widget.widgetType === SysCustomWidgetType.Radio">
      <el-radio v-for="item in getAllDropdownData" :key="item.id" :label="item.id">{{ item.name }}</el-radio>
    </template>
    <template v-else-if="widget.widgetType === SysCustomWidgetType.CheckBox">
      <el-checkbox v-for="item in getAllDropdownData" :key="item.id" :label="item.id">
        {{ item.name }}
      </el-checkbox>
    </template>
    <template v-else-if="widget.widgetType === SysCustomWidgetType.Select">
      <el-option v-for="item in getAllDropdownData" :key="item.id" :label="item.name" :value="item.id" />
    </template>
    <template v-if="widget.widgetType === SysCustomWidgetType.Link">
      <span>{{ widget.props.showText || widget.showName }}</span>
    </template>
  </component>
</template>

<script>
import { findItemFromList, findTreeNode, treeDataTranslate, findTreeNodePath } from '@/utils';
import OnlineCustomLabel from './OnlineCustomLabel.vue';
import OnlineCustomUpload from './OnlineCustomUpload.vue';
import OnlineCustomTree from './OnlineCustomTree.vue';
import OnlineCustomChart from './OnlineCustomChart.vue';
import OnlineCustomDataSelect from './OnlineCustomDataSelect/index.vue';
import OnlineCustomText from './OnlineCustomText.vue';
import OnlineCustomImage from './OnlineCustomImage.vue';

export default {
  name: 'OnlineCustomWidget',
  props: {
    value: {
      type: [String, Boolean, Date, Number, Object, Array]
    },
    widget: {
      type: Object,
      required: true
    }
  },
  components: {
    'online-custom-label': OnlineCustomLabel,
    'online-custom-upload': OnlineCustomUpload,
    'online-custom-tree': OnlineCustomTree,
    'online-custom-chart': OnlineCustomChart,
    'online-custom-dataselect': OnlineCustomDataSelect,
    'online-custom-text': OnlineCustomText,
    'online-custom-image': OnlineCustomImage
  },
  inject: ['form'],
  data () {
    return {
      valueData: [],
      dictDataList: []
    }
  },
  methods: {
    getHtml () {
      if (this.widget.widgetType === this.SysCustomWidgetType.RichEditor) {
        return this.$refs[this.widget.variableName] ? this.$refs[this.widget.variableName].getHtml() : undefined;
      }
    },
    reset () {
      this.onValueInput(undefined);
      this.onValueChange(undefined);
      this.$nextTick(() => {
        this.loadDropdownData();
      });
    },
    refresh () {
      if (this.$refs[this.widget.variableName]) this.$refs[this.widget.variableName].refresh();
    },
    loadDropdownData () {
      if (this.widget == null || !this.isDictWidget) {
        return;
      }
      this.dictDataList = [];
      let dictInfo = (this.widget.props.dictInfo || {}).dict;
      if (dictInfo && this.form().getDictDataList) {
        let dictCall;
        if (this.form().pageCode != null) {
          // 报表字典
          dictCall = this.form().getDictDataList(dictInfo, this.form().getDropdownParams(this.widget));
        } else {
          // 在线表单字典
          dictCall = this.form().getDictDataList(this, dictInfo, this.form().getDropdownParams(this.widget));
        }
        dictCall.then(res => {
          res.forEach(item => {
            item.id = item.id + '';
            if (item.parentId) item.parentId = item.parentId + '';
          });
          // 级联组件将列表转换成树
          if (this.widget.widgetType === this.SysCustomWidgetType.Cascader) {
            res = treeDataTranslate(res, 'id', 'parentId');
          }
          if (this.widget.eventInfo && this.widget.eventInfo[this.OnlineFormEventType.DROPDOWN_CHANGE]) {
            res = this.widget.eventInfo[this.OnlineFormEventType.DROPDOWN_CHANGE](res);
          }
          this.dictDataList = res;
        }).catch(e => {
          console.log(e);
        });
      }
    },
    parseValue (val) {
      if (this.widget.widgetType === this.SysCustomWidgetType.Cascader) {
        if (this.multiSelect) {
          return val.map(item => {
            return item[item.length - 1];
          }).filter(item => item != null);
        } else {
          return Array.isArray(val) ? val[val.length - 1] : undefined;
        }
      } else {
        return val;
      }
    },
    onValueInput (val) {
      let tempValue = this.parseValue(val);
      // console.log(tempValue)
      if (this.multiSelect && Array.isArray(tempValue) && tempValue.length > 0) {
        tempValue = tempValue.join(',') + ',';
      }
      this.$emit('input', tempValue);
    },
    onValueChange (val, selectRow) {
      let tempVal = this.parseValue(val);
      // console.log(tempVal)
      let dictData = null;
      if (this.multiSelect) {
        dictData = val.map(item => {
          if (this.widget.widgetType === this.SysCustomWidgetType.Cascader) {
            if (Array.isArray(item)) {
              item = item[item.length - 1];
            }
            return findTreeNode(this.dictDataList, item, 'id', 'children');
          } else {
            return findItemFromList(this.dictDataList, item, 'id');
          }
        }).filter(item => item != null);
      } else {
        if (this.widget.widgetType === this.SysCustomWidgetType.Cascader) {
          if (Array.isArray(val)) {
            val = val[val.length - 1];
          }
          dictData = findTreeNode(this.dictDataList, val, 'id', 'children')
        } else {
          dictData = findItemFromList(this.dictDataList, val, 'id');
        }
      }
      this.$emit('change', tempVal, {
        dictData: dictData,
        selectRow: selectRow
      });
    },
    getDisabledStatus () {
      if (this.widget.eventInfo && this.widget.eventInfo[this.OnlineFormEventType.DISABLE]) {
        return this.widget.eventInfo[this.OnlineFormEventType.DISABLE]();
      } else {
        return this.widget.props.disabled;
      }
    },
    onWidgetClick (widget) {
      this.$emit('widgetClick', widget);
    }
  },
  computed: {
    getAllDropdownData () {
      if (this.widget.props.supportAll) {
        return [
          {
            id: '',
            name: '全部'
          },
          ...this.dictDataList
        ]
      } else {
        return this.dictDataList;
      }
    },
    isDictWidget () {
      return [
        this.SysCustomWidgetType.Select,
        this.SysCustomWidgetType.CheckBox,
        this.SysCustomWidgetType.Radio,
        this.SysCustomWidgetType.Cascader,
        this.SysCustomWidgetType.Tree
      ].indexOf(this.widget.widgetType) !== -1;
    },
    bindValue () {
      let tempValue = this.value ? this.value : this.getWidgetProps.value;
      // console.log('tempValue' + tempValue);
      if (this.isDictWidget) tempValue = tempValue == null ? '' : (tempValue + '');
      if (this.multiSelect && this.value && typeof tempValue === 'string') {
        tempValue = tempValue.split(',');
        if (Array.isArray(tempValue)) {
          tempValue = tempValue.filter(item => {
            return item != null && item !== '';
          });
        }
      }
      if (this.widget.widgetType === this.SysCustomWidgetType.CheckBox) {
        return tempValue || [];
      } else if (this.widget.widgetType === this.SysCustomWidgetType.Cascader) {
        if (this.multiSelect) {
          // 多选
          if (Array.isArray(tempValue)) {
            return tempValue.map(item => {
              let temp = findTreeNodePath(this.dictDataList, item);
              if (Array.isArray(temp) && temp.length > 0) return temp;
            }).filter(item => item != null);
          } else {
            let temp = findTreeNodePath(this.dictDataList, tempValue);
            return temp || [];
          }
        } else {
          // 单选
          let temp = findTreeNodePath(this.dictDataList, tempValue);
          return temp.length > 0 ? temp : tempValue;
        }
      } else {
        return tempValue;
      }
    },
    multiSelect () {
      if ([this.SysCustomWidgetType.Select, this.SysCustomWidgetType.CheckBox, this.SysCustomWidgetType.Cascader, this.SysCustomWidgetType.Tree].indexOf(this.widget.widgetType) === -1) {
        return false;
      }
      if (this.form().formType === this.SysOnlineFormType.QUERY || this.form().formType === this.SysOnlineFormType.ADVANCE_QUERY) {
        return this.widget.column && this.widget.column.filterType === this.SysOnlineColumnFilterType.MULTI_SELECT_FILTER;
      } else if (this.form().formType === this.SysOnlineFormType.REPORT) {
        return this.SysCustomWidgetType.CheckBox === this.widget.widgetType;
      } else {
        return this.widget.column && this.widget.column.fieldKind === this.SysOnlineFieldKind.MULTI_SELECT;
      }
    },
    getLinkHerf () {
      let temp = this.widget.widgetType === this.SysCustomWidgetType.Link ? this.widget.props.href : undefined;
      if (!this.form().isEdit && this.widget.eventInfo && typeof this.widget.eventInfo[this.OnlineFormEventType.LINK_HERF] === 'function') {
        temp = this.widget.eventInfo[this.OnlineFormEventType.LINK_HERF](this.widget.props.href);
      }
      return temp;
    },
    getWidgetProps () {
      let props = {
        ...this.widget.props || {}
      };
      // 日期组件，根据类型设置format
      if (this.widget.widgetType === this.SysCustomWidgetType.Date || this.widget.widgetType === this.SysCustomWidgetType.DateRange) {
        props['value-format'] = 'yyyy-MM-dd HH:mm:ss';
      }
      return {
        ...props,
        clearable: true,
        filterable: true,
        readOnly: this.widget.widgetType === this.SysCustomWidgetType.Upload ? (this.form().readOnly || props.readOnly) : undefined,
        options: this.widget.widgetType === this.SysCustomWidgetType.Cascader ? this.dictDataList : undefined,
        props: this.widget.widgetType === this.SysCustomWidgetType.Cascader ? { label: 'name', value: 'id', multiple: this.multiSelect, checkStrictly: true } : undefined,
        'picker-options': this.widget.widgetType === this.SysCustomWidgetType.Date ? { disabledDate: (this.widget.eventInfo || {})[this.OnlineFormEventType.DISABLED_DATE] } : undefined,
        operationList: this.widget.operationList,
        multiple: this.multiSelect,
        'collapse-tags': this.multiSelect,
        dataList: this.widget.widgetType === this.SysCustomWidgetType.Tree ? this.dictDataList : undefined,
        href: this.getLinkHerf,
        widget: this.widget
      };
    },
    getComponent () {
      if (
        [
          this.SysCustomWidgetType.Text,
          this.SysCustomWidgetType.Image,
          this.SysCustomWidgetType.Upload,
          this.SysCustomWidgetType.Link
        ].indexOf(this.widget.widgetType) === -1 &&
        this.form().readOnly) {
        return 'online-custom-label';
      }
      switch (this.widget.widgetType) {
        case this.SysCustomWidgetType.Label: return 'online-custom-label';
        case this.SysCustomWidgetType.Input: return 'el-input';
        case this.SysCustomWidgetType.NumberInput: return 'el-input-number';
        case this.SysCustomWidgetType.NumberRange: return 'input-number-range';
        case this.SysCustomWidgetType.Switch: return 'el-switch';
        case this.SysCustomWidgetType.Radio: return 'el-radio-group';
        case this.SysCustomWidgetType.CheckBox: return 'el-checkbox-group';
        case this.SysCustomWidgetType.Select: return 'el-select';
        case this.SysCustomWidgetType.Cascader: return 'el-cascader';
        case this.SysCustomWidgetType.Date: return 'el-date-picker';
        case this.SysCustomWidgetType.DateRange: return 'el-date-picker';
        case this.SysCustomWidgetType.Upload: return 'online-custom-upload';
        case this.SysCustomWidgetType.RichEditor: return 'rich-editor';
        case this.SysCustomWidgetType.Link: return 'el-link';
        case this.SysCustomWidgetType.UserSelect: return 'user-select';
        case this.SysCustomWidgetType.DeptSelect: return 'dept-select';
        case this.SysCustomWidgetType.DataSelect: return 'online-custom-dataselect';
        case this.SysCustomWidgetType.Tree: return 'online-custom-tree';
        case this.SysCustomWidgetType.AddressLocator: return 'address-locator';
        case this.SysCustomWidgetType.CitySelect: return 'city-select';
        case this.SysCustomWidgetType.PhoneNumber: return 'phone-number';
        case this.SysCustomWidgetType.EmailNumber: return 'email-number';
        case this.SysCustomWidgetType.LineChart:
        case this.SysCustomWidgetType.PieChart:
        case this.SysCustomWidgetType.BarChart:
        case this.SysCustomWidgetType.ScatterChart:
        case this.SysCustomWidgetType.PivotTable:
        case this.SysCustomWidgetType.DataViewTable:
        case this.SysCustomWidgetType.Carousel:
        case this.SysCustomWidgetType.RichText:
        case this.SysCustomWidgetType.GaugeChart:
        case this.SysCustomWidgetType.FunnelChart:
        case this.SysCustomWidgetType.RadarChart:
        case this.SysCustomWidgetType.ProgressBar:
        case this.SysCustomWidgetType.ProgressCircle:
        case this.SysCustomWidgetType.DataCard:
        case this.SysCustomWidgetType.DataProgressCard:
        case this.SysCustomWidgetType.CommonList:
          return 'online-custom-chart';
        case this.SysCustomWidgetType.Text:
          return 'online-custom-text';
        case this.SysCustomWidgetType.Image:
          return 'online-custom-image';
        default: return 'div';
      }
    },
    getWidgetStyle () {
      return {
        width: this.widget.widgetType !== this.SysCustomWidgetType.Link ? '100%' : undefined
      }
    }
  },
  mounted () {
    this.widget.widgetImpl = this;
    if (this.value === undefined) {
      this.$emit('input', this.getWidgetProps.value);
    }
  },
  watch: {
    'widget.props.dictInfo': {
      handler () {
        if (this.widget) this.loadDropdownData();
      },
      immediate: true,
      deep: true
    }
  }
}
</script>

<style></style>
