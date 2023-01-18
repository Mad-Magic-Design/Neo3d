const scene = new THREE.Scene();
scene.add(new THREE.AmbientLight(0x333333));
const spotLight = new THREE.SpotLight( 0xffffff );
spotLight.position.set( 100, 1000, 100 );
const camera = new THREE.PerspectiveCamera( 75, (window.innerWidth/2) / (window.innerHeight/2), 0.1, 2000 );
//const camera = new THREE.PerspectiveCamera( 75, 1, 0.1, 1000 );
const directionalLight = new THREE.DirectionalLight( 0xF4E99B, 1);
scene.add( directionalLight );
directionalLight.position.set(0, -1000, 0)
/*const helper = new THREE.DirectionalLightHelper( directionalLight, 1000000 );
scene.add( helper );
*/
camera.position.z = 1200;

const renderer = new THREE.WebGLRenderer({canvas: space} );
renderer.setSize( window.innerWidth/2, window.innerHeight/2 );
//renderer.setSize( squareSize, squareSize );


let geometry = new THREE.SphereGeometry( 20, 64, 64 );
let material = new THREE.MeshBasicMaterial( { color: 0x287AB8 } );
let texture = new THREE.TextureLoader().load( 'images/earth.jpg' );
material = new THREE.MeshPhongMaterial({
  specular: new THREE.Color('grey'),
  map: texture
})


const earth = new THREE.Mesh( geometry, material );
earth.userData.data = {name: 'earth'}
scene.add( earth );

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

function animate(t) {
  
    requestAnimationFrame( animate );
    TWEEN.update(t);
  
    // update the picking ray with the camera and pointer position
      raycaster.setFromCamera( mouse , camera );
    
  
      // calculate objects intersecting the picking ray
      const intersects = raycaster.intersectObjects( scene.children );
  
      for ( let i = 0; i < intersects.length; i ++ ) {
  
          console.log(intersects[i].object.userData.data)
  
      }
  
  
    renderer.render( scene, camera );
  };
  
  animate();



console.log('ray', raycaster)

function onMouseMove( event ) {

	// calculate pointer position in normalized device coordinates
	// (-1 to +1) for both components

	mouse.x = ( ( event.clientX - renderer.domElement.offsetLeft ) / renderer.domElement.clientWidth ) * 2 - 1;
  mouse.y = - ( ( event.clientY - renderer.domElement.offsetTop ) / renderer.domElement.clientHeight ) * 2 + 1;
  console.log(mouse)

}

window.addEventListener( 'mousemove', onMouseMove );