/*
variables
*/
var model;
var canvas;
var classNames = [];
var coords = [];
var mousePressed = false;

let drawThis = "";
let modelLoaded = false;

// const dictionary_100 = {
//     "english": ['drums', 'sun', 'laptop', 'anvil', 'baseball_bat', 'ladder', 'eyeglasses', 'grapes', 'book', 'dumbbell', 'traffic_light', 'wristwatch', 'wheel', 'shovel', 'bread', 'table', 'tennis_racquet', 'cloud', 'chair', 'headphones', 'face', 'eye', 'airplane', 'snake', 'lollipop', 'power_outlet', 'pants', 'mushroom', 'star', 'sword', 'clock', 'hot_dog', 'syringe', 'stop_sign', 'mountain', 'smiley_face', 'apple', 'bed', 'shorts', 'broom', 'diving_board', 'flower', 'spider', 'cell_phone', 'car', 'camera', 'tree', 'square', 'moon', 'radio', 'hat', 'pizza', 'axe', 'door', 'tent', 'umbrella', 'line', 'cup', 'fan', 'triangle', 'basketball', 'pillow', 'scissors', 't-shirt', 'tooth', 'alarm_clock', 'paper_clip', 'spoon', 'microphone', 'candle', 'pencil', 'envelope', 'saw', 'frying_pan', 'screwdriver', 'helmet', 'bridge', 'light_bulb', 'ceiling_fan', 'key', 'donut', 'bird', 'circle', 'beard', 'coffee_cup', 'butterfly', 'bench', 'rifle', 'cat', 'sock', 'ice_cream', 'moustache', 'suitcase', 'hammer', 'rainbow', 'knife', 'cookie', 'baseball', 'lightning', 'bicycle'],
//     "turkish": ['bateri','güneş','dizüstü bilgisayar','örs','beyzbol sopası','merdiven','gözlük','üzüm','kitap','dambıl','trafik ışığı','kol saati', 'tekerlek','kürek','ekmek','masa','tenis raketi','bulut','sandalye','kulaklıklar','yüz','göz','uçak','yılan','lolipop ','priz','pantolon','mantar','yıldız','kılıç','saat','hot dog','şırınga','dur işareti','dağ','gülen surat','elma', 'yatak','şort','süpürge','sıçrama tahtası','çiçek','örümcek','cep telefonu','araba','kamera','ağaç','kare','ay','radyo ','şapka','pizza','balta','kapı','çadır','şemsiye','çizgi','fincan','fan','üçgen','basketbol','yastık', 'makas','tişört','diş','alarm saati','ataş','kaşık','mikrofon','mum','kalem','zarf','testere','tava','tornavida','kask','köprü','ampul','tavan vantilatörü','anahtar','donut','kuş','daire','sakal','kahve kupası','kelebek','tezgah ','tüfek','kedi','çorap','dondurma','bıyık','bavul','çekiç','gök kuşağı','bıçak','kurabiye','beyzbol','yıldırım','bisiklet']
// };

const dictionary = { // 50
    "english": ['umbrella', 'square', 'spider', 'cat', 'butterfly', 'table', 'airplane', 'lightning', 'bench', 'spoon', 'shorts', 'bird', 'tennis_racquet', 'hot_dog', 'power_outlet', 'cell_phone', 'knife', 'rainbow', 'bread', 'bed', 'headphones', 'hat', 'baseball', 'cookie', 'microphone', 'apple', 'key', 'basketball', 'eyeglasses', 'eye', 'line', 'triangle', 'book', 'pizza', 'circle', 'mushroom', 'face', 'snake', 'flower', 'dumbbell', 'traffic_light', 'ice_cream', 'hammer', 'moon', 'rifle', 'radio', 'donut', 'moustache', 'camera', 'pillow'],
    "turkish": ['şemsiye','kare','örümcek','kedi','kelebek','masa','uçak','yıldırım','tezgah','kaşık','şort','kuş','tenis raketi','sosis','priz','cep telefonu','bıçak','gökkuşağı','ekmek','yatak','kulaklık','şapka','beyzbol','çerez','mikrofon','elma','anahtar','basketbol','gözlük','göz','çizgi','üçgen','kitap','pizza','daire','mantar','yüz','yılan','çiçek','dambıl','trafik ışığı','ice_cream','çekiç','ay','tüfek','radyo','donut','bıyık','kamera','yastık']
};

/*
prepare the drawing canvas 
*/
$(function() {
    canvas = window._canvas = new fabric.Canvas('canvas');
    canvas.backgroundColor = '#ffffff';
    canvas.isDrawingMode = 0;
    canvas.freeDrawingBrush.color = "black";
    canvas.freeDrawingBrush.width = 7;
    canvas.renderAll();
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
    console.log(window.innerWidth);
    console.log(window.innerHeight-74);
})

/*
set the table of the predictions 
*/
function setTable(top5, probs) {
    console.log(top5);
    console.log(probs);
    let classList = [];
    if (modelLoaded) {
        top5.forEach(element => {
            console.log(element);
            classList.push(translate(element));
        });
        console.log("setTable, classList: ", classList);
        console.log("setTable, classList contains drawThis: ", drawThis);
        if (classList.includes(drawThis)) {
            setMessage('Tebrikler! ' + drawThis.toUpperCase() + ' görüyorum!');
        } else {
            setMessage(classList.slice(0,3).join(', ').toUpperCase() + ' görüyorum');
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
    loc = 'model2/class_names.txt'
    
    await $.ajax({
        url: loc,
        dataType: 'text',
    }).done(success);
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
    drawThis = translate(classNames[Math.floor(Math.random() * classNames.length)]);
    if (modelLoaded)
        setTitle(drawThis);
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
    model = await tf.loadLayersModel('model2/model.json')
    
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
    canvas.isDrawingMode = 1;
    modelLoaded = true;
    setTitle(drawThis);
}

/*
clear the canvas 
*/
function erase() {
    canvas.clear();
    canvas.backgroundColor = '#ffffff';
    coords = [];
    console.log("erase");
    setMessage("");
}

function next() {
    window.location.reload(false);
}

function setTitle(word) {
    console.log("setTitle");
    
    document.getElementById('draw-this').innerHTML = word.toUpperCase() + ' çizer misin?';
}

function setMessage(message) {
    console.log("setTitle");
    document.getElementById('i-see-things').innerHTML = message;
}

function translate(word) {
    index = dictionary.english.indexOf(word);
    return dictionary.turkish[index];
}