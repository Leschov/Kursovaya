// 1. Визначення змінних
let canvas,
    c,
    size,
    input,
    solveBtn,
    clicked = false,
    path = [],
    TWOPI = 2*Math.PI,
    tmp;

// 2. Запуск робочої області
window.onload = () => {
    init()
};

// 3. Функція ініціалізації робочої області
function init(){

    // 3.1. Створення елемета <canvas width="500" height="500"></canvas>
    canvas = document.createElement("canvas");
    size = 500;
    canvas.width = size;
    canvas.height = size;
    c = canvas.getContext("2d");

    // 3.2. Налаштування холста та пензля для малювання фігур
    c.fillStyle = "#f4f4ef";
    c.fillRect(0,0,size,size);
    c.fillStyle = "#20232a";

    // 3.3. Підготовка блоку <div class="main" id="main"> Завантаження... </div>, очищення його від зайвих елементів
    const main = document.getElementById("main");
    main.innerHTML = "";

    // 3.4. Створення елементів всередині елемента <div id="main">...</div>
    const left = document.createElement("div");
    left.id = "left";
    const right = document.createElement("div");
    right.id = "right";

    input = document.createElement("input");
    input.type = "number";
    input.placeholder = "Кількість точок";
    input.value = 1000;

    solveBtn = document.createElement("button");
    solveBtn.innerText = "Розв'язати";
    solveBtn.addEventListener("click", solve ); // Виклик функції при натискані на кнопку "Розв'язати"

    const clear = document.createElement("button");
    clear.innerText = "Очистити";
    clear.addEventListener("click", erase); // Виклик функції при натискані на кнопку "Очистити"

    result = document.createElement("div");
    result.innerHTML = "<br>";

    // 3.5. Додання утворених елементів у відповідні блоки left та right
    right.appendChild(input);
    right.appendChild(clear);
    right.appendChild(solveBtn);
    right.appendChild(result);

    left.appendChild( canvas );

    main.appendChild(left);
    main.appendChild(right);
    document.body.appendChild(main);

    // 3.6. Обробка події при відпусканні кнопки миші
    canvas.addEventListener("mouseup", function(){
        clicked = false;
        path = [];
    });

    // 3.7. Обробка події при натисканні кнопки миші
    canvas.addEventListener("mousedown", function(e){
        clicked = true;
        drawPoint( getPos(e) );
    });

    // 3.8. Обробка події при натисканні на сенсорному екрані, або тачпаді
    canvas.addEventListener("touchstart", function(e){
        drawPoint( getPos(e) );
    });

    // 3.9. Обробка події при русі по сенсорному екрані або тачпаді
    canvas.addEventListener("touchmove", function(e){
        drawLine( getPos(e) );
    });

    // 3.10. Обробка події при русі мишки
    canvas.addEventListener("mousemove", function(e){
        if( clicked )
            drawLine( getPos(e) );
    });

    // 3.11. Обробка події при забиранні палься від сенсорного екрану або тачпаду
    canvas.addEventListener("touchend", function(e){
        path = [];
    });
}

// 4. Функція розв'язання задачі
const solve = function(){
    //4.1. Визначення зміних
    let inside = 0; // Початкова кількість точок всередині фігури

    const samples = input.value; // Кількість точок в квадраті

    if ( !tmp ){
        tmp = c.getImageData(0, 0, size, size); // Отримання нового об'єкту ImageData
    } else{
        c.clearRect(0, 0, size, size);
        c.putImageData(tmp,0,0); // Запис існуючого об'єкту ImageData
    }

    const newData = new Uint8Array(size*size);

    // 4.2. Визначення вільних та заповнених комірок на холсті і запис їх до масиву
    for(let i = 0; i < newData.length; i++){
        newData[i] = tmp.data[i*4];
    }

    c.fillStyle = "#d51b1b";

    // 4.3. Визначення рандомних координат точок та малювання їх на холсті
    for(let j = 0; j < samples; j++){
        const x = Math.round( Math.random() * size );
        const y = Math.round( Math.random() * size );

        if( newData[y*size+x] < 128 ){
            inside++;
        }

        // 4.4. Розставляння точок на холсті
        c.beginPath();
        c.arc(x,y,2,0,TWOPI);
        c.closePath();
        c.fill();

    }

    result.innerHTML = "<p><b>Кількість точок всередині</b>: " + inside + "шт.</p>"
                     + "<p><b>Кількість точок всього</b>: " + samples + "шт.</p>"
                     + "<p><b>Площа квадрата</b>: " + (size*size) + " мм<sup>2</sup></p><br>"
                     + "<p><b>Площа фігури</b>: " + (size*size) * inside/samples + " мм<sup>2</sup></p>";

};

// 5. Функція отримання координат елементів на фолсті
const getPos = function(e){
    e.preventDefault();

    let x, y;
    let rect = canvas.getBoundingClientRect();

    _x = canvas.width/rect.width;
    _y = canvas.height/rect.height;

    if( e.touches ){
        x = e.targetTouches[0].pageX * _x;
        y = (e.targetTouches[0].pageY-rect.y) * _y;
    }else{
        x = e.offsetX * _x;
        y = e.offsetY * _y;
    }
    return {x, y};
};

// 6. Функція малування фігури на холсті
const drawLine = function(p){

    path.push( {x: p.x, y: p.y} );

    c.fillStyle = "#20232a";

    if (path.length > 1) {
        c.beginPath();
        c.lineWidth = size/28 * 3;
        c.lineCap = "round";
        c.moveTo(path[path.length - 2].x, path[path.length - 2].y);
        c.lineTo(path[path.length - 1].x, path[path.length - 1].y);
        c.stroke();
        path.shift();
    }

};

// 7. Функція малювання точок на холсті
const drawPoint = function(p){
    if( tmp ){
        c.clearRect(0,0,size,size);
        c.putImageData(tmp,0,0);
        tmp = null;
    }
    c.fillStyle = "#20232a";
    if( !path.length ){
        path.push( {x: p.x, y: p.y} );
        c.beginPath();
        c.arc(p.x, p.y, (size/28 * 3)/2, 0, Math.PI*2);
        c.fill();
    }
};

// 8. Функція очищення холста від ліній і точок
const erase = function(){
    tmp = null;
    c.fillStyle = "#f4f4ef";
    c.fillRect(0,0,size,size);
    c.fillStyle = "#20232a";
    result.innerHTML = "<br>";
};
