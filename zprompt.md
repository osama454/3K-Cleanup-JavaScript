Hi, i want to create 3D board game on javascript. To get started I want to be able to throw a 3d cube with collision and have it bounce as a dice when I press the “Roll the dice” button. Then the game should show me on screen what number I rolled. I am a junior web developer and this is my initial code, it is not doing anything when I press the "Roll the dice " button, can you help me fixing it?
```HTML
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>3D Dice Game</title>
  <style>
    body { margin: 0; overflow: hidden; }
    canvas { display: block; }
    #result { position: absolute; top: 10px; left: 10px; color: white; font-size: 24px; }
  </style>
</head>
<body>
  <div id="result">Roll the dice!</div>
  <button id="rollButton" style="position: absolute; top: 10px; right: 10px;">Roll Dice</button>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/cannon-es/0.16.1/cannon-es.min.js"></script>
  <script>
   
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);


    const world = new CANNON.World();
    world.gravity.set(0, -9.82, 0);

 
    const floorShape = new CANNON.Plane();
    const floorBody = new CANNON.Body({ mass: 0 });
    floorBody.addShape(floorShape);
    floorBody.position.set(0, -5, 0);
    floorBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0);
    world.addBody(floorBody);

    const floorGeometry = new THREE.PlaneGeometry(20, 20);
    const floorMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    scene.add(floor);


    const diceGeometry = new THREE.BoxGeometry(1, 1, 1);
    const diceMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff, wireframe: true });
    const dice = new THREE.Mesh(diceGeometry, diceMaterial);
    scene.add(dice);

    const diceShape = new CANNON.Box(new CANNON.Vec3(0.5, 0.5, 0.5));
    const diceBody = new CANNON.Body({ mass: 1 });
    diceBody.addShape(diceShape);
    diceBody.position.set(0, 5, 0);
    diceBody.angularVelocity.set(10, 10, 10);
    diceBody.angularDamping = 0.1;
    world.addBody(diceBody);

  
    camera.position.z = 10;
    camera.position.y = 5;
    camera.lookAt(0, 0, 0);

   
    document.getElementById('rollButton').addEventListener('click', () => {
      diceBody.position.set(0, 5, 0);
      diceBody.velocity.set(0, 0, 0);
      diceBody.angularVelocity.set(Math.random() * 20 - 10, Math.random() * 20 - 10, Math.random() * 20 - 10);
    });

  
    function animate() {
      requestAnimationFrame(animate);

 
      world.step(1 / 60);

    
      dice.position.copy(diceBody.position);
      dice.quaternion.copy(diceBody.quaternion);

    
      renderer.render(scene, camera);
    }

    animate();


    function getDiceNumber() {
      const upVector = new THREE.Vector3(0, 1, 0);
      const diceUp = new THREE.Vector3().applyQuaternion(dice.quaternion);
      const dot = diceUp.dot(upVector);
      if (dot > 0.9) return 1;
      if (dot < -0.9) return 6;
      return Math.floor(Math.random() * 6) + 1;
    }

    
    setInterval(() => {
      const result = getDiceNumber();
      document.getElementById('result').textContent = `You rolled a ${result}`;
    }, 1000);
  </script>
</body>
</html>

```