import * as staticDict from '@/staticDict'

export default class DictionaryController {
  static dictSysRole (sender, params, axiosOption, httpOption) {
    return new Promise((resolve, reject) => {
      sender.doUrl('admin/upms/sysRole/listDict', 'get', params, axiosOption, httpOption).then(res => {
        let dictData = new staticDict.DictionaryBase('角色字典');
        dictData.setList(res.data);
        resolve(dictData);
      }).catch(err => {
        reject(err);
      });
    });
  }
  // 全局编码字典
  static dictGlobalDict (sender, params, axiosOption, httpOption) {
    return new Promise((resolve, reject) => {
      sender.doUrl('admin/upms/globalDict/listDict', 'get', params, axiosOption, httpOption).then(res => {
        let dictData = new staticDict.DictionaryBase('编码字典');
        dictData.setList((res.data || []).map(item => {
          return {
            ...item,
            // 设置已禁用编码字典数据项
            disabled: item.status === 1
          }
        }));
        resolve(dictData);
      }).catch(err => {
        reject(err);
      });
    });
  }

  static dictGlobalDictByIds (sender, params, axiosOption, httpOption) {
    return new Promise((resolve, reject) => {
      sender.doUrl('admin/upms/globalDict/listDictByIds', 'post', params, axiosOption, httpOption).then(res => {
        let dictData = new staticDict.DictionaryBase('编码字典');
        dictData.setList(res.data);
        resolve(dictData);
      }).catch(err => {
        reject(err);
      });
    });
  }

  static dictSysUserStatus () {
    return new Promise((resolve) => {
      resolve(staticDict.SysUserStatus);
    });
  }
  static dictSysUserType () {
    return new Promise((resolve) => {
      resolve(staticDict.SysUserType);
    });
  }
  static dictSysDept (sender, params, axiosOption, httpOption) {
    return new Promise((resolve, reject) => {
      sender.doUrl('/admin/upms/sysDept/listDict', 'get', params, axiosOption, httpOption).then(res => {
        let dictData = new staticDict.DictionaryBase('部门字典');
        dictData.setList(res.data);
        resolve(dictData);
      }).catch(err => {
        reject(err);
      });
    });
  }
  static dictSysMenu (sender, params, axiosOption, httpOption) {
    return new Promise((resolve, reject) => {
      sender.doUrl('admin/upms/sysMenu/listMenuDict', 'get', params, axiosOption, httpOption).then(res => {
        let dictData = new staticDict.DictionaryBase('菜单字典');
        dictData.setList(res.data);
        resolve(dictData);
      }).catch(err => {
        reject(err);
      });
    });
  }
}
