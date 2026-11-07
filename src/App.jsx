import React,{useEffect,useRef,useState} from "react";
import * as THREE from "three";

const bikes=[
 {name:"SAS SPORT",type:"Sport",power:180,color:"#e53935",speed:180},
 {name:"SAS NAKED",type:"Naked",power:150,color:"#2196f3",speed:150},
 {name:"SAS SCOOTER",type:"Scooter",power:125,color:"#ffca28",speed:125},
 {name:"SAS CLASSIC",type:"Classic",power:160,color:"#43a047",speed:160},
 {name:"SAS STREET",type:"Street",power:200,color:"#ab47bc",speed:200}
];
function makeBike(scene,color){
 const root=new THREE.Group(), paint=new THREE.MeshStandardMaterial({color,metalness:.55,roughness:.3}), black=new THREE.MeshStandardMaterial({color:0x15191d,roughness:.8}), metal=new THREE.MeshStandardMaterial({color:0x9ca3af,metalness:.8,roughness:.25});
 const sphere=(x,y,z,sx,sy,sz,mat)=>{const m=new THREE.Mesh(new THREE.SphereGeometry(1,20,14),mat);m.position.set(x,y,z);m.scale.set(sx,sy,sz);root.add(m);return m};
 const cyl=(x,y,z,r,h,mat,rot=0)=>{const m=new THREE.Mesh(new THREE.CylinderGeometry(r,r,h,20),mat);m.position.set(x,y,z);m.rotation.z=rot;root.add(m);return m};
 for(const x of [-.85,.85]){const wheel=new THREE.Mesh(new THREE.TorusGeometry(.43,.09,12,28),black);wheel.position.set(x,.48,0);root.add(wheel);const hub=new THREE.Mesh(new THREE.CylinderGeometry(.12,.12,.2,16),metal);hub.rotation.x=Math.PI/2;hub.position.set(x,.48,0);root.add(hub)}
 cyl(-.1,.72,0,.18,.75,metal,Math.PI/2);sphere(0,1.02,0,.62,.2,.28,paint);sphere(.1,1.25,0,.32,.17,.25,black);sphere(.58,1.15,0,.28,.12,.2,paint);
 cyl(.55,.9,0,.045,.55,metal,.25);cyl(-.55,.9,0,.045,.55,metal,-.25);
 const handle=new THREE.Mesh(new THREE.CylinderGeometry(.035,.035,.75,12),metal);handle.rotation.z=Math.PI/2;handle.position.set(-.7,1.35,0);root.add(handle);
 sphere(-.82,1.38,0,.16,.12,.16,paint);sphere(.82,1.38,0,.13,.1,.13,paint);
 cyl(.12,.83,.23,.1,.35,black,Math.PI/2);sphere(.2,.8,.25,.23,.18,.18,metal);
 root.position.y=0;scene.add(root);return root;
}
export default function App(){
 const mount=useRef(null), game=useRef({}),[selected,setSelected]=useState(0),[color,setColor]=useState(bikes[0].color),[mode,setMode]=useState("GARASI"),[speed,setSpeed]=useState(0),[sound,setSound]=useState(true);
 useEffect(()=>{
  const el=mount.current;if(!el)return;
  const scene=new THREE.Scene();scene.background=new THREE.Color(0x91c9e8);scene.fog=new THREE.Fog(0x91c9e8,35,130);
  const camera=new THREE.PerspectiveCamera(60,el.clientWidth/el.clientHeight,.1,300);camera.position.set(0,4.3,7.8);
  const renderer=new THREE.WebGLRenderer({antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.setSize(el.clientWidth,el.clientHeight);renderer.shadowMap.enabled=true;el.appendChild(renderer.domElement);
  scene.add(new THREE.HemisphereLight(0xffffff,0x566677,2));const sun=new THREE.DirectionalLight(0xffffff,2.4);sun.position.set(-5,10,6);sun.castShadow=true;scene.add(sun);
  const ground=new THREE.Mesh(new THREE.PlaneGeometry(220,220),new THREE.MeshStandardMaterial({color:0x477b48}));ground.rotation.x=-Math.PI/2;ground.position.y=-.06;scene.add(ground);
  const road=new THREE.Mesh(new THREE.PlaneGeometry(9,180),new THREE.MeshStandardMaterial({color:0x30343a}));road.rotation.x=-Math.PI/2;road.position.set(0,0,-35);scene.add(road);
  for(let z=15;z>-120;z-=8){const line=new THREE.Mesh(new THREE.BoxGeometry(.13,.025,3.5),new THREE.MeshBasicMaterial({color:0xffffff}));line.position.set(0,.02,z);scene.add(line)}
  for(let side of [-1,1])for(let z=10;z>-120;z-=12){const trunk=new THREE.Mesh(new THREE.CylinderGeometry(.12,.2,1.4,7),new THREE.MeshStandardMaterial({color:0x60452d}));trunk.position.set(side*(7+Math.random()*8),.7,z);scene.add(trunk);const crown=new THREE.Mesh(new THREE.ConeGeometry(1.15,3,8),new THREE.MeshStandardMaterial({color:0x246b3a}));crown.position.set(trunk.position.x,2.6,z);scene.add(crown)}
  const bike=makeBike(scene,color);bike.position.z=2;
  const resize=()=>{camera.aspect=el.clientWidth/el.clientHeight;camera.updateProjectionMatrix();renderer.setSize(el.clientWidth,el.clientHeight)};window.addEventListener("resize",resize);
  let raf;const animate=()=>{raf=requestAnimationFrame(animate);const g=game.current;const moving=mode==="BERMAIN";if(moving){bike.position.x=THREE.MathUtils.clamp(bike.position.x+(g.steer||0)*.075,-3.2,3.2);bike.position.z-=g.go?-.12:.0;camera.position.x+=(bike.position.x*.45-camera.position.x)*.06;camera.lookAt(bike.position.x,.8,-2);bike.rotation.z=-(g.steer||0)*.12;}else{bike.rotation.y=Math.sin(Date.now()*.0005)*.08;camera.position.set(0,4.3,7.8);camera.lookAt(0,.8,0)}renderer.render(scene,camera)};
  animate();game.current={...game.current,bike,scene};return()=>{cancelAnimationFrame(raf);window.removeEventListener("resize",resize);renderer.dispose();el.removeChild(renderer.domElement);scene.clear()};
 },[mode]);
 useEffect(()=>{const b=game.current.bike;if(!b)return;const mat=b.children.find(x=>x.material?.color&&x.material.color.getHexString()!=="15191d"&&x.material.color.getHexString()!=="9ca3af");if(mat)mat.material.color.set(color)},[color,selected]);
 useEffect(()=>{const down=e=>{if(["ArrowLeft","a","A"].includes(e.key))game.current.steer=-1;if(["ArrowRight","d","D"].includes(e.key))game.current.steer=1;if(["ArrowUp","w","W"].includes(e.key)){game.current.go=true;setSpeed(80)}},up=e=>{if(["ArrowLeft","a","A","ArrowRight","d","D"].includes(e.key))game.current.steer=0;if(["ArrowUp","w","W"].includes(e.key)){game.current.go=false;setSpeed(0)}};window.addEventListener("keydown",down);window.addEventListener("keyup",up);return()=>{window.removeEventListener("keydown",down);window.removeEventListener("keyup",up)}},[]);
 const choose=i=>{setSelected(i);setColor(bikes[i].color);setMode("GARASI")};
 const hold=(key,val)=>e=>{e.preventDefault();game.current[key]=val};
 return <main><header><div><b>SAS MOTOR CUSTOM</b><small>CILEDUG • 3D MOTOR GAME</small></div><span className="status">OPEN WORLD</span></header><section className="stage"><div className="scene" ref={mount}/><div className="hud"><span>{mode==="GARASI"?"BENGKEL CUSTOM":"JALAN RAYA CILEDUG"}</span><strong>{speed} <small>KM/J</small></strong></div><div className="help">Geser motor dengan tombol • W / A / S / D</div></section><section className="panel"><div className="tabs"><button className={mode==="GARASI"?"active":""} onClick={()=>setMode("GARASI")}>GARASI</button><button className={mode==="BERMAIN"?"active":""} onClick={()=>setMode("BERMAIN")}>MULAI BERMAIN</button></div><h3>PILIH MOTOR ({selected+1}/5)</h3><div className="bikes">{bikes.map((b,i)=><button key={b.name} className={selected===i?"bike selected":"bike"} onClick={()=>choose(i)}><i style={{background:b.color}}/><b>{b.name}</b><small>{b.type} • {b.power} CC</small></button>)}</div><div className="custom"><label>WARNA BODY</label><input aria-label="Warna body" type="color" value={color} onChange={e=>setColor(e.target.value)}/><span>{bikes[selected].name}</span><button className="sound" onClick={()=>setSound(!sound)}>{sound?"SUARA: ON":"SUARA: OFF"}</button></div>{mode==="BERMAIN"&&<div className="controls"><button onPointerDown={hold("steer",-1)} onPointerUp={hold("steer",0)} onPointerLeave={hold("steer",0)}>◀</button><button onPointerDown={hold("go",true)} onPointerUp={hold("go",false)} onPointerLeave={hold("go",false)}>GAS ▲</button><button onPointerDown={hold("steer",1)} onPointerUp={hold("steer",0)} onPointerLeave={hold("steer",0)}>▶</button></div>}</section><footer>SAS SOUL ART SYSTEM © 2026</footer></main>
}