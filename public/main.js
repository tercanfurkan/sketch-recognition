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
let drawMode = false;
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
    "turkish": ['şemsiye','kare','örümcek','kedi','kelebek','masa','uçak','yıldırım','tezgah','kaşık','şort','kuş','tenis raketi','sosis','priz','cep telefonu','bıçak','gökkuşağı','ekmek','yatak','kulaklık','şapka','beyzbol','çerez','mikrofon','elma','anahtar','basketbol','gözlük','göz','çizgi','üçgen','kitap','pizza','daire','mantar','yüz','yılan','çiçek','dambıl','trafik ışığı','ice_cream','çekiç','ay','tüfek','radyo','donut','bıyık','kamera','yastık', 'muz', 'köprü', 'kamp ateşi', 'saat', 'elmas', 'kapı', 'zarf' , 'balık', 'el', 'ev', 'dağ', 'mantar', 'armut', 'güneş', 'diş fırçası', 'ağaç', 'tekerlek', 'kalem']
};
const partial_dictionary = { // 21
    "english": ['pear','moustache','cell_phone','cat,','headphones','bird','power_outlet','line','hammer','bread','square','house','spoon','umbrella','clock','eye','lightning','hand','spider','triangle','sun','butterfly'],
    "turkish": ['armut','bıyık','cep telefonu','kedi','kulaklık','kuş','priz','çizgi','çekiç','ekmek','kare','ev','kaşık','şemsiye','saat','göz','yıldırım','el','örümcek','üçgen','güneş','kelebek']
};

$(function() {
    init();
})

function init() {
    initCanvas();
    initDrawThisCanvas();
}

/*
prepare the drawing canvas 
*/

function initCanvas() {
    console.log("initCanvas");
    canvas = window._canvas = new fabric.Canvas('canvas');
    canvas.setWidth(window.innerWidth);
    canvas.setHeight(window.innerHeight);
}

function initDrawThisCanvas() {
    console.log("initDrawThisCanvas")
    canvas.backgroundColor = '#1878BB';
    setDrawMode(false);

    drawTitle('white')
    drawNextDrawingScreen();
}

function onOkClick() {
    console.log("onOkClick");
    loadDrawCanvas();
}
function loadDrawCanvas() {
    console.log("loadDrawCanvas")
    canvas.clear();
    initDrawingCanvas()
    initDrawingCanvasDrawings()
    start('en')
}

function setDrawMode(mode) {
    drawMode = mode;
    canvas.isDrawingMode = mode ? 1 : 0
}

function initDrawingCanvas() {
    canvas.backgroundColor = '#ffffff';
    canvas.freeDrawingBrush.color = '#1878BB';
    canvas.renderAll();
    canvas.freeDrawingBrush.width = 7;
    if (initialState) {
        //setup listeners 
        canvas.on('mouse:up', function(e) {
            getFrame();
            mousePressed = false
        });
        canvas.on('mouse:down', function(e) {
            mousePressed = true
        });
        canvas.on('mouse:move', function(e) {
            recordCoor(e)
        });
    }
}

function initDrawingCanvasDrawings() {

    fabric.Image.fromURL('static/home2x.png', function(img) {
        const oImg = img.set({
            selectable: true,
            left: getLeftX(),
            top: getBottomY('normal'),
        })
        canvas.add(oImg); //add new image to canvas
        oImg.on('mousedown',next); //add mouse down lisner to image
    });

    fabric.Image.fromURL('static/erase2x.png', function(img) {
        const oImg = img.set({
            selectable: true,
            left: getRightX() - DEFAULT_MARGIN_X * 4,
            top: getBottomY('big'),
        })
        canvas.add(oImg); //add new image to canvas
        oImg.on('mousedown',erase); //add mouse down lisner to image
    });

    fabric.Image.fromURL('static/back2x.png', function(img) {
        const backImage = img.set({
            selectable: true,
            left: getRightX() - DEFAULT_MARGIN_X * 2.2,
            top: getBottomY('normal'),
        })
        canvas.add(backImage); //add new image to canvas
        backImage.on('mousedown',next); //add mouse down lisner to image
    });

    fabric.Image.fromURL('static/next2x.png', function(img) {
        const oImg = img.set({
            selectable: true,
            left: getRightX(),
            top: getBottomY('small'),
        })
        canvas.add(oImg); //add new image to canvas
        oImg.on('mousedown',next); //add mouse down lisner to image
    });
    drawTitle('#1878BB')
}

