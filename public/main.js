// project_dir/public dizini içerisinde hangi model dosyasının seçili olduğunu belirtir
const MODEL_PATH = "model/model3";

/* 
aşağıda tanımlı partial_dictionary, hangi kategorilerin çizilmesi istendiğini belirler ve 
sadece bu değer 'true' ise aktif olur. 
Bu değer 'false' ise yapay zeka uygulaması tanımlı 67 kategoriyi de sorar
*/
const PARTIAL_RANDOM_LIST = true;

// değişkenler
var model;
var canvas = null;
var classNames = [];
let classNamesTr = [];
var coords = [];
let randomList = [];
var mousePressed = false;

let coordsHistory = [];

let objectToDraw = "";
let modelLoaded = false;
let drawThisLabel = "Model yükleniyor..";
let messageText = "";
let initialState = true;

// Arayüz yerleşimi ile ilgili constantlar
const DEFAULT_MARGIN_X = 50;
const DEFAULT_MARGIN_Y = 50;
const introScreenBackgroundColor = '#1878BB'

// Arayüzdeki yazılar ile ilgili constantlar
const AI_TITLE_TEXT = "YAPAY ZEKA"
const FIRST_DRAWING_TEXT = "İlk Çizimin";
const NEXT_DRAWING_TEXT = "Sıradaki Çizimin";

/* 
Yukarıda tanımlı PARTIAL_RANDOM_LIST eğer 'true' ise, 
yapay zeka uygulaması sadece aşağıdaki seçili kategorilerin çizilmesini ister 
*/
const partial_dictionary = [
    'muz',     'kuş',          'ekmek',
    'zarf',    'kaşık',        'saat',
    'ev',      'elma',         'ağaç',
    'şapka',   'çekiç',        'kelebek',
    'şemsiye', 'kulaklık',     'el',
    'kapı',    'bıyık',        'radyo',
    'kedi',    'göz',          'şort',
    'çizgi',   'priz',         'kare',
    'örümcek', 'cep telefonu', 'çiçek',
    'üçgen',   'armut',
    'mantar'
];

$(function() {
    document.documentElement.style.overflow = 'hidden';  // firefox, chrome
    init();
})

function init() {
    initCanvas();
    initDrawingCanvas();
    start();
}

// Drawing canvas'ı hazırla
function initCanvas() {
    canvas = window._canvas = new fabric.Canvas('canvas');
    canvas.historyInit();
    canvas.setWidth(window.innerWidth);
    canvas.setHeight(window.innerHeight);
}

function initDrawingCanvas() {
    canvas.backgroundColor = '#ffffff';
    canvas.freeDrawingBrush = new fabric['PencilBrush'](canvas);
    canvas.freeDrawingBrush.color = '#1878BB';
    canvas.renderAll();
    canvas.freeDrawingBrush.width = 7;
        //setup listeners 
        canvas.on('mouse:up', function(e) {
            onMouseUp();
        });
        canvas.on('mouse:down', function(e) {
            onMouseDown();
        });
        canvas.on('mouse:move', function(e) {
            recordCoor(e)
        });
}

function onMouseUp() {
    getFrame();
    coordsHistory.push(coords);
    mousePressed = false
}

function onMouseDown() {
    mousePressed = true
}

/*
şuan çizilen koordinatları kaydeder
*/
function recordCoor(event) {
    var pointer = canvas.getPointer(event.e);
    var posX = pointer.x;
    var posY = pointer.y;

    if (posX >= 0 && posY >= 0 && mousePressed) {
        coords.push(pointer)
    }
}

/*
Tahminlerle yapay zekanın sorduğu kategorinin uyuşup uyuşmadığını arayüze gönderir  
*/
function setTable(top5, probs) {
    if (top5.includes(objectToDraw)) {
        setMessage('Bu bir "' + toLocaleUpperCase(objectToDraw) + '"!');
        return;
    }

    let classList = [];
    if (modelLoaded) {
        var index = 0
        top5.forEach(element => {
            classList.push(element)
            index++;
        });
        if (classList.length === 0) {
            setMessage("")
        } else {
            setMessage('"' + toLocaleUpperCase(classList.slice(0,3).join('", "')) + '"  çiziyorsun...');
        }
    }
}

/*
Ekrana çizilen resimin min ve max koordinatlarını iste
*/
function getMinBox() {
    // koordinatları al 
    var coorX = coords.map(function(p) {
        return p.x
    });
    var coorY = coords.map(function(p) {
        return p.y
    });

    // en üst sol ve en alt sağ koordinatlarını bul 
    var min_coords = {
        x: Math.min.apply(null, coorX),
        y: Math.min.apply(null, coorY)
    }
    var max_coords = {
        x: Math.max.apply(null, coorX),
        y: Math.max.apply(null, coorY)
    }
 
    return {
        min: min_coords,
        max: max_coords
    }
}

