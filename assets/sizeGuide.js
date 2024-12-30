function selectHeightWeight(dataSourceType) {
  if (!dataSourceType) return;
  const height = document.querySelector("#heightSelect").value;
  const weight = document.querySelector("#weightSelect").value;
  const result = document.querySelector("#size-guide-result");
  result.style.display = "none";

  console.log("height", height)
  console.log("weight", weight)
  console.log("dataSource[dataSourceType]", weight)

  if (height && height != "null" && weight && weight != "null") {

    console.log("height", height)
    console.log("weight", weight)
    console.log("dataSourceType", dataSourceType)
    console.log("dataSource[dataSourceType]", dataSource[dataSourceType])

    const recommendSize = dataSource[dataSourceType][height][weight];
    result.innerHTML = recommendSize ? `${getTranslation('size_guide.size_advice')} ${recommendSize}`: getTranslation('size_guide.size_not_available');
    result.style.display = "flex";
  }
}

class initSelectBox {
  constructor(sizeTableType) {

    console.log("this.sizeTableType", sizeTableType)
    
    this.sizeTableType = sizeTableType;
    this.sourceData = sizeTableType ? dataSource[sizeTableType] : [];
    this.typeArray = [];
    this.lenArray = [];
    this.typeEle = document.querySelector("#size-type");
    this.lenEle = document.querySelector("#size-length");
    this.table = document.querySelector("#type-one-table");
    this.tableBody = document.querySelector("#type-one-table .tbody");
    this.groupByList = [];
    this.render();

    
    console.log("this.sourceData", this.sourceData)
  }
  getTypeEle() {
    let that = this;
    let currentLen = [];
    if (currentLen.length == 0) {
      currentLen = that.groupByList[that.getFirstEleKey()];
      let html = "";
      currentLen.forEach((v) => {
        html += `<option value="${v}">${v}</option>`;
      });
      that.lenEle.innerHTML =`<option value="null" selected style="display:none">${getTranslation('size_guide.select_size_type')}</option>${html}` ;
    }
    that.typeEle.addEventListener("change", function () {
      that.table.style.display = "none";
      currentLen = that.groupByList[that.typeEle.value];
      let html = "";
      currentLen.forEach((v) => {
        html += `<option value="${v}">${v}</option>`;
      });
      that.lenEle.innerHTML = `<option value="null" selected style="display:none">${getTranslation('size_guide.select_size')}</option>${html}`;
      that.sizeTypeAndLenChange();
    });
  }
  getLenEle() {
    const that = this;
    that.lenEle.addEventListener("change", function () {
      that.sizeTypeAndLenChange();
    });
  }
  getFirstEleKey() {
    const firstItem = this.sourceData[0];
    const key = Object.keys(firstItem).map((v) => v)[0];
    return key;
  }
  getTypeArray() {
    // console.log('1')
    if (this.sizeTableType && this.sourceData) {
      // console.log('2', this.sizeTableType, this.sourceData)
      Object.keys(this.sourceData[0]).forEach((v) => {
        this.typeArray.push(v);
        if (v) {
          let list = [];
          this.sourceData.forEach((item) => {
            list.push(item[v]);
          });
          this.groupByList[v] = list;
        }
      });
    }
    let html = "";
    this.typeArray.forEach((v) => {
      if(['height','waist','chest','hips','inside_leg'].includes(v)){
        return true;
      }
      html += `<option value="${v}">${getTranslation('size_guide.size_properties.'+v)}</option>`;
    });
    this.typeEle.innerHTML = html;
  }
  sizeTypeAndLenChange() {
    if (!this.sizeTableType) return;
    const type = this.typeEle.value;
    const size = this.lenEle.value;
    this.table.style.display = "none";
    if (type && size && this.sourceData) {
      const res = this.sourceData.find((item) => item[type] == size);
      if (res) {
        let html = "";
        Object.entries(res).forEach(([key, value]) => {
          if (key != type) {
            html += `<div class="tr">
            <div class="td">${getTranslation('size_guide.size_properties.'+ key)}</div>
            <div class="td">${value}</div>
          </div>`;
          }
        });
        this.tableBody.innerHTML =  html;
        this.table.style.display = "block";
      }
    }
  }
  render() {
    this.getTypeArray();
    this.getTypeEle();
    this.getLenEle();
  }
}