/*
set the table of the predictions 
*/
function setTable(top5, probs) {
    let classList = [];
    if (modelLoaded) {
        var counter = 0
        top5.forEach(element => {
            console.log(element)
            console.log(probs[counter])
            classList.push(translate(element))
        });
        console.log("setTable, classList: ", classList);
        console.log("setTable, classList contains drawThis: ", objectToDraw);
        if (classList.length === 0) {
            setMessage("")
        } else if (classList.includes(objectToDraw)) {
            setMessage('Bu bir "' + toLocaleUpperCase(objectToDraw) + '"!');
        } else {
            setMessage('"' + toLocaleUpperCase(classList.slice(0,3).join('", "')) + '" Çiziyorsun...');
        }
    }
}

/*
record the current drawing coordinates
*/
function recordCoor(event) {
    if (!drawMode) return;

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
    if (!drawMode) return;
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
    const drawThisEng = partial_dictionary.english[Math.floor(Math.random() * partial_dictionary.english.length)]
    return translate(drawThisEng);
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
    setDrawMode(true);
    modelLoaded = true;
}

/*
clear the canvas 
*/
function erase() {
    console.log("erase");
    canvas.clear();
    canvas.backgroundColor = '#ffffff';
    coords = [];
    initDrawingCanvasDrawings()
}

function next() {
    console.log("next")
    initialState = false;
    canvas.removeListeners();
    canvas.clear();
    init();
    //initDrawThisCanvas();
}

function setMessage(message) {
    console.log("setMessage");
    document.getElementById('i-see-things').innerHTML = message;
    if (message === "") return; 

    if (messageText !== "") {
        canvas.remove(messageText)
    }

    messageText = new fabric.Text(message, {
        left: getCenterX(),
        top: getUpperY() - DEFAULT_MARGIN_Y * 2,
        originX: 'center',
        fontFamily: 'BloggerSans-light-italic',
        fontSize: '16',
        fontWeight: 'bold',
        fill: '#1878BB',
        shadow: 'rgba(0,0,0,0.3) 1px 1px 1px'
      });
    canvas.add(messageText);
}

// COMPONENTS
function drawTitle(fill) {
    console.log("drawTitle");
    canvas.add(new fabric.Text(AI_TITLE_TEXT, {
        left: getLeftX(),
        top: getTopY(),
        fontFamily: 'BloggerSans',
        fontSize: '30',
        fontWeight: 'bold',
        fill: fill,
        shadow: 'rgba(0,0,0,0.3) 1px 1px 1px'
      }
    ));
}

function drawNextDrawingScreen() {
    console.log("drawNextDrawingScreen")
    const drawThisTitle = initialState ? FIRST_DRAWING_TEXT : NEXT_DRAWING_TEXT

    canvas.add(new fabric.Text(drawThisTitle, {
        left: getCenterX(),
        top: getCenterY() - DEFAULT_MARGIN_Y * 2.5,
        originX: 'center',
        originY: 'center',
        fontFamily: 'BloggerSans',
        fontSize: '26',
        fill: 'white',
        shadow: 'rgba(0,0,0,0.3) 1px 1px 1px',
      }));
      console.log("1")

    objectToDraw = getObjectToDraw();
    canvas.add(new fabric.Text(toLocaleUpperCase(objectToDraw), {
        left: getCenterX(),
        top: getCenterY(),
        originX: 'center',
        originY: 'center',
        fontFamily: 'BloggerSans',
        fontSize: '75',
        fontWeight: 'bold',
        fill: 'white',
        shadow: 'rgba(0,0,0,0.3) 1px 1px 1px'
    }));
    console.log("2")

    fabric.Image.fromURL('static/tamam2x.png', function(img) {
        const okImage = img.set({
            selectable: true,
            left: getCenterX(),
            top: getCenterY() + DEFAULT_MARGIN_Y * 2.5,
            originX: 'center',
            originY: 'center',
        })
        okImage.scaleToWidth(150);
        canvas.add(okImage); //add new image to canvas
        okImage.on('mousedown', onOkClick); //add mouse down lisner  to image
    });

    console.log("3")
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

