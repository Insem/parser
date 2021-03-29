const request = fs = require('fs');
class Parser {
    Result = class {
        constructor(title, price) {
            this.arr = Array.from(arguments);
        }
    };
    get separator() { return ';' };
    get folder() { return './pages/' };
    parsePage(path) {
        const self= this;
        fs.readFile(path, 'utf8', function (err, data) {
            if (err) return console.log('Ошибка: Не получилось прочитать файл', path, err);
            const resultArr = [];
            const rawData = data.match(/(?<=\<div id=\"state-searchResultsV2-.*-default-1\" data-state=\').*?(?=\'\>)/gi);
            if(!rawData[0])return console.log('Ошибка: Регулярка сломалась');
            const raw = rawData[0];
            let parse;
            try {
                parse = JSON.parse(raw);
            }
            catch(e){
                console.log("Ошибка: Парсинг не удался", e);
                return;
            }
            parse.items.forEach(el => {
                //console.log(el);
                el.templateState.forEach(com => {
                    if (com.type == 'content') {
                        const rawStr = JSON.stringify(com);
                        if (rawStr.indexOf('Бестселлер') != -1) {
                            resultArr.push(new self.Result(
                                el.cellTrackingInfo.title, 
                                el.cellTrackingInfo.price, 
                                el.cellTrackingInfo.countItems
                            ));
                        }
                    }
                })
            });
            fs.appendFileSync("ozon.csv", resultArr.map(row => row.arr.join(self.separator)).join("\n")+"\n")
        });
    }
    
    parseFolder(){
        const self = this;
        console.log("Парсинг пошел");
       // console.log(this.folder);
        fs.readdirSync(this.folder).forEach(file => {
            //console.log(file);
            if(/(.html)$/.test(file)){
               self.parsePage(self.folder+file);
            }
        })
    }
}
const parser = new Parser();
parser.parseFolder();