/*
Şuan çizilen resim verisini iste
*/
function getImageData() {
        // resimi sınırlayan kutunun koordinatlarını al
        const mbb = getMinBox()

        // kullanılan cihazının piksel oranına göre resim verisini al 
        const dpi = window.devicePixelRatio
        const imgData = canvas.contextContainer.getImageData(mbb.min.x * dpi, mbb.min.y * dpi,
                                                      (mbb.max.x - mbb.min.x) * dpi, (mbb.max.y - mbb.min.y) * dpi);
        return imgData
    }

/*
Yapay zeka modelinden tahminleri iste 
*/
function getFrame() {
    // en az iki tane koordinatın kaydedildiğinden emin o
    // böylece, çizilen bir şey yoksa boş yere tahmin yapma
    if (coords.length >= 2) {

        // resim verisini canvas'ran al
        const imgData = getImageData()

        // yapay zeka modelinden tahminleri al 
        const pred = model.predict(preprocess(imgData)).dataSync()

        // en iyi 5 tahmini kullan 
        const indices = findIndicesOfMax(pred, 5)
        const probs = findTopValues(pred, 5)
        const names = getClassNamesTr(indices)
        console.log("getframe top5: ", getClassNames(indices))

        // en iyi 5 tahmini olasılıklarıyla birlikte arayüze yazılma algoritmasına gönder 
        setTable(names, probs)
    }

}

/*
İngilizce kategori isimlerini iste 
*/
function getClassNames(indices) {
    var outp = []
    for (var i = 0; i < indices.length; i++) {
        outp[i] = classNames[indices[i]]
    }
    return outp
}

/*
Türkçe kategori isimlerini iste 
*/
function getClassNamesTr(indices) {
    var outp = []
    for (var i = 0; i < indices.length; i++) {
        outp[i] = classNamesTr[indices[i]]
    }
    return outp
}

/*
Bütün kategorileri ve Türkçe tercümelerini yükle 
*/
async function loadDict() {
    await $.ajax({
        url: MODEL_PATH + '/class_names.txt',
        dataType: 'text',
    }).done(success);
    
    await $.ajax({
        url: MODEL_PATH + '/class_names_tr.txt',
        dataType: 'text',
    }).done(successTr);
}

/*
İngilizce kategori isimlerini classNames array'e doldur
*/
function success(data) {
    const lst = data.split(/\n/)
    for (var i = 0; i < lst.length - 1; i++) {
        let symbol = lst[i]
        classNames[i] = symbol
    }
}

/*
Türkçe kategori isimlerini classNamesTr array'e doldur
*/
function successTr(data) {
    const lst = data.split(/\n/)
    for (var i = 0; i < lst.length - 1; i++) {
        let symbol = lst[i]
        classNamesTr[i] = symbol
    }
}

/*
En yüksek olasılıklı tahminlerin indeksini bul
*/
function findIndicesOfMax(inp, count) {
    var outp = [];
    for (var i = 0; i < inp.length; i++) {
        outp.push(i); // indeks'i output array'e ekle
        if (outp.length > count) {
            outp.sort(function(a, b) {
                return inp[b] - inp[a];
            }); // azalan şekilde output array'i sırala
            outp.pop(); // en düşük olasılıklı kategorinin indeksini output array'den çıkar
        }
    }
    return outp;
}

/*
En iyi 5 tahmini bul
*/
function findTopValues(inp, count) {
    var outp = [];
    let indices = findIndicesOfMax(inp, count)
    for (var i = 0; i < indices.length; i++)
        outp[i] = inp[indices[i]]
    return outp
}

/*
Resim verisini yapay zeka modeline uygun hale getirmek için ön işlemden geçir
*/
function preprocess(imgData) {
    return tf.tidy(() => {
        // resim verisini tensor'e çevir
        let tensor = tf.browser.fromPixels(imgData, numChannels = 1)
        
        // yeniden boyutlandır (veri setindeki örneklerın boyutuna getir) 
        const resized = tf.image.resizeBilinear(tensor, [28, 28]).toFloat()
        
        // normalize et 
        const offset = tf.scalar(255.0);
        const normalized = tf.scalar(1.0).sub(resized.div(offset));

        // batch_shape almak için yeni bir boyut ekle 
        const batched = normalized.expandDims(0)
        return batched
    })
}

/*
modeli yükle
*/
async function start() {
    
    // modeli yükle 
    model = await tf.loadLayersModel(MODEL_PATH + '/model.json')
    
    // modeli ısındır, bu sayede bir sonraki 'predict' daha hızlı çalışır
    model.predict(tf.zeros([1, 28, 28, 1]))
    
    // canvas üzerinde çizimi etkinleştir 
    // (modeli yüklemeden etkinleştirseydik yapay zeka tahmin yapamayacaktı)
    allowDrawing()
    
    // kategori isimlerini yükle
    await loadDict()
}

// canvas üzerinde çizimi aktive et
function allowDrawing() {
    canvas.isDrawingMode = 1
    modelLoaded = true;
}

// Eğer PARTIAL_RANDOM_LIST kullanılıyorsa onu, 
// bütün Türkçe kategorileri immutable olarak kopyala
function initRandomList() {
    if (PARTIAL_RANDOM_LIST) {
        return partial_dictionary.slice();
    } else {
        return classNamesTr.slice();
    }
}

