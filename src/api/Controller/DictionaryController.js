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
  static dictAreaCode (sender, params, axiosOption, httpOption) {
    return new Promise((resolve, reject) => {
      sender.doUrl('/admin/app/areaCode/listDict', 'get', params, axiosOption, httpOption).then(res => {
        let dictData = new staticDict.DictionaryBase('地址');
        dictData.setList(res.data);
        resolve(dictData);
      }).catch(err => {
        reject(err);
      });
    });
  }
  static dictAreaCodeByParentId (sender, params, axiosOption, httpOption) {
    return new Promise((resolve, reject) => {
      sender.doUrl('/admin/app/areaCode/listDictByParentId', 'get', params, axiosOption, httpOption).then(res => {
        let dictData = new staticDict.DictionaryBase('地址');
        dictData.setList(res.data);
        resolve(dictData);
      }).catch(err => {
        reject(err);
      });
    });
  }
  static dictAddAreaCode (sender, params, axiosOption, httpOption) {
    return sender.doUrl('', 'post', params, axiosOption, httpOption);
  }
  static dictDeleteAreaCode (sender, params, axiosOption, httpOption) {
    return sender.doUrl('', 'post', params, axiosOption, httpOption);
  }
  static dictUpdateAreaCode (sender, params, axiosOption, httpOption) {
    return sender.doUrl('', 'post', params, axiosOption, httpOption);
  }
  static dictReloadAreaCodeCachedData (sender, params, axiosOption, httpOption) {
    return sender.doUrl('', 'get', params, axiosOption, httpOption);
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
