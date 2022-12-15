/* bem130 2022 */
/* https://github.com/neknaj/3d */

/* customized for Neknaj Virtual World */

type vert = [number[], number[], number[], number[], number];

export default class tdDRAW {
    private campos: number[];
    private camangle: number[];
    public display: number[];
    private obj: vert[];
    private frame: number;
    private trifv: number[] = [];
    
    constructor() {
        this.campos = [0,0,0];
        this.camangle = [0,0];
        this.display = [1920,1080];
        this.obj = [];
        this.frame = 0;
    }
    setObj(obj: vert[]|number[][][]) {
        if (typeof obj[0][4] == "number") {
            // Obj is just vert[]
            this.obj = obj as vert[];
        } else {
            // Obj is number[][]
            this.obj = this.updateLengthToPolygon(obj as number[][][]);
        }
    }
    setCamera(camera: number[][]) {
        this.campos = camera[0];
        this.camangle = [camera[1][0]*(Math.PI/180),camera[1][1]*(Math.PI/180)];
        this.display = camera[2];
    }

    getImg(): ImageData {
        this.frame++;
        const x = this.display[0];
        const y = this.display[1];
        const maxlen = 100000;
        const iarr = new Uint8ClampedArray(x*y*4).fill(0);
        const sky = [114, 174, 239]
        for (let iy = 0; iy < y; iy++) {
            for (let ix = 0; ix < x; ix++) {
                let index = (iy*x+ix)*4; // index of position [ix,iy]
                iarr[index+0] = sky[0]; // Red
                iarr[index+1] = sky[1]; // Green
                iarr[index+2] = sky[2]; // Blue
                iarr[index+3] = 255; // Alpha
            }
        }
        const zbuf = new Array(x*y).fill(maxlen);
        const polygons = this.sortP(this.obj);
        const vl = this.VNormalized([30,25,30]); // 平行光源
        this.trifv = [Math.sin(this.camangle[0]),Math.cos(this.camangle[0]),Math.sin(-this.camangle[1]),Math.cos(this.camangle[1])];
        for (let i=0;i<polygons.length;i++) {
            let t = polygons[i];

            // 各頂点の投影
            const p1 = this.pos_3t2d(t[0]);
            const p2 = this.pos_3t2d(t[1]);
            const p3 = this.pos_3t2d(t[2]);

            //if (p1[2]&&p2[2]&&p3[2]) {continue;}

            let v12 = [t[1][0]-t[0][0],t[1][1]-t[0][1],t[1][2]-t[0][2]];
            let v13 = [t[2][0]-t[0][0],t[2][1]-t[0][1],t[2][2]-t[0][2]];
            let normal = this.VNormalized(this.VCProduct(v12,v13)); //法線ベクトル
            let angl = this.VIProduct(vl,normal); // 0<=normal<=1
            let light = (Math.max(angl,angl*0.1)*0.9+0.3)*(10000/((polygons[i][4])+10000)); // 面と平行光源の角度
            
            // 三角形を描画する範囲
            let xmax = Math.min(Math.max(p1[0],p2[0],p3[0]),this.display[0]);
            let xmin = Math.max(Math.min(p1[0],p2[0],p3[0]),0);
            let ymax = Math.min(Math.max(p1[1],p2[1],p3[1]),this.display[1]);
            let ymin = Math.max(Math.min(p1[1],p2[1],p3[1]),0);

            for (let iy = ymin; iy < ymax; iy++) {
                for (let ix = xmin; ix < xmax; ix++) {
                    let idex = iy*x+ix; // 描画するアドレス
                    if (true) { // 既に描画されていない確認
                        if (this.inclusion([ix,iy],[p1,p2,p3])) { // 三角形の内外判定
                            let td = this.is_p( [p1,[ix,iy]],[p2,p3]);

                            let al = this.length3d([this.campos,t[0]]);
                            let bl = this.length3d([this.campos,t[1]]);
                            let cl = this.length3d([this.campos,t[2]]);
                            let dl = bl+(this.length2d([p2,td as number[]])/this.length2d([p2,p3]))*(cl-bl);
                            let pl = al+(this.length2d([p1,[ix,iy]])/this.length2d([p1,td as number[]]))*(dl-al);

                            let ap = (p1[2]as any as number[])[1];
                            let bp = (p2[2]as any as number[])[1];
                            let cp = (p3[2]as any as number[])[1];
                            let dp = bp+(this.length2d([p2,td as number[]])/this.length2d([p2,p3]))*(cp-bp);
                            let pp = ap+(this.length2d([p1,[ix,iy]])/this.length2d([p1,td as number[]]))*(dp-ap);

                            if (pp>0&&zbuf[idex]>pl) {
                                zbuf[idex] = pl;
                                let index = idex*4;
                                light = (angl*0.9+0.3)*(1500000/(pl**2+1500000)); // 面と平行光源の角度
                                let slight = 1-(1500000/(pl**2+1500000))
                                iarr[index+0] = sky[0]*slight+t[3][0]*light; // 赤の描画
                                iarr[index+1] = sky[1]*slight+t[3][1]*light; // 緑の描画
                                iarr[index+2] = sky[2]*slight+t[3][2]*light; // 青の描画
                            }
                        }
                    }
                }
            }
        }
        return new ImageData(iarr,x,y);
    }