// Çizilmesi istenen kategoriyi rastgele bir şekilde belirle.
// Uygulama sorduğu kategoriyi aynı oturumda bütün kategoriler sorulana kadar
// bir daha sormasın diye randomList'ten çıkar.
function getObjectToDraw() {
    if (randomList.length === 0) {
        randomList = initRandomList();
    }
    const indexToPick = Math.floor(Math.random() * randomList.length)
    const drawThis = randomList[indexToPick];
    randomList.splice(indexToPick, 1);
    console.log("drawThis is set to: ", drawThis);
    document.getElementById("object-to-draw").innerHTML = toLocaleUpperCase(drawThis);
    return drawThis;
}

// Yapay zekanın yaptığı tahmini arayüzde güncelle
function setMessage(message) {
    console.log("setMessage");
    if (message === "") return; 

    document.getElementById("message").innerHTML = message;
    document.getElementById("message").style.textShadow = "2px 2px 2px rgba(0, 0, 0, 0.3)";
    document.getElementById("message").style.color = "#1878BB";
}

// UYGULAMA KONTOLLERİ

// Uygulamaya giriş
function onEnterApp() {
    console.log("onEnterApp()");
    document.getElementById("bg").style.display = "none";
}

// İntro ekranı kontrolü, çizmeye başla
function onStartDrawing(){
    if (classNamesTr.length === 0) return;

    document.getElementById("intro-center").style.display = "none";
    document.getElementById("start-center").style.display = "block"; 
    objectToDraw = getObjectToDraw();
}

// Başla ekranı kontrolü, tamam
function onOkClick() {
    document.getElementById("intro").style.display = "none";
}

// ÇİZİM EKRANI KONTROLLERİ

// Sil
function erase() {
    console.log("erase");
    clearCanvas();
}

// Bir sonraki çizim
function next() {
    console.log("next")
    clearCanvas();
    objectToDraw = getObjectToDraw();
    document.getElementById("your-drawing-text").innerHTML = NEXT_DRAWING_TEXT;
    document.getElementById("intro").style.display = "block";
}

// Son çizimi geri al
function back() {
    console.log("back");
    console.log(coordsHistory.length);
    if (coordsHistory.length <= 1) {
        clearCanvas();
        return;
    } else {
        document.getElementById("message").innerHTML = "Başla";
        document.getElementById("message").style.textShadow = "";
        document.getElementById("message").style.color = "white";
        coordsHistory.pop();
        coords = coordsHistory.length !== 0 ? coordsHistory[coordsHistory.length - 1].slice() : [];
        canvas.undo();
    }
}

// Canvas'ı (çizim ekranını) temizle
function clearCanvas() {
    canvas.clear();
    canvas.backgroundColor = '#ffffff';
    coordsHistory = [];
    coords = [];
    document.getElementById("message").innerHTML = "Başla";
    document.getElementById("message").style.textShadow = "";
    document.getElementById("message").style.color = "white";
}

// Ana ekran'a dön
function home() {
    window.location.reload(false); 
}

// YARDIMCI FONKSİYONLAR

// Türkçe karakterler dahil büyük harfe çevir
function toLocaleUpperCase(text) {
    if (text === undefined) return;
    return text.toLocaleUpperCase('tr-TR');
}

// CANVAS İÇİN YARDIMCI FONKSİYONLAR

// Canvas'taki çizimi indir (debug yapmak için kullanılabilir)
function downloadCanvasImage() {
    // take a canvas screenshot and download
    const dataURL = canvas.toDataURL({
        width: canvas.width,
        height: canvas.height,
        left: 0,
        top: 0,
        format: 'png',
    });
    const link = document.createElement('a');
    link.download = 'image.png';
    link.href = dataURL;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Canvas sınıfına geri al özelliği kazandırmak için aşağıdaki 
// prototip fonksiyonlar eklenmiştir
fabric.Canvas.prototype.historyInit = function () {
    this.historyUndo = [];
    this.historyNextState = this.historyNext();
  
    this.on({
      "object:added": this.historySaveAction,
      "object:removed": this.historySaveAction,
      "object:modified": this.historySaveAction
    })
  }
  
fabric.Canvas.prototype.historyNext = function () {
return JSON.stringify(this.toDatalessJSON(this.extraProps));
}

fabric.Canvas.prototype.historySaveAction = function () {
if (this.historyProcessing)
    return;

const json = this.historyNextState;
this.historyUndo.push(json);
this.historyNextState = this.historyNext();
}

fabric.Canvas.prototype.undo = function () {
    console.log("undo");
    // The undo process will render the new states of the objects
    // Therefore, object:added and object:modified events will triggered again
    // To ignore those events, we are setting a flag.
    this.historyProcessing = true;

    const history = this.historyUndo.pop();
    if (history) {
        this.loadFromJSON(history).renderAll();
    }

    this.historyProcessing = false;
}
