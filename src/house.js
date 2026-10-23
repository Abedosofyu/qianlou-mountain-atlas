// A small orthographic 3-D renderer. Geometry is an educational schematic,
// not a reconstruction of a measured or named building.
const NS='http://www.w3.org/2000/svg';
export class TimberHouse {
  constructor(svg, onSelect=()=>{}) {
    this.svg=svg; this.onSelect=onSelect;
    this.yaw=-0.55; this.mode='whole'; this.selected='stilts'; this.zoom=1; this.stage=4;
    this.svg.addEventListener('click',e=>{
      const el=e.target.closest('[data-part]'); if(el){this.selected=el.dataset.part;this.onSelect(this.selected);this.render();}
    });
    this.render();
  }
  set(patch){Object.assign(this,patch);this.render();}
  render(){
    const angle=this.yaw, c=Math.cos(angle), s=Math.sin(angle), exploded=this.mode==='explode';
    const spread=part=>exploded?({roof:112,rail:57,floor:40,beam:40,column:22,stilts:0}[part]||0):0;
    const project=([x,y,z],part='')=>{
      const xx=x*c-z*s, zz=x*s+z*c;
      return [420+xx*1.23*this.zoom,480+zz*.49*this.zoom-(y+spread(part))*this.zoom];
    };
    let polys=[];
    const face=(vertices,fill,part='',stroke='#634f3a',opacity=1)=>{
      const depth=vertices.reduce((sum,[x,y,z])=>sum+x*s+z*c-y*.006,0)/vertices.length;
      const points=vertices.map(v=>project(v,part).map(n=>n.toFixed(1)).join(',')).join(' ');
      const active=part===this.selected;
      polys.push({depth,html:`<polygon points="${points}" fill="${active?'#b9653b':fill}" stroke="${active?'#80432b':stroke}" stroke-width="${active?1.2:.75}" opacity="${opacity}" ${part?`data-part="${part}"`:''}/>`});
    };
    const box=(x,y,z,w,h,d,part,colors=['#a58b61','#745e42','#c4a777'])=>{
      face([[x,y,z],[x+w,y,z],[x+w,y+h,z],[x,y+h,z]],colors[0],part);
      face([[x+w,y,z],[x+w,y,z+d],[x+w,y+h,z+d],[x+w,y+h,z]],colors[1],part);
      face([[x,y,z+d],[x,y,z],[x,y+h,z],[x,y+h,z+d]],colors[1],part);
      face([[x+w,y,z+d],[x,y,z+d],[x,y+h,z+d],[x+w,y+h,z+d]],colors[0],part);
      face([[x,y+h,z],[x+w,y+h,z],[x+w,y+h,z+d],[x,y+h,z+d]],colors[2],part);
    };
    const beamBetween=(a,b,width,part)=>{
      const [x,y,z]=a, [u,v,w]=b;
      if(y===v&&z===w)box(Math.min(x,u),y-width/2,z-width/2,Math.abs(u-x),width,width,part);
      else if(x===u&&y===v)box(x-width/2,y-width/2,Math.min(z,w),width,width,Math.abs(w-z),part);
      else {
        const points=[project(a,part),project(b,part)];
        const depth=(x*s+z*c+u*s+w*c)/2;
        polys.push({depth,html:`<path d="M${points[0]} L${points[1]}" stroke="${part===this.selected?'#b9653b':'#846644'}" stroke-width="${width*this.zoom}" stroke-linecap="square" data-part="${part}"/>`});
      }
    };
    const groundY=(x,z)=>-17+z*.20;
    face([[-202,groundY(-202,-142),-142],[202,groundY(202,-142),-142],[202,groundY(202,142),142],[-202,groundY(-202,142),142]],'#d5d6be','', '#b7bba3');
    face([[-202,groundY(-202,142),142],[202,groundY(202,142),142],[202,-65,142],[-202,-65,142]],'#b6b8a1','', '#b7bba3');
    face([[202,groundY(202,-142),-142],[202,groundY(202,142),142],[202,-65,142],[202,-65,-142]],'#c3c4ad','', '#b7bba3');
    for(const x of [-135,0,135]) for(const z of [-83,83]){
      const gy=groundY(x,z);
      if(this.stage>=1)box(x-13,gy,z-13,26,13,26,'', ['#a6a596','#858d80','#d0cbbc']);
      if(this.stage>=2){
        box(x-5,gy+13,z-5,10,105-gy-13,10,'stilts');
        if(this.stage>=3) box(x-5,105,z-5,10,171,10,'column');
      }
    }
    if(this.stage>=2){
      for(const z of [-83,83]) for(const x of [-135,0]) {
        beamBetween([x,20,z],[x+135,104,z],5,'stilts');
        beamBetween([x,104,z],[x+135,25,z],5,'stilts');
      }
    }
    if(this.stage>=3){
      for(const y of [108,194,280]){
        for(const z of [-85,85])box(-150,y-6,z-5,300,10,10,'beam');
        for(const x of [-138,0,138])box(x-5,y-6,-100,10,10,200,'beam');
      }
      for(const y of [111,197]){
        box(-155,y,-105,310,4,210,'floor',['#b69a6b','#897556','#c7b487']);
        // Floor seams and veranda uprights make the structural drawing legible.
        for(let x=-147;x<156;x+=20)face([[x,y+4.3,-104],[x+.6,y+4.3,-104],[x+.6,y+4.3,104],[x,y+4.3,104]],'#ad956e','floor','#ad956e');
        for(const z of [-103,103]) {
          box(-155,y+38,z-2,310,4,4,'rail');
          for(let x=-150;x<=150;x+=25)box(x-1.7,y+4,z-1.7,3.4,34,3.4,'rail');
        }
        for(const x of [-153,153]) {
          box(x-2,y+38,-103,4,4,206,'rail');
          for(let z=-100;z<=100;z+=25)box(x-1.7,y+4,z-1.7,3.4,34,3.4,'rail');
        }
      }
      // Back room walls leave the veranda and load-bearing frame visible.
      if(this.mode!=='force'){
        for(const y of [119,205]) {
          for(const x of [-104,-53,0,53,104])box(x-21,y,-46,42,65,4,'column',['#89724e','#705a3c','#ac9160']);
          for(const x of [-100,0,100]) {
            box(x-14,y+23,-50,28,29,3,'column',['#3e493e','#3e493e','#88724f']);
            box(x-1,y+23,-53,2,29,3,'column');
            box(x-14,y+36,-53,28,2,3,'column');
          }
        }
      }
      for(let step=0;step<8;step++) box(-192,12+step*12.2,121-step*7.2,39,5,13,'floor');
    }
    if(this.stage>=4){
      face([[-176,278,-120],[176,278,-120],[146,330,0],[-146,330,0]],'#4c554b','roof','#344039');
      face([[-146,330,0],[146,330,0],[176,278,120],[-176,278,120]],'#687064','roof','#344039');
      face([[-176,278,-120],[-146,330,0],[-176,278,120]],'#a58b61','roof');
      face([[176,278,120],[146,330,0],[176,278,-120]],'#a58b61','roof');
      for(let x=-170;x<170;x+=11) {
        beamBetween([x,280,-120],[x*.84,331,0],1,'roof');
        beamBetween([x*.84,331,0],[x,280,120],1,'roof');
      }
      beamBetween([-157,333,0],[157,333,0],6,'roof');
      for(const z of [-120,120])beamBetween([-183,278,z],[183,278,z],5,'roof');
    }
    polys.sort((a,b)=>a.depth-b.depth);
    let flow='';
    if(this.mode==='force'){
      for(const x of [-135,135]) {
        const points=[project([x,300,84]),project([x,202,84]),project([x,112,84]),project([x,10,84])];
        flow+=`<path d="M${points.map(p=>p.join(',')).join(' L')}" class="load-path" marker-end="url(#load-arrow)"/>`;
      }
    }
    this.svg.innerHTML=`<defs><marker id="load-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M0 0 10 5 0 10z" fill="#a85135"/></marker></defs><ellipse cx="420" cy="528" rx="260" ry="49" fill="#788471" opacity=".09"/>${polys.map(p=>p.html).join('')}${flow}`;
  }
}
