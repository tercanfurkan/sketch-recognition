/*
variables
*/
var model;
var canvas = null;
var classNames = [];
var coords = [];
var mousePressed = false;

let objectToDraw = "";
let modelLoaded = false;
let drawThisLabel = "Model yükleniyor..";
let messageText = "";
let initialState = true;

const DEFAULT_MARGIN_X = 50;
const DEFAULT_MARGIN_Y = 50;

// styling
const introScreenBackgroundColor = '#1878BB'

const AI_TITLE_TEXT = "YAPAY ZEKA"
const FIRST_DRAWING_TEXT = "İlk Çizimin";
const NEXT_DRAWING_TEXT = "Sıradaki Çizimin";

const dictionary = { // 50
    "english": ['umbrella', 'square', 'spider', 'cat', 'butterfly', 'table', 'airplane', 'lightning', 'bench', 'spoon', 'shorts', 'bird', 'tennis_racquet', 'hot_dog', 'power_outlet', 'cell_phone', 'knife', 'rainbow', 'bread', 'bed', 'headphones', 'hat', 'baseball', 'cookie', 'microphone', 'apple', 'key', 'basketball', 'eyeglasses', 'eye', 'line', 'triangle', 'book', 'pizza', 'circle', 'mushroom', 'face', 'snake', 'flower', 'dumbbell', 'traffic_light', 'ice_cream', 'hammer', 'moon', 'rifle', 'radio', 'donut', 'moustache', 'camera', 'pillow', 'banana', 'bridge', 'campfire', 'clock', 'diamond', 'door', 'envelope' , 'fish', 'hand', 'house', 'mountain', 'mushroom', 'pear', 'sun', 'toothbrush', 'tree', 'wheel', 'pencil'],
    "turkish": ['şemsiye','kare','örümcek','kedi','kelebek','masa','uçak','yıldırım','tezgah','kaşık','şort','kuş','tenis raketi','sosis','priz','cep telefonu','bıçak','gökkuşağı','ekmek','yatak','kulaklık','şapka','beyzbol','çerez','mikrofon','elma','anahtar','basketbol','gözlük','göz','çizgi','üçgen','kitap','pizza','daire','mantar','yüz','yılan','çiçek','dambıl','trafik ışığı','dondurma','çekiç','ay','tüfek','radyo','tatlı çörek','bıyık','kamera','yastık', 'muz', 'köprü', 'kamp ateşi', 'saat', 'elmas', 'kapı', 'zarf' , 'balık', 'el', 'ev', 'dağ', 'mantar', 'armut', 'güneş', 'diş fırçası', 'ağaç', 'tekerlek', 'kalem']
};
const partial_dictionary = { // 21
    "english": ['pear','moustache','cell_phone','cat','headphones','bird','power_outlet','line','hammer','bread','square','house','spoon','umbrella','clock','eye','lightning','hand','spider','triangle','sun','butterfly'],
    "turkish": ['armut','bıyık','cep telefonu','kedi','kulaklık','kuş','priz','çizgi','çekiç','ekmek','kare','ev','kaşık','şemsiye','saat','göz','yıldırım','el','örümcek','üçgen','güneş','kelebek']
};
let randomList;

$(function() {
    document.documentElement.style.overflow = 'hidden';  // firefox, chrome
    init();
})

function init() {
    randomList = partial_dictionary.english.slice();
    initCanvas();
    initDrawingCanvas();
    start('en');
}

/*
prepare the drawing canvas 
*/

function initCanvas() {
    console.log("initCanvas");
    canvas = window._canvas = new fabric.Canvas('canvas');
    canvas.historyInit();
    canvas.setWidth(window.innerWidth);
    canvas.setHeight(window.innerHeight);
}

let coordsHistory = [];
function initDrawingCanvas() {
    canvas.backgroundColor = '#ffffff';
    canvas.freeDrawingBrush.color = '#1878BB';
    canvas.renderAll();
    canvas.freeDrawingBrush.width = 7;
        //setup listeners 
        canvas.on('mouse:up', function(e) {
            getFrame();
            coordsHistory.push(coords);
            mousePressed = false
        });
        canvas.on('mouse:down', function(e) {
            mousePressed = true
        });
        canvas.on('mouse:move', function(e) {
            recordCoor(e)
        });
}

