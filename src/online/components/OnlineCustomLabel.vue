<template>
  <div class="custom-label">
    <span v-if="isText">
      {{ showText }}
    </span>
    <div v-if="isHtml" v-html="showText" />
  </div>
</template>

<script>
export default {
  name: 'onlineCustomLabel',
  props: {
    value: {
      type: [Number, String, Boolean, Array]
    },
    widget: {
      type: Object,
      required: true
    }
  },
  inject: ['form'],
  methods: {},
  computed: {
    isText () {
      return (
        [
          this.SysCustomWidgetType.Label,
          this.SysCustomWidgetType.Input,
          this.SysCustomWidgetType.NumberInput,
          this.SysCustomWidgetType.NumberRange,
          this.SysCustomWidgetType.Slider,
          this.SysCustomWidgetType.Radio,
          this.SysCustomWidgetType.CheckBox,
          this.SysCustomWidgetType.Switch,
          this.SysCustomWidgetType.Select,
          this.SysCustomWidgetType.Cascader,
          this.SysCustomWidgetType.Date,
          this.SysCustomWidgetType.DateRange,
          this.SysCustomWidgetType.UserSelect,
          this.SysCustomWidgetType.DeptSelect,
          this.SysCustomWidgetType.DataSelect,
          this.SysCustomWidgetType.AddressLocator,
          this.SysCustomWidgetType.CitySelect,
          this.SysCustomWidgetType.PhoneNumber,
          this.SysCustomWidgetType.EmailNumber
        ].indexOf(this.widget.widgetType) !== -1
      );
    },
    isHtml () {
      return (
        this.widget.widgetType === this.SysCustomWidgetType.RichEditor &&
        this.widget.column &&
        this.widget.column.fieldKind === this.SysOnlineFieldKind.RICH_TEXT
      );
    },
    showText () {
      switch (this.widget.widgetType) {
        case this.SysCustomWidgetType.Label:
        case this.SysCustomWidgetType.Input:
        case this.SysCustomWidgetType.NumberInput:
        case this.SysCustomWidgetType.Slider:
        case this.SysCustomWidgetType.Date:
        case this.SysCustomWidgetType.RichEditor:
        case this.SysCustomWidgetType.Radio:
        case this.SysCustomWidgetType.CheckBox:
        case this.SysCustomWidgetType.Select:
        case this.SysCustomWidgetType.Cascader:
        case this.SysCustomWidgetType.UserSelect:
        case this.SysCustomWidgetType.DeptSelect:
        case this.SysCustomWidgetType.DataSelect:
        case this.SysCustomWidgetType.AddressLocator:
        case this.SysCustomWidgetType.CitySelect:
        case this.SysCustomWidgetType.PhoneNumber:
        case this.SysCustomWidgetType.EmailNumber:
          return this.value == null
            ? this.form().isEdit
              ? 'XXXXXXXXXX'
              : undefined
            : Array.isArray(this.value)
              ? this.value.join(',')
              : this.value;
        case this.SysCustomWidgetType.NumberRange:
        case this.SysCustomWidgetType.DateRange:
          return Array.isArray(this.value) && this.value.length > 1
            ? this.value[0] + ' 至 ' + this.value[1]
            : this.form().isEdit
              ? 'XXXXX 至 XXXXX'
              : undefined;
        case this.SysCustomWidgetType.Switch:
          return this.value ? '是' : '否';
        default:
          return '';
      }
    }
  },
  mounted () {
    this.widget.widgetImpl = this;
  }
};
</script>

<style></style>
