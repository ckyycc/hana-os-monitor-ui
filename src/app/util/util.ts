import {Employee, SUPPORT_LANGUAGE} from "./consts-classes";

export class Util {
  public static getCurrentUser(): Employee {
    if (sessionStorage.getItem('currentUser')) {
      return JSON.parse(sessionStorage.getItem('currentUser'));
    } else {
      return null;
    }
  }
  public static setCurrentUser(data) {
    sessionStorage.setItem('currentUser', JSON.stringify(data));
  }

  public static checkUserValidity(data): boolean {
    return (data && data.employeeId && data.employeeId.trim() && data.employeeName && data.employeeName.trim());
  }

  public static isCurrentUserSuperAdmin(user) : boolean {
    return (user && Util.upper(user.isSuperAdmin) === 'X');
  }
  public static isCurrentUserAdmin(user) : boolean {
    return (Util.isCurrentUserSuperAdmin(user) || (user && Util.upper(user.isAdmin) === 'X'));
  }
  public static upper(str) : string {
    return str == null? null : str.toUpperCase();
  }
  public static lower(str) : string {
    return str == null? null : str.toLowerCase();
  }
  public static isEmpty(str) : boolean {
    return str == null || str.length == 0;
  }

  public static checkAuth(user): boolean {
    return (user != null && !Util.isEmpty(user.employeeId));
  }
  public static checkAuthAdmin(user): boolean {
    return (user != null && !Util.isEmpty(user.employeeId) &&
      (Util.upper(user.isAdmin) == 'X' || Util.upper(user.isSuperAdmin) == 'X'));
  }

  public static getMsgParameters(messageParameters): {} {
    let parameters = {};
    if (messageParameters == null) {
      return null;
    }
    if (Array.isArray(messageParameters)) {
      for (let i = 0; i < messageParameters.length; i++) {
        parameters[`value${i + 1}`] = messageParameters[i];
      }
      return parameters;
    } else {
      parameters["value"] = messageParameters;
      return parameters;
    }
  }

  public static getTranslatedText(translator, key, parameters=null) {
    return translator.instant(key, Util.getMsgParameters(parameters));
  }

  public static configTranslate(translate, selectedLang=null) : void {
    // this language will be used as a fallback when a translation isn't found in the current language
    translate.setDefaultLang('en');
    if (!(translate.getLangs() && translate.getLangs().length > 0)) {
      translate.addLangs(SUPPORT_LANGUAGE.map(lang => lang.value));
    }

    if (selectedLang) {
      Util._setSelectedLanguage(selectedLang);
      translate.use(selectedLang);
    } else {
      const currentLang = Util.getCurrentLanguage(translate);
      translate.use(currentLang ? currentLang : 'en');
    }
  }

  public static getCurrentLanguage(translate) : string {

      let savedSelectedLang = Util._getSelectedLanguage();
      if (!savedSelectedLang) {
        //no saved language, get language setting from browser
        savedSelectedLang = Util._getDefaultDisplayLang(translate.getBrowserLang(), translate.getBrowserCultureLang());
      }
      return savedSelectedLang;

  }

  private static _setSelectedLanguage(selectedLang): void {
    localStorage.setItem('selectedLang', selectedLang);
  }
  private static _getSelectedLanguage(): string {
    return localStorage.getItem('selectedLang');
  }


  private static _getDefaultDisplayLang(language, cultureLanguage) : string {
    if (SUPPORT_LANGUAGE.includes(cultureLanguage)) {
      // if we can find the culture language (eg: zh-CN), return it directly
      return cultureLanguage;
    } else {
      // if we can't find the culture language (eg: zh-Hans-CN, en-US), just use language part (eg: en, zh)
      // return the first match
      return SUPPORT_LANGUAGE.find(lang => lang.value.includes(language)).value
    }
  }

  public static hideArrowFromSelect(parentClass) {
    let item = (document.getElementsByClassName(parentClass) as HTMLCollectionOf<HTMLElement>)[0];
    if (item) {
      let arrowItem = (item.getElementsByClassName("mat-select-arrow") as HTMLCollectionOf<HTMLElement>)[0];
      if (arrowItem) {
        arrowItem.style.borderLeft = '0px';
        arrowItem.style.borderRight = '0px';
        arrowItem.style.borderTop = '0px';
      }
    }
  }

}

