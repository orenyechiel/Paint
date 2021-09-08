const app = Vue.createApp({
    data() {
        return {
            isPainting: false,
            penWidth: 1,
            brushColor: "#000000",
            canvasBg: "#ffffff",
            mousePosX: null,
            mousePosY: null,

            savedImages: []
        }
    },
    methods: {
        drawing(event) {
            const canvas = event.target;
            const context = canvas.getContext('2d');

            // drawing actions panel
            this.canvasPanel(canvas, context);

            // canvas events handler
            if (event.type === 'mousedown') {

                context.beginPath();
                context.moveTo(event.clientX - canvas.offsetLeft,
                    event.clientY - canvas.offsetTop);
                this.isPainting = true;

            } else if (event.type === 'mousemove') {
                this.draw(event, canvas, context);

            } else if (event.type === 'mouseup') {
                this.stopDraw(event, context);

            } else if (event.type === 'mouseout') {
                this.isPainting = false;
            }
        },
        draw(e, el, ctx) {
            if (this.isPainting) {
                ctx.lineTo(e.clientX - el.offsetLeft, e.clientY - el.offsetTop);
                ctx.lineCap = 'round';
                ctx.lineJoin = 'round';
                ctx.stroke();
            }
        },
        stopDraw(e, ctx) {
            if (this.isPainting) {
                ctx.stroke();
                ctx.closePath();
                this.isPainting = false;
            }
        },

        getPos(e){
            const canvas = this.$refs.theCanvas;
            this.mousePosX = e.clientX - canvas.offsetLeft;
            this.mousePosY = e.clientY - canvas.offsetTop;
        },

        canvasPanel(canvas, ctx) {
            ctx.lineWidth = this.penWidth;
            ctx.strokeStyle = this.brushColor;
        },

        imageLoader(){

            // get the canvas
            const canvas = this.$refs.theCanvas;
            const ctx = canvas.getContext('2d');

            // get the file
            const input = this.$refs.fileLoad;

            const file = input.files[0];
            const fr = new FileReader();

            fr.onload = function () {
                let img = new Image();
                img.onload = function (){
                    ctx.drawImage(img,0,0);
                };
                img.src = fr.result;
            };

            fr.readAsDataURL(file);
        },

        clearCanvas(e) {
            const canvas = this.$refs.theCanvas;
            const ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            this.canvasBg = '#ffffff';
        },

        saveImg() {
            const canvas = this.$refs.theCanvas;
            const newImageSrc = {id:Date.now(), src:canvas.toDataURL()};

            // to prevent from saving the empty (after clearing) canvas again i compare it with a blank canvas
            const blank = document.createElement('canvas');
            blank.width = canvas.width;
            blank.height = canvas.height;

            if (canvas.toDataURL() === blank.toDataURL()) {
                alert('the canvas is empty');
            } else {
                this.savedImages.push(newImageSrc);

                fetch('http://localhost:4400/saveimg', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(newImageSrc),
                })
                // .then(response => response.json())
                .then(data => {
                    console.log('Success:', data);
                })
                .catch((err) => {
                    console.error(err);
                });
            }
        },

        clearAllImages() {
            fetch('http://localhost:4400/deleteAll', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                },
            })
            .then(response => response.json())
            .then(data => {
                this.savedImages = [];
            })
            .catch((err) => {
                console.error(err);
            });
        },

        getSavedCanvas(e){
            // todo: not yet finished
            const chosenImg = e.target.src;

            const canvas = this.$refs.theCanvas;
            const ctx = canvas.getContext('2d');


            let img = new Image();
            img.onload = function (){
                ctx.drawImage(img,0,0);
            };
            img.src = chosenImg;

            fetch('http://localhost:4400/', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({})
            })
            .then(response => response.json())
            .then(data => {
                console.log('Success:', data);
            })
            .catch((err) => {
                console.error(err);
            });
        }
    },

    // getting stored images from server on init
    mounted() {
        fetch('http://localhost:4400/', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        })
        .then(response => response.json())
        .then(data => {
            console.log('Success:', data);
            data.forEach(item => {
                this.savedImages.push(item);
            })
        })
        .catch((err) => {
            console.error(err);
        });
    }
})

window.addEventListener('load', () => {
    app.mount('#wrapper');
})