/*
set the table of the predictions 
*/
function setTable(top5, probs) {
    console.log('top5', top5);
    console.log('probs', probs);
    let classList = [];
    if (modelLoaded) {
        var counter = 0
        top5.forEach(element => {
            classList.push(translate(element))
        });
        if (classList.length === 0) {
            setMessage("")
        } else if (classList.includes(objectToDraw)) {
            setMessage('Bu bir "' + toLocaleUpperCase(objectToDraw) + '"!');
        } else {
            setMessage('"' + toLocaleUpperCase(classList.slice(0,3).join('", "')) + '"  çiziyorsun...');
        }
    }
}

/*
record the current drawing coordinates
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
get the best bounding box by trimming around the drawing
*/
function getMinBox() {
    //get coordinates 
    var coorX = coords.map(function(p) {
        return p.x
    });
    var coorY = coords.map(function(p) {
        return p.y
    });

    //find top left and bottom right corners 
    var min_coords = {
        x: Math.min.apply(null, coorX),
        y: Math.min.apply(null, coorY)
    }
    var max_coords = {
        x: Math.max.apply(null, coorX),
        y: Math.max.apply(null, coorY)
    }

    //return as strucut 
    return {
        min: min_coords,
        max: max_coords
    }
}

/*
get the current image data 
*/
function getImageData() {
        //get the minimum bounding box around the drawing 
        const mbb = getMinBox()

        //get image data according to dpi 
        const dpi = window.devicePixelRatio
        const imgData = canvas.contextContainer.getImageData(mbb.min.x * dpi, mbb.min.y * dpi,
                                                      (mbb.max.x - mbb.min.x) * dpi, (mbb.max.y - mbb.min.y) * dpi);
        return imgData
    }

/*
get the prediction 
*/
function getFrame() {
    //make sure we have at least two recorded coordinates 
    if (coords.length >= 2) {

        //get the image data from the canvas 
        const imgData = getImageData()

        //get the prediction 
        const pred = model.predict(preprocess(imgData)).dataSync()

        //find the top 5 predictions 
        const indices = findIndicesOfMax(pred, 5)
        const probs = findTopValues(pred, 5)
        const names = getClassNames(indices)

        //set the table 
        setTable(names, probs)
    }

}

/*
get the the class names 
*/
function getClassNames(indices) {
    var outp = []
    for (var i = 0; i < indices.length; i++)
        outp[i] = classNames[indices[i]]
    return outp
}

/*
load the class names 
*/
async function loadDict() {
    loc = 'model3/class_names.txt'
    
    await $.ajax({
        url: loc,
        dataType: 'text',
    }).done(success);
}

function getObjectToDraw() {
    console.log("getObjectToDraw");
    if (randomList.length === 0) {
        randomList = partial_dictionary.english.slice();
    }
    const indexToPick = Math.floor(Math.random() * randomList.length)
    const drawThisEng = randomList[indexToPick];
    randomList.splice(indexToPick, 1);
    console.log("en", drawThisEng);
    const drawThisTurkish = translate(drawThisEng);
    console.log("tr", drawThisTurkish);
    document.getElementById("object-to-draw").innerHTML = toLocaleUpperCase(drawThisTurkish);
    return drawThisTurkish;
}

/*
load the class names
*/
function success(data) {
    const lst = data.split(/\n/)
    for (var i = 0; i < lst.length - 1; i++) {
        let symbol = lst[i]
        classNames[i] = symbol
    }
}

/*
get indices of the top probs
*/
function findIndicesOfMax(inp, count) {
    var outp = [];
    for (var i = 0; i < inp.length; i++) {
        outp.push(i); // add index to output array
        if (outp.length > count) {
            outp.sort(function(a, b) {
                return inp[b] - inp[a];
            }); // descending sort the output array
            outp.pop(); // remove the last index (index of smallest element in output array)
        }
    }
    return outp;
}