    pos_3t2d(pos: number[]): number[] {
        let p1 = this.rotate3d_x(this.rotate3d_z([pos[0]-this.campos[0],pos[1]-this.campos[1],pos[2]-this.campos[2]]));
        let l = Math.abs(14/(p1[1]));
        let s = this.display[0]/40;
        let d = [p1[0]*l*s+this.display[0]/2,-p1[2]*l*s+this.display[1]/2];
        return [Math.floor(d[0]),Math.floor(d[1]),p1 as any as number];
    }
    sortP(ps: vert[]): vert[] {
        ps.sort((a, b) => a[4]-b[4]>0?-1:a[4]<b[4]?1:0);
        return ps;
    }
    updateLengthToPolygon(ps:number[][][]): vert[] {
        return ps.map(p => 
            [p[0], p[1], p[2], p[3], this.squared_length3d([this.campos,this.gcot([p[0],p[1],p[2]])])] as vert
        );
    }
    gcot(t3ds: number[][]): number[] {
        return [(t3ds[0][0]+t3ds[1][0]+t3ds[2][0])/3,(t3ds[0][1]+t3ds[1][1]+t3ds[2][1])/3,(t3ds[0][2]+t3ds[1][2]+t3ds[2][2])/3];
    }
    
    is_p(l1:number[][], l2:number[][]): number[] | null[] { // intersection point from 2 lines
        // 参考 https://mf-atelier.sakura.ne.jp/mf-atelier2/a1/
        let div = (l1[1][1]-l1[0][1])*(l2[1][0]-l2[0][0])-(l1[1][0]-l1[0][0])*(l2[1][1]-l2[0][1])
        if (div==0) {return [null,null]}
        let d1 = l2[0][1]*l2[1][0]-l2[0][0]*l2[1][1]
        let d2 = l1[0][1]*l1[1][0]-l1[0][0]*l1[1][1]
        let x = (d1*(l1[1][0]-l1[0][0])-d2*(l2[1][0]-l2[0][0]))/div
        let y = (d1*(l1[1][1]-l1[0][1])-d2*(l2[1][1]-l2[0][1]))/div
        return [x,y];
    };
    squared_length3d(pos: number[][]): number {
        return (pos[0][0]-pos[1][0])**2+(pos[0][1]-pos[1][1])**2+(pos[0][2]-pos[1][2])**2;
    }
    length3d(pos: number[][]): number {
        return Math.sqrt((pos[0][0]-pos[1][0])**2+(pos[0][1]-pos[1][1])**2+(pos[0][2]-pos[1][2])**2);
    }
    length2d(pos: number[][]): number {
        return Math.sqrt( (pos[0][0]-pos[1][0])**2+(pos[0][1]-pos[1][1])**2 );
    }

    VCProduct(a: number[],b:number[]): number[] { // Vector-Cross-Product ベクトルの外積
        return [a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
    }

    VIProduct(a:number[],b:number[]) { // ベクトルの内積
        return a[0]*b[0]+a[1]*b[1]+a[2]*b[2];
    }
    VMM3(a:number[]): number[] { // ベクトルのマイナス1倍
        return [-a[0],-a[1],-a[2]];
    }

    VNormalized(a: number[]):number[] { // ベクトルの正規化
        let l = this.length3d([[0,0,0],a]);
        return [a[0]/l,a[1]/l,a[2]/l];
    }
    inclusion(p1: number[], carr:number[][]): boolean { // 三角形の内外判定
        let a = [carr[0][0]-p1[0],carr[0][1]-p1[1]];
        let b = [carr[1][0]-p1[0],carr[1][1]-p1[1]];
        let c = [carr[2][0]-p1[0],carr[2][1]-p1[1]];
        let ab = a[0]*b[1]-a[1]*b[0];
        let bc = b[0]*c[1]-b[1]*c[0];
        let ca = c[0]*a[1]-c[1]*a[0];
        return ab<=0&&bc<=0&&ca<=0;
    };
    rotate3d_x(pos: number[]): number[] { // x軸のみの回転
        return [pos[0],pos[1]*this.trifv[3]-pos[2]*this.trifv[2],pos[1]*this.trifv[2]+pos[2]*this.trifv[3]];
    }
    rotate3d_z(pos: number[]): number[] { // z軸のみの回転
        return [pos[0]*this.trifv[1]-pos[1]*this.trifv[0],pos[0]*this.trifv[0]+pos[1]*this.trifv[1],pos[2]];
    }
}