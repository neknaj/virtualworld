import tdDRAW from "./3d";

type vert = [number[], number[], number[], number[], number];

function _getp(a: number[],b: number[],c: number[],d: number[],p: number[]) {
    const a1 = (p[0]-a[0])*(p[1]-a[1]);const a2 = (p[0]-b[0])*(b[1]-p[1]);
    const a3 = (c[0]-p[0])*(c[1]-p[1]);const a4 = (d[0]-p[0])*(p[1]-d[1]);
    return (a[2]*a1+b[2]*a2+c[2]*a3+d[2]*a4);
}
function getp(p: any[],s=1) {
    const minx = Math.floor(p[0]/(2**s))*(2**s);const maxx = minx+(2**s);
    const miny = Math.floor(p[1]/(2**s))*(2**s);const maxy = miny+(2**s);
    //const res = _getp([0,0,test8(maxx,maxy)],[0,1,test8(maxx,miny)],[1,1,test8(minx,miny)],[1,0,test8(minx,maxy)],[(p[0]-minx)/2**s,(p[1]-miny)/2**s]);
    const res = _getp([0,0,test8(maxx+s,maxy)],[0,1,test8(maxx+s,miny)],[1,1,test8(minx+s,miny)],[1,0,test8(minx+s,maxy)],[(p[0]-minx)/2**s,(p[1]-miny)/2**s]);
    return res;
}
function getheight(x: number,y: number,max=12,min=0) {
    let res = 0;
    for (let i=min;i<=max;i++) {
        res += getp([x,y],i)/(2**(max-i));
    }
    return (-10*Math.tanh(0.09*res-0.5)+res-3)*4
}
function test8(x: number,y: number) {
    const v = x*(2**12)+y+seed;
    const base = 500;
    let ret = 0;
    const times = 3;
    for (let i=1;i<=times;i++) {
        ret += ((Math.cos(v*base/i+i)**2))*((i**8));
        i++;
    }
    return Math.abs(ret/times*4+128)%1*400-200;
}

// let mapa = [-6500,100,5000,7500];
let mapa = [-65,1,5,7];
const seed = Math.random()*100;
const buf: any[][] = [];
const psize = 16;
mapa = [Math.floor(mapa[0]/psize)*psize,Math.floor(mapa[1]/psize)*psize,Math.floor(mapa[2]/psize)*psize,Math.floor(mapa[3]/psize)*psize];
console.log(mapa);
console.log("seed:",seed);
console.log("start calc");
for (let y=mapa[1];y<mapa[3];y+=psize) {
    const bufc = [];
    for (let x=Math.floor(mapa[0]/psize)*psize;x<mapa[2];x+=psize) {
        bufc.push(getheight(x,y));
    }
    buf.push(bufc);
}
function height(x: number,y: number): number {
    return buf[(y-mapa[1])/psize][(x-mapa[0])/psize];
}
//height = getheight

let obj:number[][][] = [];
let color = [255,255,255];
let water = [1,18,200];

console.log("start making polygon")
for (let y=mapa[1]+psize;y<mapa[3]-psize;y+=psize*2) {
    const p = psize;
    for (let x=mapa[0]+psize;x<mapa[2]-psize;x+=psize*2) {
        const y_=y;const x_=x;
        // 地面
        let value = height(x,y)
        value = value*0.3
        color = [132-value, 131-value, 79-value]
        obj.push([[x_,y_,height(x,y)],[x_,y_-p,height(x,y-p)],[x_+p,y_-p,height(x+p,y-p)],color]);
        obj.push([[x_,y_,height(x,y)],[x_+p,y_-p,height(x+p,y-p)],[x_+p,y_,height(x+p,y)],color]);
        obj.push([[x_,y_,height(x,y)],[x_+p,y_,height(x+p,y)],[x_+p,y_+p,height(x+p,y+p)],color]);
        obj.push([[x_,y_,height(x,y)],[x_+p,y_+p,height(x+p,y+p)],[x_,y_+p,height(x,y+p)],color]);
        obj.push([[x_,y_,height(x,y)],[x_,y_+p,height(x,y+p)],[x_-p,y_+p,height(x-p,y+p)],color]);
        obj.push([[x_,y_,height(x,y)],[x_-p,y_+p,height(x-p,y+p)],[x_-p,y_,height(x-p,y)],color]);
        obj.push([[x_,y_,height(x,y)],[x_-p,y_,height(x-p,y)],[x_-p,y_-p,height(x-p,y-p)],color]);
        obj.push([[x_,y_,height(x,y)],[x_-p,y_-p,height(x-p,y-p)],[x_,y_-p,height(x,y-p)],color]);
        // 水面
        if (height(x,y)<2) {
            water = [1,1,30-height(x,y)*0.2];
            obj.push([[x_-p,y_-p,0],[x_+p,y_-p,0],[x_+p,y_+p,0],water]);
            obj.push([[x_-p,y_-p,0],[x_+p,y_+p,0],[x_-p,y_+p,0],water]);
        }
    }
}


const tddraw = new tdDRAW();
tddraw.setCamera([[0,0,18],[0,0],[640,480]]);

tddraw.setCamera([[0,-90,70],[0,0],[640,480]]);
tddraw.setCamera([[-5,-8,7],[0,0],[640,480]]);
tddraw.setCamera([[0,-90,70],[0,0],[640,480]]);
tddraw.setCamera([[10,155,3],[0,0],[640,480]]);
tddraw.setCamera([[100,110,100],[0,0],[640,480]]);
tddraw.setCamera([[200,151,12],[0,0],[640,480]]);
tddraw.setCamera([[200,151,20],[0,0],[1920,1080]]);
tddraw.setCamera([[-500,150,700],[0,0],[1920,1080]]);
//tddraw.setCamera([[-300,110,100],[0,0],[1920,1080]]);
//tddraw.setCamera([[0,-90,70],[0,0],[640,480]]);
//tddraw.setCamera([[100,350,250],[0,-90],[640,480]]);

tddraw.setObj(obj);
const co  = document.getElementById("imgOut") as HTMLCanvasElement;
const ctx = co.getContext('2d');
if (!ctx) throw "No canvas context";

co.height =tddraw.display[1];co.width=tddraw.display[0];

console.log("start render")
const img = tddraw.getImg();
ctx.putImageData(img,0,0);

// resize window
function resizeImg() {
    const [dw, dh] = tddraw.display;
    const bottom_area = 0;
    let rw = 0;
    let rh = 0;
    const ww = window.innerWidth;
    const wh = window.innerHeight-bottom_area;
    let csc = 1
    const hcsc = ww/dw; const wcsc = wh/dh;
    if (hcsc>wcsc) {
        csc = wcsc; rw = (ww - dw*csc)/2;
    } else {
        csc = hcsc; rh = (wh - dh*csc)/2;
    }

    const imgOut = document.getElementById("imgOut");
    if (!imgOut) return;
    imgOut.style.marginTop    = `${rh}px`;
    imgOut.style.marginBottom = `${rh}px`;
    imgOut.style.marginLeft   = `${rw}px`;
    imgOut.style.marginRight  = `${rw}px`;
    imgOut.style.transform    = `scale(${csc},${csc})`;
};
window.onresize = resizeImg;
resizeImg(); // first resize