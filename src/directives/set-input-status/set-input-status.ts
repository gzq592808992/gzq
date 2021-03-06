import { Directive, Input, ElementRef, ViewContainerRef } from '@angular/core';
import { FirstLevelPage } from '../../app-framework/FirstLevelPage';
/**
 * Generated class for the SetInputStatusDirective directive.
 *
 * See https://angular.io/api/core/Directive for more info on Angular
 * Directives.
 */
@Directive({
  selector: '[set-input-status]' // Attribute selector
})
export class SetInputStatusDirective {
  @Input("set-input-status") form_key = "";

  @Input("watch-input-keys") watch_keys: string[] = [];

  page: FirstLevelPage;

  constructor(private elementRef: ElementRef, public view: ViewContainerRef) {
    this._addEvent("blur");
    this._addEvent("input");
    this._addEvent("focus");

    this.page = view["_view"].component as FirstLevelPage;
  }

  get ele() {
    return this.elementRef.nativeElement as HTMLElement;
  }
  
  private _addEvent(name) {
    this.ele.addEventListener(name, e => {
      this.form_key && this.page.setInputstatus(this.form_key, e);
    });
    if (name === "focus" && this.ele.getAttribute("type") === "password") {
      this.ele.addEventListener(name, e => {
        e.target.select && e.target.select();
        
      });
    }

    // 模拟ionic-input与ion-item之间的行为
    if (name === "focus") {
      const on_foucs = e => {
        const ionItemEle = this.findIonItemEle();
        if (ionItemEle) {
          ionItemEle.classList.add("input-has-focus");
        } else {
          this.ele.removeEventListener(name, on_foucs);
        }
      };
      this.ele.addEventListener(name, on_foucs);
    } else if (name === "blur") {
      const on_blur = e => {
        const ionItemEle = this.findIonItemEle();
        if (ionItemEle) {
          ionItemEle.classList.remove("input-has-focus");
        } else {
          this.ele.removeEventListener(name, on_blur);
        }
      };
      this.ele.addEventListener(name, on_blur);
    } else if (name === "input") {
      // this.ele.addEventListener(name, e => {
      //   if(e.target.value){
      //   ionItemEle.classList.remove('input-has-focus');
      //   }
      // });
    }
  }

  ionItemEle?: HTMLElement;
  findIonItemEle() {
    let ionItemEle = this.ionItemEle;

    if (ionItemEle === undefined) {
      const inputEle = this.ele;
      let parentEle = inputEle.parentElement;
      while (parentEle && parentEle != document.body) {
        if (parentEle.tagName === "ION-ITEM") {
          ionItemEle = this.ionItemEle = parentEle;
          break;
        }
        parentEle = parentEle.parentElement;
      }
    }
    return ionItemEle;
  } 
  ngOnInit() {
    this.onInputStatusChanged = this.onInputStatusChanged.bind(this);
    this.page.event.on("input-status-changed", this.onInputStatusChanged);
  }
  onInputStatusChanged(change_info) {
    const { key, event }: { key: string; event: any } = change_info;
    if (this.watch_keys.indexOf(key) !== -1 && event.type === "input") {
      this.form_key && this.page.checkFormKey(this.form_key);
    }
  }
  ngOnDestroy() {
    this.page.event.off("input-status-changed", this.onInputStatusChanged);
  }
}
