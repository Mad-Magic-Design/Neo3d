const apiKey='vIk5HjBg2FMCeqryhaithGcjitdJIRWyRT3pooEK'
const demoKey = 'DEMO_KEY'

var today = new Date();
var dd = String(today.getDate()).padStart(2, '0');
var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
var yyyy = today.getFullYear();

today = yyyy +'-' + mm + '-' + dd

const demoRequestLink ='https://jsonplaceholder.typicode.com/users'

const requestLink = 'https://api.nasa.gov/neo/rest/v1/feed?start_date='+today+ '&end_date='+today+'&api_key=' + apiKey;

let fetchedData
let neoSelected = false
let lastSelected

function normalize (x, xMin, xMax){
  return (x-xMin)/(xMax - xMin)
}




async function getData() { 
    await fetch(requestLink, {
    method:"GET",
  })
  .then((response)=>{
    if (!response.ok) {
      throw new Error(
        `This is an HTTP error: The status is ${response.status}`
      );
    }
    return response.json();
  })
  .then((data)=> fetchedData = Object.values(data.near_earth_objects)[0])

  fetchedData.sort((a,b)=>{   //put this down a few lines
    return a.close_approach_data[0].miss_distance.lunar -b.close_approach_data[0].miss_distance.lunar
  })

  const neoInfoObjects = fetchedData.map(info=>({
    neoName: info.name,
    diameter: parseFloat(info.estimated_diameter.kilometers.estimated_diameter_max).toFixed(3),
    closestLunar: parseFloat(info.close_approach_data[0].miss_distance.lunar).toFixed(1),
    speedkms: parseFloat(info.close_approach_data[0].relative_velocity.kilometers_per_second).toFixed(4),
    closestTime: (info.close_approach_data[0].close_approach_date_full.slice(-6,-3) + info.close_approach_data[0].close_approach_date_full.slice(-2)).trim()
  }))
  if(neoInfoObjects.length>5) neoInfoObjects.length=5

  console.log('neo', neoInfoObjects)

  const normalizedLunars = neoInfoObjects.map(dataObj=>normalize(dataObj.closestLunar, neoInfoObjects[0].closestLunar, neoInfoObjects[4].closestLunar))
  console.log('nl', normalizedLunars)
  const sortedSpeed = [...neoInfoObjects].sort((a,b)=>{
    return a.speedkms-b.speedkms
  })
  console.log('sorted', sortedSpeed)
  const normalizedSpeed = neoInfoObjects.map(dataObj => normalize(dataObj.speedkms, sortedSpeed[0].speedkms, sortedSpeed[4].speedkms))
  console.log('ns', normalizedSpeed)

  const neoData = neoInfoObjects.map((neoObj, index)=>{  //don't need y animated anymore
    return {
      //radius: neoObj.diameter*25+10,
      //radius: neoObj.diameter*15+10,
      radius: neoObj.diameter*10+10,
      x:-650,
      targetX: 1300*normalizedSpeed[index]-650,  //maxdistance * normalized - half of maxed distance
      y: 1000*normalizedLunars[index] - 400,
      targetY: 1000*normalizedLunars[index] - 400,
      data: neoObj,
    }
  })

  

  $("#loading-text").text('select NEO to see data')



  const zoomOutDelay = 2000
  const movementTime = 4000
  const squareSize = (window.innerWidth<window.innerHeight)?window.innerWidth*0.7:window.innerHeight*0.7
  //const squareSize = 660


  const scene = new THREE.Scene();
  scene.add(new THREE.AmbientLight(0x333333));
  
  //const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
  const camera = new THREE.PerspectiveCamera( 75, 1, 0.1, 1000 );
 
  const directionalLight = new THREE.DirectionalLight( 0xF4E99B, 1);
  scene.add( directionalLight );
  directionalLight.position.set(0, -1000, 0)
  const light = new THREE.AmbientLight( 0x404040 ); // soft white light
  scene.add( light );
 

  const renderer = new THREE.WebGLRenderer({canvas: space} );
 // renderer.setSize( window.innerWidth, window.innerHeight );
  renderer.setSize( squareSize, squareSize );


  let geometry = new THREE.SphereGeometry( 20, 64, 64 );
  //let material = new THREE.MeshBasicMaterial( { color: 0x287AB8 } );
  let texture = new THREE.TextureLoader().load( 'images/earth.jpg' );
  let material = new THREE.MeshPhongMaterial({
    specular: new THREE.Color('grey'),
    map: texture
  })
  const earth = new THREE.Mesh( geometry, material );
  earth.rotateX(45)
  scene.add( earth );


  geometry = new THREE.SphereGeometry( 4, 64, 64);
  material = new THREE.MeshBasicMaterial( { color: 0x909090 } );
  const moonTexture = new THREE.TextureLoader().load( 'images/moon.webp' );
  material = new THREE.MeshPhongMaterial({ color: 0x909090 ,
    map: moonTexture})
  const moon = new THREE.Mesh( geometry, material );
  moon.rotateX(45)
  scene.add( moon );

  camera.position.z = 100;
  moon.position.x = 25;
  moon.position.y=25;


  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();
  
  function onMouseMove( event ) {
    mouse.x = ( ( event.clientX - renderer.domElement.offsetLeft ) / renderer.domElement.clientWidth ) * 2 - 1;
    mouse.y = - ( ( event.clientY - renderer.domElement.offsetTop ) / renderer.domElement.clientHeight ) * 2 + 1;
  }
  
  window.addEventListener( 'mousemove', onMouseMove );

  const selectedMaterial = new THREE.MeshBasicMaterial( { color: 0xFFA500 } );

  function animate(t) {
    
    requestAnimationFrame( animate );
    TWEEN.update(t);

    // update the picking ray with the camera and pointer position
    raycaster.setFromCamera( mouse , camera );
    

    // calculate objects intersecting the picking ray
    const intersects = raycaster.intersectObjects( scene.children );
    if (intersects[0] && intersects[0].object.userData.data){
        showData(intersects[0].object.userData.data)
        intersects[0].object.material = selectedMaterial
        if (lastSelected && lastSelected !== intersects[0].object){
         lastSelected.material=new THREE.MeshPhongMaterial({
          map: neoTexture,
          color: 0x909090,
        })
      } 
        lastSelected = intersects[0].object
    }

    /*for ( let i = 0; i < intersects.length; i ++ ) {

      console.log(intersects[i].object.userData.data)

    }*/


    renderer.render( scene, camera );
  };

  animate();

  const cameraTween = new TWEEN.Tween({z:100})
  .to({z:1000}, 4000)
  .onUpdate((coords)=>{
    camera.position.z=coords.z
  })
  .easing(TWEEN.Easing.Quadratic.InOut)
  .delay(2000)
  cameraTween.start()

  const earthTween = new TWEEN.Tween({ x: 0, y: 0, scale: 1 })
    .to({ x: 0, y:-700, scale: .1 }, 4000)
    .onUpdate((coords) => {  
      earth.position.x = coords.x;
      earth.position.y = coords.y;
    })
    .easing(TWEEN.Easing.Quadratic.InOut)
    .delay(2000);
  earthTween.start();
    
  const moonTween = new TWEEN.Tween({ x: 25, y: 25})
    .to({ x: 0, y:-650}, 4000)
    .onUpdate((coords) => {
      moon.position.x = coords.x;
      moon.position.y = coords.y;
    })
    .easing(TWEEN.Easing.Quadratic.InOut)
    .delay(2000);
  moonTween.start();
  const neoTexture = new THREE.TextureLoader().load( 'images/moon.webp' ); 
  const neoMat = new THREE.MeshPhongMaterial({
    map: neoTexture,
    color: 0x909090,
  }) 

  function createNEO(data){
    const geo = new THREE.SphereGeometry(data.radius, 32, 16)
    const neoMesh = new THREE.Mesh(geo, neoMat)
  
    scene.add(neoMesh)
    neoMesh.position.x = data.x
    neoMesh.position.y = data.y
    neoMesh.userData.data = data.data

    const neoTween = new TWEEN.Tween({x: data.x, y:data.y})
    .to({x: data.targetX, y:data.targetY}, 2000)
    .onUpdate((coords)=> {
      neoMesh.position.x = coords.x
      neoMesh.position.y = coords.y
    })
    .easing(TWEEN.Easing.Quadratic.Out)
    .delay(zoomOutDelay + movementTime -1000)

    neoTween.start()
  }




  neoData.forEach(data => createNEO(data))

}

function showData(data){
  console.log('show data:' , data)
  if (!neoSelected){
    neoSelected = true;
    $('#loading').addClass('hidden')
    $('#text-container').removeClass('hidden')
  }
  if (data.neoName) {
    $("#name-text").text(data.neoName)
    $('#distance-text').text(data.closestLunar)
    $('#size-text').text(data.diameter)
    $('#speed-text').text(data.speedkms)
}
}













getData()






