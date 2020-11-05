import { Type } from '@angular/core';

export class DbItem {
  constructor(public id: string, public lName: string, public sName: string, public tplName: string, public component: Type<any>, public widgetConf: any) { }
}
