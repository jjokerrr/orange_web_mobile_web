export default class FlowVariableDisplayController {
  static list (sender, params, axiosOption, httpOption) {
    return sender.doUrl('/admin/flow/flowVariableDisplay/list', 'post', params, axiosOption, httpOption);
  }

  static listByEntry (sender, params, axiosOption, httpOption) {
    return sender.doUrl('/admin/flow/flowVariableDisplay/listByEntry', 'post', params, axiosOption, httpOption);
  }
  
  static add (sender, params, axiosOption, httpOption) {
    return sender.doUrl('/admin/flow/flowVariableDisplay/add', 'post', params, axiosOption, httpOption);
  }
  
  static update (sender, params, axiosOption, httpOption) {
    return sender.doUrl('/admin/flow/flowVariableDisplay/update', 'post', params, axiosOption, httpOption);
  }
  
  static deleteByEntry (sender, params, axiosOption, httpOption) {
    return sender.doUrl('/admin/flow/flowVariableDisplay/deleteByEntry', 'post', params, axiosOption, httpOption);
  }
  
  static view (sender, params, axiosOption, httpOption) {
    return sender.doUrl('/admin/flow/flowVariableDisplay/view', 'get', params, axiosOption, httpOption);
  }
}
