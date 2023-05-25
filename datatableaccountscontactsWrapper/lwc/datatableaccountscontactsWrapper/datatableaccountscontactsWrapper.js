import { LightningElement, track, api } from "lwc";
import { OmniscriptBaseMixin } from "vlocity_cmt/omniscriptBaseMixin";
import { cloneDeep } from "vlocity_cmt/lodash";

export default class DatatableaccountscontactsWrapper extends OmniscriptBaseMixin(
  LightningElement
) {
  @track _records;
  @track _omniCustomState;
  @track _omniJsonDef;
  @track selectedRecords = [];

  UNIQUE_RECORD_KEY = "Id";
  SORT_KEY = "Id";
  SAVED_STATE_KEY = "savedList";

  @api
  set records(data) {
    if (data) {
      this.restoreData(data);
    }
  }

  get records() {
    return this._records;
  }

  @api
  set omniCustomState(data) {
    if (data) {
      this._omniCustomState = data;
    }
  }

  get omniCustomState() {
    return this._omniCustomState;
  }

  /**
   * Restore the selection. We need to merge the lists as there is seperate attribute for selected items
   * @param {*} data
   */
  restoreData(data) {
    if (
      this.selectedRecords.length === 0 &&
      this._omniCustomState !== undefined
    ) {
      this._records = cloneDeep(data);
      this.selectedRecords = cloneDeep(
        this._omniCustomState[this.SAVED_STATE_KEY]
      );
      let restoredRecordsList = cloneDeep(this._omniCustomState.savedList);

      this._records = this.merge(
        this._records,
        restoredRecordsList,
        this.UNIQUE_RECORD_KEY
      );
      this._records.sort((a, b) => {
        return a[this.SORT_KEY] - b[this.SORT_KEY];
      });
    } else {
      this._records = cloneDeep(data);
      this._records.sort((a, b) => {
        return a[this.SORT_KEY] - b[this.SORT_KEY];
      });
    }
  }

  /**
   * Merge two arrays based on unique key
   * @param {*} a
   * @param {*} b
   * @param {*} prop
   * @returns
   */
  merge(a, b, prop) {
    let reduced = a.filter(
      (aitem) =>
        !b.find((bitem) => {
          delete bitem.originalIndex;
          return aitem[prop] === bitem[prop];
        })
    );
    return reduced.concat(b);
  }

  /**
   * Handle row selection
   * @param {*} event
   */
  getSelectHandler(event) {
    if (event.detail.result === "all") {
      this.selectedRecords = [];
      this.selectedRecords = cloneDeep(this._assetInfo);
      this.selectedRecords.forEach((item) => {
        item.selectrow = true;
      });
    } else if (event.detail.result === "none") {
      this.selectedRecords = [];
    } else {
      let selectedItem = event.detail.result;
      delete selectedItem.originalIndex;

      if (selectedItem.selectrow === false) {
        this.selectedRecords = this.selectedRecords.filter(
          (item) =>
            item[this.UNIQUE_RECORD_KEY] !==
            selectedItem[this.UNIQUE_RECORD_KEY]
        );
      } else {
        this.selectedRecords.push(selectedItem);
      }
    }
    this.selectedRecords = this.selectedRecords.map((row) => ({
      ...row,
      vlcSelected: true
    }));
    this.omniApplyCallResp({
      selectedRecords: this.selectedRecords
    });
    this.omniSaveState(this.selectedRecords, this.SAVED_STATE_KEY);
  }
}