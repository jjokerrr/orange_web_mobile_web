import '@/core/http';
import JSONbig from 'json-bigint';
import Dialog from '@/components/Dialog';
import Vue from 'vue';
import ElementUI from 'element-ui';
// import 'element-ui/lib/theme-chalk/index.css'
import '@/assets/style/index.scss';
import '@/core/mixins/global.js';
import App from './App';
import router from './router';
import store from './store';
import '@/staticDict/onlineStaticDict.js';
import TreeSelect from '@/components/TreeSelect';
import RichEditor from '@/components/RichEditor';
import InputNumberRange from '@/components/InputNumberRange';
import DateRange from '@/components/DateRange';
import FilterBox from '@/components/FilterBox';
import TableProgressColumn from '@/components/TableProgressColumn';
import UserSelect from '@/components/UserSelect';
import DeptSelect from '@/components/DeptSelect';
import TableBox from '@/components/TableBox';
import RightAddBtn from '@/components/Btns/RightAddBtn';
import VCharts from 'v-charts';
import VXETable from 'vxe-table';

import 'vxe-table/lib/style.css';
import '@/assets/online-icon/iconfont.css';
import Vant from 'vant';
import 'vant/lib/index.css';
import OnlineCustomBlock from '@/online/components/OnlineCustomBlock.vue';
import OnlineBaseCard from '@/online/components/OnlineBaseCard.vue';
import OnlineCustomTabs from '@/online/components/OnlineCustomTabs.vue';
import OnlineCustomTableContainer from '@/online/components/OnlineTableContainer/index.vue';
import AddressLocation from '@/components/AddressLocation/AddressLocation.vue';
import CitySelect from '@/components/CitySelect/CitySelect.vue';
import PhoneNumber from '@/components/phoneNumber/phoneNumber.vue';
import EmailNumber from '@/components/EmailNumber/EmailNumber.vue';
import axios from 'axios';

Vue.prototype.$axios = axios
Vue.component('OnlineCustomBlock', OnlineCustomBlock);
Vue.component('OnlineBaseCard', OnlineBaseCard);
Vue.component('OnlineCustomTabs', OnlineCustomTabs);
Vue.component('OnlineCustomTableContainer', OnlineCustomTableContainer);

Vue.use(Vant);
Vue.use(VXETable);
window.JSON = new JSONbig({storeAsString: true});
Vue.component('tree-select', TreeSelect);
Vue.component('rich-editor', RichEditor);
Vue.component('input-number-range', InputNumberRange);
Vue.component('date-range', DateRange);
Vue.component('filter-box', FilterBox);
Vue.component('table-progress-column', TableProgressColumn);
Vue.component('user-select', UserSelect);
Vue.component('dept-select', DeptSelect);
Vue.component('table-box', TableBox);
Vue.component('right-add-btn', RightAddBtn);
Vue.component('address-locator', AddressLocation);
Vue.component('city-select', CitySelect);
Vue.component('phone-number', PhoneNumber);
Vue.component('email-number', EmailNumber);

Vue.use(ElementUI);
Vue.use(VCharts);

Vue.config.productionTip = false;
Vue.prototype.$dialog = Dialog;
/* eslint-disable no-new */
const vm = new Vue({
  router,
  store,
  render: h => h(App)
});
vm.$mount('#app');
Vue.prototype.$vm = vm;