/*
find the top 5 predictions
*/
function findTopValues(inp, count) {
    var outp = [];
    let indices = findIndicesOfMax(inp, count)
    // show 5 greatest scores
    for (var i = 0; i < indices.length; i++)
        outp[i] = inp[indices[i]]
    return outp
}

/*
preprocess the data
*/
function preprocess(imgData) {
    return tf.tidy(() => {
        //convert to a tensor 
        let tensor = tf.browser.fromPixels(imgData, numChannels = 1)
        
        //resize 
        const resized = tf.image.resizeBilinear(tensor, [28, 28]).toFloat()
        
        //normalize 
        const offset = tf.scalar(255.0);
        const normalized = tf.scalar(1.0).sub(resized.div(offset));

        //We add a dimension to get a batch shape 
        const batched = normalized.expandDims(0)
        return batched
    })
}

/*
load the model
*/
async function start(cur_mode) {
    //arabic or english
    mode = cur_mode
    
    //load the model 
    model = await tf.loadLayersModel('model3/model.json')
    
    //warm up 
    model.predict(tf.zeros([1, 28, 28, 1]))
    
    //allow drawing on the canvas 
    allowDrawing()
    
    //load the class names
    await loadDict()
}

/*
allow drawing on canvas
*/
function allowDrawing() {
    canvas.isDrawingMode = 1
    modelLoaded = true;
}

function setMessage(message) {
    console.log("setMessage");
    if (message === "") return; 

    document.getElementById("message").innerHTML = message;
    document.getElementById("message").style.textShadow = "2px 2px 2px rgba(0, 0, 0, 0.3)";
    document.getElementById("message").style.color = "#1878BB";
}

// CONTROLS

// ENTER APP

function onEnterApp() {
    console.log("onEnterApp()");
    document.getElementById("bg").style.display = "none";
}

// INTRO SCREEN CONTROLS
function onStartDrawing(){
    document.getElementById("intro-center").style.display = "none";
    document.getElementById("start-center").style.display = "block"; 
    objectToDraw = getObjectToDraw();
}

// START SCREEN CONTROLS

function onOkClick() {
    console.log("onOkClick");
    document.getElementById("intro").style.display = "none";
}

// DRAW SCREEN CONTROLS
function erase() {
    console.log("erase");
    clearCanvas();
}

function next() {
    console.log("next")
    clearCanvas();
    objectToDraw = getObjectToDraw();
    document.getElementById("your-drawing-text").innerHTML = NEXT_DRAWING_TEXT;
    document.getElementById("intro").style.display = "block";
}

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

function clearCanvas() {
    canvas.clear();
    canvas.backgroundColor = '#ffffff';
    coordsHistory = [];
    coords = [];
    document.getElementById("message").innerHTML = "Başla";
    document.getElementById("message").style.textShadow = "";
    document.getElementById("message").style.color = "white";
}

function home() {
    window.location.reload(false); 
}

// HELPERS

function toLocaleUpperCase(text) {
    if (text === undefined) return;
    return text.toLocaleUpperCase('tr-TR');
}

function translate(word) {
    index = dictionary.english.indexOf(word);
    return dictionary.turkish[index];
}

function getWidth() {
    return window.innerWidth;
}

function getHeight() {
    return window.innerHeight;
}

function getCenterX() {
    return window.innerWidth / 2;
}

function getCenterY() { 
    return window.innerHeight / 2;
}

function getUpperY() {
    return getCenterY() / 2;
}

function getLeftX() {
    return 0 + DEFAULT_MARGIN_X;
}

function getRightX() {
    return getWidth() - DEFAULT_MARGIN_X * 2;
}

function getTopY() {
    return 0 + DEFAULT_MARGIN_Y;
}

function getBottomY(size) {
    switch (size) {
        case 'big':
            return getHeight() - DEFAULT_MARGIN_Y * 3;
        case 'small':
            return getHeight() - DEFAULT_MARGIN_Y * 2.2;
        case 'normal':
        default:
            return getHeight() - DEFAULT_MARGIN_Y * 2.5;
    }
}

// CANVAS HELPERS

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

